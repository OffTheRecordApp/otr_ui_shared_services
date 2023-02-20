import angular from "angular";
import imageCompression from "browser-image-compression";
import {
  ConvertPdfToImageModel,
  MediaCreationControllerApi,
} from "@otr-app/shared-backend-generated-client/dist/typescript";
import TypeEnum = ConvertPdfToImageModel.TypeEnum;

type AppFile = {
  fileName: string;
  fileType: string;
  isPdf: boolean;
  rawData: any;
  base64Data: string;
};

export class AppFileHandlerService {
  readonly JPEG_QUALITY_COMPRESSION = 0.75;
  readonly PDF_FILE_TYPE = "application/pdf";

  constructor(
    private $q,
    private $window,
    private mediaCreationControllerApi: MediaCreationControllerApi
  ) {}

  public isFileTypeValid(files) {
    const extension = files[0].file.name.toLowerCase().split(".").pop();
    return !!{ png: 1, jpg: 1, jpeg: 1, pdf: 1 }[extension];
  }

  public getFileType(files) {
    if (!files[0]) {
      return "invalid";
    } else {
      return files[0].file.type === this.PDF_FILE_TYPE ? "pdf" : "image";
    }
  }

  public convertFileToBase64(file: File): Promise<AppFile> {
    const defer = this.$q.defer();
    const jpgPngReader = new FileReader();
    const pdfReader = new FileReader();

    pdfReader.onload = (event: any) => {
      defer.resolve({
        fileName: file.name,
        fileType: file.type,
        isPdf: file.type === this.PDF_FILE_TYPE,
        rawData: event.target.result,
        base64Data: (event.target.result as string).split(",")[1],
      });
    };

    const ext = file.type.split("/")[1];

    jpgPngReader.onload = async () => {
      const fileExt = ext === "jpg" ? "jpeg" : ext;

      const compressedBlob = await imageCompression(file, {
        initialQuality: this.JPEG_QUALITY_COMPRESSION,
        useWebWorker: true,
        maxWidthOrHeight: 3000,
        fileType: fileExt,
      });

      const compressedBlobReader = new FileReader();

      compressedBlobReader.readAsDataURL(compressedBlob);
      compressedBlobReader.onload = (event: any) => {
        defer.resolve({
          fileName: file.name,
          fileType: file.type,
          isPdf: false,
          rawData: event.target.result,
          base64Data: (event.target.result as string).split(",")[1],
        });
      };
    };

    if (ext === "jpeg" || ext === "jpg" || ext === "png") {
      jpgPngReader.readAsArrayBuffer(file);
    } else {
      //pdf and gif
      pdfReader.readAsDataURL(file);
    }

    return defer.promise;
  }

  public convertToBase64(files) {
    const flowFile = files[0];
    return this.convertFileToBase64(flowFile.file);
  }

  public async convertPdfToImage(
    docUrl: string,
    outputDpi?: number
  ): Promise<string> {
    const response = await this.$window.fetch(docUrl);
    const blob = await response.blob();
    const { base64Data } = await this.convertFileToBase64(
      new File([blob], "blob.pdf")
    );
    const { data } =
      await this.mediaCreationControllerApi.convertPdfToImageUsingPOST({
        firstPageOnly: true,
        itemsToConvert: [
          {
            content: base64Data,
            type: TypeEnum.PDF,
          },
        ],
        outputDpi: outputDpi ?? 72,
      });

    return "data:image/jpeg;base64," + data.mediaItems?.[0].content;
  }
}

angular
  .module("app.ui_shared_services")
  .service("AppFileHandlerService", AppFileHandlerService);

AppFileHandlerService.$inject = ["$q", "$window", "MediaCreationControllerApi"];
