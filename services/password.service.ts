import angular from "angular";

export class AppPasswordService {
  constructor(private $log, private otrService) {}

  public async verifyPwdResetToken(token: string) {
    try {
      const response = await this.otrService.verifyPwdResetTokenUsingGET({
        token: token,
      });
      this.$log.debug("successfully verified token: ", response);
      return response.data;
    } catch (error: any) {
      this.$log.error("failed to verify token: ", error);
      if (error.data && error.data.error) {
        throw error.data.error.uiErrorMsg;
      }
      throw "We were unable to verify this token. Please try again.";
    }
  }

  public async sendPwdResetToken(email) {
    try {
      return await this.otrService.sendResetPasswordTokenUsingPOST({
        email: email,
      });
    } catch (error: any) {
      this.$log.error("failed to send token: ", error);
      if (error.data && error.data.error) {
        throw error.data.error.uiErrorMsg;
      }
      throw "Woops! An unexpected error occured. Please try again!";
    }
  }
}

angular
  .module("app.services")
  .service("AppPasswordService", AppPasswordService);

AppPasswordService.$inject = ["$log", "otrService"];
