import angular from "angular";
import '@otr-app/shared-backend-generated-client/dist/typescript/api.module';

angular.module("app.ui_shared_services").constant("ENV", {
  apiEndpoint: "otr-backend-service.otr.com",
});

class BasePathProvider {
  private _domain;
  public setDomain(domain) {
    this._domain = domain;
  }

  public $get = [
    () => {
      return this._domain;
    }
  ];
}

angular.module('app.ui_shared_services').provider('basePath', BasePathProvider);
