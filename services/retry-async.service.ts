import angular from "angular";

export type RetryOptions = {
  delay: number;
  maxAttempts: number;
  isExponentialBackoffOn: boolean;
  // TODO: Add support for these two later
  // isJitterOn?: boolean;
  // errorToRetryPattern?: RegExp;
  excludeFunctionPattern?: RegExp;
};

export class RetryAsyncService {
  private options;
  withOptions(options: RetryOptions): RetryAsyncService {
    this.options = options;
    return this;
  }

  /**
   * Wrap all functions with retry logic in 'obj' whether it's through the first prototype link
   * or without a prototype. This will only retry on 5xx http codes
   *
   * Function names will be excluded based on the excludeFunctionPattern in RetryOptions
   * @param obj
   */
  wrap(obj: any) {
    let functions = Object.getOwnPropertyNames(obj)
      .filter((i) => typeof obj[i] === "function")
      .filter((p) => !this.options.excludeFunctionPattern?.test(p));

    let prototype;
    if (functions.length == 0) {
      prototype = Object.getPrototypeOf(obj);
      let prototypeKeys = Object.keys(prototype);
      prototypeKeys = prototypeKeys.filter(
        (p) => !this.options.excludeFunctionPattern?.test(p)
      );
      functions = prototypeKeys;
    }

    functions.forEach((functionName) => {
      const originalFunction = prototype
        ? prototype[functionName]
        : obj[functionName];

      async function retryWrapper(...args) {
        const actualArgs = Array.prototype.slice.call(args, 1);
        const callback = args[0];

        const options: RetryOptions = obj[functionName].retryOptions;
        let attempts = 0;
        let delay = 0;
        async function attempt(obj, args) {
          try {
            attempts++;
            return await callback.apply(obj, args);
          } catch (e: any) {
            const serverCodePattern = /^5/;
            if (serverCodePattern.test(e.body?.status)) {
              delay = options.isExponentialBackoffOn
                ? options.delay * Math.pow(2, attempts - 1)
                : options.delay;
              console.log("Retrying call in " + delay + "ms");
              return new Promise((resolve, reject) => {
                if (attempts < options.maxAttempts) {
                  setTimeout(async () => {
                    try {
                      const val = await attempt(obj, args);
                      resolve(val);
                    } catch (error) {
                      reject(error);
                    }
                  }, delay);
                } else {
                  e._attempts = attempts;
                  e._lastDelay = delay;
                  reject(e);
                }
              });
            } else {
              throw e;
            }
          }
        }

        return await attempt(obj, actualArgs);
      }

      prototype
        ? (prototype[functionName] = retryWrapper.bind(obj, originalFunction))
        : (obj[functionName] = retryWrapper.bind(obj, originalFunction));

      prototype
        ? (prototype[functionName].retryOptions = this.options)
        : (obj[functionName].retryOptions = this.options);
    });

    return obj;
  }
}

angular
  .module("app.ui_shared_services")
  .service("RetryAsyncService", RetryAsyncService);
RetryAsyncService.$inject = [];
