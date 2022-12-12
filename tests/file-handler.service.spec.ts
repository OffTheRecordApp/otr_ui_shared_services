import angular from "angular";
import { AppFileHandlerService } from "../services/file-handler.service";

describe("file handler service", () => {
  beforeEach(angular.mock.module("app.ui_shared_services"));

  let service: AppFileHandlerService;

  beforeEach(inject((_AppFileHandlerService_) => {
    service = _AppFileHandlerService_;
  }));

  it("should allow various images when isFileTypeValid is called", () => {
    ["png", "jpg", "jpeg", "pdf", "gif", "PDF", "JPG", "PNG", "GIF"].forEach(
      (type) => {
        const files = [{ file: { name: "hello." + type } }];
        expect(service.isFileTypeValid(files)).toBeTrue();
      }
    );
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

  // TODO: add integration test or in memory file to test convertToBase64
});
