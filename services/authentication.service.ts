import angular from "angular";

export class AppAuthenticationService {
  readonly URLS = {
    LOGIN: this.ENV.apiEndpoint + "/api/v1/authentication/login",
    LOGOUT: this.ENV.apiEndpoint + "/api/v1/authentication/logout",
    IMPERSONATE:
      this.ENV.apiEndpoint +
      "/api/v1/login/impersonate?username={username}&code={code}",
  };

  constructor(private ENV, private $http, private $log) {}

  public async impersonateUser(username, authCode) {
    this.$log.debug("Attempting to impersonate user: ", username);

    let endpoint = this.URLS.IMPERSONATE.replace(
      "{username}",
      encodeURIComponent(username)
    );
    endpoint = endpoint.replace("{code}", authCode);
    return await this.$http.get(endpoint, { withCredentials: true });
  }

  public async login(username, password) {
    this.$log.debug("Attempting to login user: ", username);

    const response = await this.$http.post(
      this.URLS.LOGIN +
        "?username=" +
        encodeURIComponent(username) +
        "&password=" +
        encodeURIComponent(password),
      { withCredentials: true }
    );
    this.$log.debug("Login was successful: ", response);
    return response.data;
  }

  public async logout() {
    this.$log.debug("Attempting to logout current user.");
    return await this.$http.post(this.URLS.LOGOUT, { withCredentials: true });
  }
}

angular
  .module("app.ui_shared_services")
  .service("AppAuthenticationService", AppAuthenticationService);

AppAuthenticationService.$inject = ["ENV", "$http", "$log"];
