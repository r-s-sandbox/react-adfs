// eslint-disable-next-line
import React from "react";
import AuthenticationContext_ from "./adfs";

const isSSR = typeof window === "undefined";

//fake context on SSR
export const AuthenticationContext = isSSR ? () => {} : AuthenticationContext_;

export function adfsGetToken(authContext, resourceGuiId) {
  return new Promise((resolve, reject) => {
    authContext.acquireToken(resourceGuiId, (message, token, msg) => {
      if (!msg) {
        resolve(token);
      } else reject({ message, msg }); // eslint-disable-line
    });
  });
}

export function runWithAdfs(authContext, app, doNotLogin) {
  if (isSSR) {
    if (doNotLogin) app();
    return;
  }

  authContext.handleWindowCallback();

  if (window === window.parent) {
    if (!authContext.isCallback(window.location.search)) {
      if (
        !authContext.getCachedToken(authContext.config.clientId) ||
        !authContext.getCachedUser()
      ) {
        if (doNotLogin) {
          app();
        } else {
          authContext.login();
        }
      } else {
        app();
      }
    }
  }
}

export function adfsFetch(authContext, resourceGuiId, fetch, url, options) {
  return adfsGetToken(authContext, resourceGuiId).then(token => {
    const o = options || {};
    if (!o.headers) o.headers = {};
    o.headers.Authorization = `Bearer ${token}`;
    return fetch(url, o);
  });
}
