import angular from "angular";
import { AppCredentialsService } from "../services/credentials.service";

describe("credentials service", () => {
  beforeEach(angular.mock.module("app.ui_shared_services"));
  beforeEach(() => {
    angular.mock.module(($provide) => {
      $provide.service("otrService", () => {
        return jasmine.createSpyObj("otrService", [
          "getAwsCredentialsUsingPOST",
        ]);
      });
    });
  });
  let service: AppCredentialsService, otrService;

  beforeEach(inject((_otrService_, _AppCredentialsService_) => {
    service = _AppCredentialsService_;
    otrService = _otrService_;
  }));

  it("should not call service when cache is available", async () => {
    // arrange
    service.cache["KEY_1"] = "value";

    // execute
    await service.getCredentials("KEY_1");

    // verify
    expect(otrService.getAwsCredentialsUsingPOST).not.toHaveBeenCalled();
  });

  it("should call service when cache is not available", async () => {
    // arrange
    otrService.getAwsCredentialsUsingPOST.and.resolveTo({
      data: "credentials",
    });

    // execute
    await service.getCredentials("KEY_1");

    // verify
    expect(service.cache["KEY_1"]).toEqual("credentials");
    expect(otrService.getAwsCredentialsUsingPOST).toHaveBeenCalledWith({
      request: {
        keyName: "KEY_1",
      },
    });
  });
});
