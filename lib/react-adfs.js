"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adfsGetToken = adfsGetToken;
exports.runWithAdfs = runWithAdfs;
exports.adfsFetch = adfsFetch;
exports.AuthenticationContext = void 0;

var _react = _interopRequireDefault(require("react"));

var _adfs = _interopRequireDefault(require("./adfs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// eslint-disable-next-line
var isSSR = typeof window === "undefined"; //fake context on SSR

var AuthenticationContext = isSSR ? function () {} : _adfs["default"];
exports.AuthenticationContext = AuthenticationContext;

function adfsGetToken(authContext, resourceGuiId) {
  return new Promise(function (resolve, reject) {
    authContext.acquireToken(resourceGuiId, function (message, token, msg) {
      if (!msg) {
        resolve(token);
      } else reject({
        message: message,
        msg: msg
      }); // eslint-disable-line

    });
  });
}

function runWithAdfs(authContext, app, doNotLogin) {
  if (isSSR) {
    if (doNotLogin) app();
    return;
  }

  authContext.handleWindowCallback();

  if (window === window.parent) {
    if (!authContext.isCallback(window.location.search)) {
      if (!authContext.getCachedToken(authContext.config.clientId) || !authContext.getCachedUser()) {
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

function adfsFetch(authContext, resourceGuiId, fetch, url, options) {
  return adfsGetToken(authContext, resourceGuiId).then(function (token) {
    var o = options || {};
    if (!o.headers) o.headers = {};
    o.headers.Authorization = "Bearer ".concat(token);
    return fetch(url, o);
  });
}