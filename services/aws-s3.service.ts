import angular from "angular";
import AWS from "aws-sdk";
import { AppCredentialsService } from "./credentials.service";

export class AppAwsS3Service {
  readonly bucketRegex = /http.?:\/\/([-\w]+).*.com/;
  readonly keyRegex = /s3.amazonaws.com\/(.*)/;

  public s3Client?;
  private isFirstLoad = true;

  constructor(
    private $q,
    private $log,
    private AppCredentialsService: AppCredentialsService,
    private $window
  ) {
    AWS.config.apiVersions = {
      s3: "2006-03-01",
    };
  }

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

  public setCredentials(options) {
    const creds = options.credentials;
    const awsCreds = new AWS.Credentials({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretKey,
    });
    this.s3Client = new AWS.S3({ credentials: awsCreds });
  }

  public getSignedUrlInternal(options) {
    const defer = this.$q.defer();
    const imageUrl = options.imageUrl;

    const bucketMatches = this.bucketRegex.exec(imageUrl);
    const bucketName = bucketMatches ? bucketMatches[1] : null;
    const keyMatches = this.keyRegex.exec(imageUrl);
    const keyName = keyMatches ? keyMatches[1] : null;

    const params = {
      Bucket: bucketName,
      Key: keyName,
    };

    this.s3Client.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        this.$log.error("error is: ", err);
        defer.reject(err);
      } else {
        defer.resolve(url);
      }
    });
    return defer.promise;
  }
}

angular
  .module("app.ui_shared_services")
  .service("AppAwsS3Service", AppAwsS3Service);

AppAwsS3Service.$inject = ["$q", "$log", "AppCredentialsService", "$window"];
