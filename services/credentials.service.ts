import angular from "angular";
import {AwsCredentialsControllerApi} from "@otr-app/shared-backend-generated-client/dist/typescript";

export class AppCredentialsService {
  public cache: any = {};

  constructor(private $q, private $log, private awsCredentialsControllerApi: AwsCredentialsControllerApi) {}

  public async getCredentials(key) {
    const params = {
      request: {
        keyName: key,
      },
    };

    if (this.cache[key]) {
      this.$log.debug("CACHE HIT, ever?");
      return this.cache[key];
    } else {
      const response = await this.awsCredentialsControllerApi.getAwsCredentialsUsingPOST({
        keyName: key
      });
      this.cache[key] = response.data;
      return response.data;
    }
  }
}

angular
  .module("app.ui_shared_services")
  .service("AppCredentialsService", AppCredentialsService);

AppCredentialsService.$inject = ["$q", "$log", "AwsCredentialsControllerApi"];
