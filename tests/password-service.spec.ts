import angular from "angular";
import { AppPasswordService } from "../services/password.service";

describe("password service", () => {
  beforeEach(angular.mock.module("app.services"));

  let service: AppPasswordService, otrService;

  beforeEach(() => {
    angular.mock.module(($provide) => {
      $provide.service("otrService", function () {
        return jasmine.createSpyObj("otrService", [
          "verifyPwdResetTokenUsingGET",
          "sendResetPasswordTokenUsingPOST",
        ]);
      });
    });
  });
  beforeEach(inject((_otrService_, _AppPasswordService_) => {
    otrService = _otrService_;
    service = _AppPasswordService_;
  }));

  it("should return data when verifyPwdResetToken succeeds", async () => {
    // arrange
    otrService.verifyPwdResetTokenUsingGET.and.resolveTo({
      data: { isValid: true },
    });

    // execute
    const data = await service.verifyPwdResetToken("token");

    // verify
    expect(data).toEqual({ isValid: true });
    expect(otrService.verifyPwdResetTokenUsingGET).toHaveBeenCalledWith({
      token: "token",
    });
  });

  it("should return data when sendPwdResetToken succeeds", async () => {
    // arrange
    otrService.sendResetPasswordTokenUsingPOST.and.resolveTo({
      data: {},
    });

    // execute
    const data = await service.sendPwdResetToken("homer@simpson.com");

    // verify
    expect(data).toEqual({ data: {} });
    expect(otrService.sendResetPasswordTokenUsingPOST).toHaveBeenCalledWith({
      email: "homer@simpson.com",
    });
  });
});
