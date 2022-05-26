import angular from "angular";
import "angular-mocks";

import { AppAuthenticationService } from "../services/authentication.service";

describe("authentication service", () => {
  beforeEach(angular.mock.module("app.ui_shared_services"));
  let service: AppAuthenticationService, ENV, $http;

  beforeEach(inject((_$http_, _AppAuthenticationService_) => {
    $http = _$http_;
    service = _AppAuthenticationService_;
  }));

  it("should impersonate when impersonateUser succeeds", async () => {
    // arrange
    spyOn($http, "get");

    // execute
    await service.impersonateUser("sideshowbob@gmail.com", "123456");

    // verify
    expect($http.get).toHaveBeenCalledWith(
      jasmine.stringContaining(
        "/api/v1/login/impersonate?username=sideshowbob%40gmail.com&code=123456"
      ),
      { withCredentials: true }
    );
  });

  it("should return data when login succeeds", async () => {
    // arrange
    spyOn($http, "post").and.resolveTo({
      data: { userId: 1 },
    });

    // execute
    const response = await service.login("sideshowbob@gmail.com", "abcd");

    // verify
    expect(response).toEqual({ userId: 1 });
    expect($http.post).toHaveBeenCalledWith(
      jasmine.stringContaining(
        "/api/v1/authentication/login?username=sideshowbob%40gmail.com&password=abcd"
      ),
      { withCredentials: true }
    );
  });

  it("should post logout when logout succeeds", async () => {
    // arrange
    spyOn($http, "post");

    // execute
    await service.logout();

    // verify
    expect($http.post).toHaveBeenCalledWith(
      jasmine.stringContaining("/api/v1/authentication/logout"),
      { withCredentials: true }
    );
  });
});
