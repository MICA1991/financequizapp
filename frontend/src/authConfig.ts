import { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL configuration
// TODO: Replace with actual Azure AD app client ID and tenant ID
// For now, using a demo configuration that will show an error but allow testing
export const msalConfig: Configuration = {
  auth: {
    clientId: "1cac6d94-6db9-4543-9b11-df04447d8265", // Your actual client ID from Azure AD
    authority: "https://login.microsoftonline.com/c0ad4574-ffd0-4a1e-8768-9623f647c978", // Your tenant ID in full URL format
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0:
            console.error(message);
            return;
          case 1:
            console.warn(message);
            return;
          case 2:
            console.info(message);
            return;
          case 3:
            console.debug(message);
            return;
          default:
            console.log(message);
            return;
        }
      },
    },
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "email", "profile"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
}; 