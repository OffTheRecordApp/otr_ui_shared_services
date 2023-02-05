import angular from "angular";
import { AppCredentialsService } from "../services/credentials.service";
import {AwsCredentialsControllerApi} from "@otr-app/shared-backend-generated-client/dist/typescript";

describe("credentials service", () => {
  beforeEach(angular.mock.module("app.ui_shared_services"));
  let service: AppCredentialsService, awsCredentialsControllerApi;

  beforeEach(inject((_AwsCredentialsControllerApi_, _AppCredentialsService_) => {
    service = _AppCredentialsService_;
    awsCredentialsControllerApi = _AwsCredentialsControllerApi_;
  }));

  it("should not call service when cache is available", async () => {
    // arrange
    service.cache["KEY_1"] = "value";
    spyOn(awsCredentialsControllerApi, "getAwsCredentialsUsingPOST");
    // execute
    await service.getCredentials("KEY_1");

    // verify
    expect(awsCredentialsControllerApi.getAwsCredentialsUsingPOST).not.toHaveBeenCalled();
  });

  it("should call service when cache is not available", async () => {
    // arrange
    spyOn(awsCredentialsControllerApi, "getAwsCredentialsUsingPOST").and.resolveTo({
      data: "credentials",
    });

    // execute
    await service.getCredentials("KEY_1");

    // verify
    expect(service.cache["KEY_1"]).toEqual("credentials");
    expect(awsCredentialsControllerApi.getAwsCredentialsUsingPOST).toHaveBeenCalledWith({
        keyName: "KEY_1",
      },
    );
  });
});
