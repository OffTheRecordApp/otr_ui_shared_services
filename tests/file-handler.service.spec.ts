import angular from "angular";
import { AppFileHandlerService } from "../services/file-handler.service";
import { MediaCreationControllerApi } from "@otr-app/shared-backend-generated-client/dist/typescript";

describe("file handler service", () => {
  beforeEach(angular.mock.module("app.ui_shared_services"));

  let service: AppFileHandlerService;
  let $window;
  let mediaCreationControllerApi: MediaCreationControllerApi;

  beforeEach(() => {
    angular.mock.module(($provide) => {
      $provide.service("$window", function () {
        return jasmine.createSpyObj("$window", ["fetch"]);
      });

      $provide.service("MediaCreationControllerApi", function () {
        return jasmine.createSpyObj("MediaCreationControllerApi", [
          "convertPdfToImageUsingPOST",
        ]);
      });
    });
  });

  beforeEach(inject((
    _$window_,
    _MediaCreationControllerApi_,
    _AppFileHandlerService_
  ) => {
    service = _AppFileHandlerService_;
    $window = _$window_;
    mediaCreationControllerApi = _MediaCreationControllerApi_;
  }));

  it("should allow various images when isFileTypeValid is called", () => {
    ["png", "jpg", "jpeg", "pdf", "PDF", "JPG", "PNG"].forEach((type) => {
      const files = [{ file: { name: "hello." + type } }];
      expect(service.isFileTypeValid(files)).toBeTrue();
    });
  });

  it("should not allow gzip when isFileTypeValid is called", () => {
    ["gzip"].forEach((type) => {
      const files = [{ file: { name: "hello." + type } }];
      expect(service.isFileTypeValid(files)).toBeFalse();
    });
  });

  it("should return image when getFileType is called", () => {
    // execute
    const fileType = service.getFileType([{ file: { type: "image/jpeg" } }]);

    //verify
    expect(fileType).toEqual("image");
  });

  it("should return invalid when getFileType is called", () => {
    // execute
    const fileType = service.getFileType([]);

    //verify
    expect(fileType).toEqual("invalid");
  });

  it("should return pdf when getFileType is called", () => {
    // execute
    const fileType = service.getFileType([
      { file: { type: "application/pdf" } },
    ]);

    //verify
    expect(fileType).toEqual("pdf");
  });

  it("should return data uri when convertPdfToImage succeeds", async () => {
    const docUrl = "http://service.fire.com/doc.pdf";
    $window.fetch.and.resolveTo({ blob: () => {} });
    spyOn(service, "convertFileToBase64").and.resolveTo({
      base64Data: "ASASAS",
      fileName: "dummy.pdf",
      fileType: "PDF",
      isPdf: true,
      rawData: null,
    });

    (
      mediaCreationControllerApi.convertPdfToImageUsingPOST as any
    ).and.resolveTo({
      data: {
        mediaItems: [
          {
            content: "JPEG_DATA",
          },
        ],
      },
    });

    // execute
    let dataUri = await service.convertPdfToImage(docUrl);

    expect(dataUri).toEqual("data:image/jpeg;base64,JPEG_DATA");
  });

  // TODO: add integration test or in memory file to test convertToBase64
});
