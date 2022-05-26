import angular from "angular";

export class AppCredentialsService {
  public cache: any = {};

  constructor(private $q, private $log, private otrService) {}

  public async getCredentials(key: string) {
    const params = {
      request: {
        keyName: key,
      },
    };

    if (this.cache[key]) {
      this.$log.debug("CACHE HIT, ever?");
      return this.cache[key];
    } else {
      const response = await this.otrService.getAwsCredentialsUsingPOST(params);
      this.cache[key] = response.data;
      return response.data;
    }
  }
}

angular
  .module("app.ui_shared_services")
  .service("AppCredentialsService", AppCredentialsService);

AppCredentialsService.$inject = ["$q", "$log", "otrService"];
