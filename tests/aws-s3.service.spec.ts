import angular from "angular";
import "angular-mocks";
import { AppCredentialsService } from "../services/credentials.service";
import { AppAwsS3Service } from "../services/aws-s3.service";

describe("aws s3 service", () => {
  let service: AppAwsS3Service,
    $window,
    AppCredentialsService: AppCredentialsService;

  beforeEach(angular.mock.module("app.ui_shared_services"));
  beforeEach(() => {
    angular.mock.module(($provide) => {
      $provide.service("$window", function () {
        return jasmine.createSpyObj("$window", ["open"]);
      });

      $provide.service("AppCredentialsService", function () {
        return jasmine.createSpy();
      });

      $provide.service("AWS", function () {
        // @ts-ignore
        this.S3 = jasmine.createSpy("S3");
        // @ts-ignore
        this.Credentials = jasmine.createSpy("Credentials");
      });
    });
  });

  beforeEach(inject((_$window_, _AppCredentialsService_, _AppAwsS3Service_) => {
    $window = _$window_;
    AppCredentialsService = _AppCredentialsService_;
    service = _AppAwsS3Service_;

    service.setCredentials({
      credentials: { accessKeyId: "key", secretKey: "secret" },
    });
  }));

  it("should return same url if S3 key does not match", async () => {
    // arrange
    spyOn(service, "getSignedUrlInternal");

    // execute
    let url = await service.getSignedUrl("https://amazon.com");

    // verify
    expect(url).toEqual("https://amazon.com");
    expect(service.getSignedUrlInternal).not.toHaveBeenCalled();
  });

  it("should return sign url if S3 key does not match", async () => {
    // arrange
    spyOn(service, "getSignedUrlInternal").and.resolveTo("http://signurl.com");

    // execute
    let signedUrl = await service.getSignedUrl(
      "https://otr-assets.s3.amazonaws.com/img/logos/full-logo-v2.png",
      true
    );

    expect(signedUrl).toEqual("http://signurl.com");
    expect($window.open).toHaveBeenCalledWith("http://signurl.com", "_blank");
    expect(service.getSignedUrlInternal).toHaveBeenCalled();
  });

  it("should get a signed url if provided image url is valid", () => {
    // arrange
    spyOn(service.s3Client, "getSignedUrl");

    const params = {
      imageUrl:
        "https://otr-assets.s3.amazonaws.com/img/logos/full-logo-v2.png",
    };

    // execute
    service.getSignedUrlInternal(params);
    // expect
    expect(service.s3Client.getSignedUrl).toHaveBeenCalledWith(
      "getObject",
      {
        Bucket: "otr-assets",
        Key: "img/logos/full-logo-v2.png",
      },
      jasmine.any(Function)
    );
  });
});
