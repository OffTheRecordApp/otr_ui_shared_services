# How to use
1. Import into bundle (e.g. index.ts)
    ```typescript
    import '@otr-app/ui-shared-services';
    ```
2. Add to list of module dependencies (e.g. app.ts, application.ts)
    ```typescript
    angular.module('...',
       ['app.ui_shared_services', '...', '...']
    )
    ```
   ### Example of using a shared service

   ```typescript
   import { AppAuthenticationService } from '@otr-app/ui-shared-services';
   
   class SomeComponent {
       constructor(private AppAuthenticationService: AppAuthenticationService) {}
       
       async login() {
           return await AppAuthenticationService.login('email', 'password');
       }
   }

   SomeComponent.$inject = ['AppAuthenticationService'];
   ```
## Services in this package
* AppAuthenticationService
* AppAwsS3Services
* AppFileHandlerService
* AppCredentialsService
* RetryAsyncService
