import angular from "angular";
import {
  RetryAsyncService,
  RetryOptions,
} from "../services/retry-async.service";

describe("retry service", () => {
  beforeEach(angular.mock.module("app.ui_shared_services"));

  let retryService: RetryAsyncService;

  beforeEach(inject((_RetryAsyncService_) => {
    retryService = _RetryAsyncService_;
  }));

  it("should not retry when call is successful", async () => {
    const retryOptions: RetryOptions = {
      maxAttempts: 3,
      delay: 500,
      isExponentialBackoffOn: true,
    };

    let obj = {
      increment: async (num) => {
        return Promise.resolve(++num);
      },
    };
    obj = retryService.withOptions(retryOptions).wrap(obj);

    const actual = await obj.increment(1);
    expect(actual).toEqual(2);
  });

  it("should retry when increment call fails with 5XX", async () => {
    const retryOptions: RetryOptions = {
      maxAttempts: 3,
      delay: 500,
      isExponentialBackoffOn: true,
    };

    let obj = {
      increment: async (num) => {
        throw { body: { status: 503 } };
      },
    };
    obj = retryService.withOptions(retryOptions).wrap(obj);

    try {
      await obj.increment(1);
    } catch (e: any) {
      expect(e._attempts).not.toBeNull();
      expect(e._attempts).toEqual(retryOptions.maxAttempts);
      expect(e._lastDelay).toEqual(2000);
      expect(e.body.status).toEqual(503);
    }
  });

  it("should not retry when increment call fails with 400", async () => {
    const retryOptions: RetryOptions = {
      maxAttempts: 3,
      delay: 500,
      isExponentialBackoffOn: true,
    };

    let obj = {
      increment: async (num) => {
        throw { body: { status: 400 } };
      },
    };
    obj = retryService.withOptions(retryOptions).wrap(obj);

    try {
      await obj.increment(1);
    } catch (e: any) {
      expect(e._attempts).toBeUndefined();
      expect(e._lastDelay).toBeUndefined();
      expect(e.body.status).toEqual(400);
    }
  });
});
