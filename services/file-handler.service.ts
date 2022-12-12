import angular from "angular";
import imageCompression from "browser-image-compression";

export class AppFileHandlerService {
  readonly JPEG_QUALITY_COMPRESSION = 0.75;
  readonly PDF_FILE_TYPE = "application/pdf";

  constructor(private $q) {}

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

  public convertToBase64(files) {
    const defer = this.$q.defer();
    const jpgPngReader = new FileReader();
    const pdfReader = new FileReader();
    const flowFile = files[0];

    pdfReader.onload = (event: any) => {
      defer.resolve({
        fileName: flowFile.name,
        fileType: flowFile.file.type,
        isPdf: flowFile.file.type === this.PDF_FILE_TYPE,
        rawData: event.target.result,
        base64Data: (event.target.result as string).split(",")[1],
      });
    };

    jpgPngReader.onload = async () => {
      const fileExt =
        flowFile.getExtension() === "jpg" ? "jpeg" : flowFile.getExtension();

      const compressedBlob = await imageCompression(flowFile.file, {
        initialQuality: this.JPEG_QUALITY_COMPRESSION,
        useWebWorker: true,
        maxWidthOrHeight: 3000,
        fileType: fileExt,
      });

      const compressedBlobReader = new FileReader();

      compressedBlobReader.readAsDataURL(compressedBlob);
      compressedBlobReader.onload = (event: any) => {
        defer.resolve({
          fileName: flowFile.name,
          fileType: flowFile.file.type,
          isPdf: false,
          rawData: event.target.result,
          base64Data: (event.target.result as string).split(",")[1],
        });
      };
    };

    const ext = flowFile.file.type.split("/")[1];

    if (ext === "jpeg" || ext === "jpg" || ext === "png") {
      jpgPngReader.readAsArrayBuffer(flowFile.file);
    } else {
      //pdf and gif
      pdfReader.readAsDataURL(flowFile.file);
    }

    return defer.promise;
  }
}

angular
  .module("app.ui_shared_services")
  .service("AppFileHandlerService", AppFileHandlerService);

AppFileHandlerService.$inject = ["$q"];
