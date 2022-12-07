import angular from "angular";
import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppCredentialsService } from "./credentials.service";

export class AppAwsS3Service {
  readonly bucketRegex = /http.?:\/\/([-\w]+).*.com/;
  readonly keyRegex = /s3.amazonaws.com\/(.*)/;
  readonly defaultRegion = "us-west-2";
  readonly defaultApiVersion = "2006-03-01";

  public s3Client?;
  private isFirstLoad = true;

  constructor(
    private $q,
    private $log,
    private AppCredentialsService: AppCredentialsService,
    private $window
  ) {}

  public async getSignedUrl(url, triggerNewWindow?) {
    if (!this.keyRegex.exec(url)) {
      return url;
    } else {
      try {
        await this.checkCredentials();
        let signedUrl = await this.getSignedUrlInternal({ imageUrl: url });
        if (triggerNewWindow === true) {
          this.$window.open(signedUrl, "_blank");
        }
        return signedUrl;
      } catch (error) {
        this.$log.error("Failed to set credentials: ", error);
        throw error;
      }
    }
  }

  private async checkCredentials() {
    if (!this.s3Client) {
      const response = await this.AppCredentialsService.getCredentials(
        "S3_CITATION_IMAGES_RO"
      );
      this.setCredentials({ credentials: response });
      this.isFirstLoad = false;
    }
  }

  public setCredentials(options: {
    credentials: { accessKeyId: string; secretKey: string };
    region?: string;
    apiVersion?: string;
  }) {
    const creds = options.credentials;
    const awsCreds = {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretKey,
    };
    this.s3Client = new S3Client({
      apiVersion: options.apiVersion ?? this.defaultApiVersion,
      credentials: awsCreds,
      region: options.region ?? this.defaultRegion,
    });
    return this.s3Client;
  }

  public async getSignedUrlInternal(options) {
    const imageUrl = options.imageUrl;

    const bucketMatches = this.bucketRegex.exec(imageUrl) ?? [""];
    const bucketName = bucketMatches[1];
    const keyMatches = this.keyRegex.exec(imageUrl) ?? [""];
    const keyName = keyMatches[1];

    const params: GetObjectCommandInput = {
      Bucket: bucketName,
      Key: keyName,
    };

    const command = new GetObjectCommand(params);

    try {
      const url = await getSignedUrl(this.s3Client, command);
      return url;
    } catch (err) {
      this.$log.error("error is: ", err);
      throw `Unable to get signed URL: ${err}`;
    }
  }
}

angular
  .module("app.ui_shared_services")
  .service("AppAwsS3Service", AppAwsS3Service);

AppAwsS3Service.$inject = ["$q", "$log", "AppCredentialsService", "$window"];
