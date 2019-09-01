"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _AuthenticationContext = function () {
  'use strict';
  /**
   * Configuration options for Authentication Context.
   * @class config
   *  @property {string} tenant - Your target tenant.
   *  @property {string} clientId - Client ID assigned to your app by Azure Active Directory.
   *  @property {string} redirectUri - Endpoint at which you expect to receive tokens. Defaults to `window.location.href`.
   *  @property {string} instance - Azure Active Directory Instance. Defaults to `https://login.microsoftonline.com/`.
   *  @property {Array} endpoints - Collection of {Endpoint-ResourceId} used for automatically attaching tokens in webApi calls.
   *  @property {Boolean} popUp - Set this to true to enable login in a popup window instead of a full redirect. Defaults to `false`.
   *  @property {string} localLoginUrl - Set this to redirect the user to a custom login page.
   *  @property {function} displayCall - User defined function of handling the navigation to Azure AD authorization endpoint in case of login. Defaults to 'null'.
   *  @property {string} postLogoutRedirectUri - Redirects the user to postLogoutRedirectUri after logout. Defaults is 'redirectUri'.
   *  @property {string} cacheLocation - Sets browser storage to either 'localStorage' or sessionStorage'. Defaults to 'sessionStorage'.
   *  @property {Array.<string>} anonymousEndpoints Array of keywords or URI's. Adal will not attach a token to outgoing requests that have these keywords or uri. Defaults to 'null'.
   *  @property {number} expireOffsetSeconds If the cached token is about to be expired in the expireOffsetSeconds (in seconds), Adal will renew the token instead of using the cached token. Defaults to 300 seconds.
   *  @property {string} correlationId Unique identifier used to map the request with the response. Defaults to RFC4122 version 4 guid (128 bits).
   *  @property {number} loadFrameTimeout The number of milliseconds of inactivity before a token renewal response from AAD should be considered timed out.
   */

  /**
   * Creates a new AuthenticationContext object.
   * @constructor
   * @param {config}  config               Configuration options for AuthenticationContext
   */

  _AuthenticationContext = function AuthenticationContext(config) {
    /**
     * Enum for request type
     * @enum {string}
     */
    this.REQUEST_TYPE = {
      LOGIN: 'LOGIN',
      RENEW_TOKEN: 'RENEW_TOKEN',
      UNKNOWN: 'UNKNOWN'
    };
    this.RESPONSE_TYPE = {
      ID_TOKEN_TOKEN: 'code',
      TOKEN: 'token'
    };
    /**
     * Enum for storage constants
     * @enum {string}
     */

    this.CONSTANTS = {
      ACCESS_TOKEN: 'access_token',
      EXPIRES_IN: 'expires_in',
      ID_TOKEN: 'id_token',
      REFRESH_TOKEN: 'refresh_token',
      REFRESH_TOKEN_EXPIRES_IN: 'refresh_token_expires_in',
      CODE: '?code',
      ERROR_DESCRIPTION: 'error_description',
      SESSION_STATE: 'session_state',
      ERROR: 'error',
      STORAGE: {
        TOKEN_KEYS: 'adfs.token.keys',
        ACCESS_TOKEN_KEY: 'adfs.access.token.key',
        REFRESH_TOKEN_KEY: 'adfs.refresh.token.key',
        EXPIRATION_KEY: 'adfs.expiration.key',
        REFRESH_TOKEN_EXPIRATION_KEY: 'adfs.refresh.token.expiration.key',
        STATE_LOGIN: 'adfs.state.login',
        STATE_RENEW: 'adfs.state.renew',
        NONCE_IDTOKEN: 'adfs.nonce.idtoken',
        SESSION_STATE: 'adfs.session.state',
        USERNAME: 'adfs.username',
        IDTOKEN: 'adfs.idtoken',
        ERROR: 'adfs.error',
        ERROR_DESCRIPTION: 'adfs.error.description',
        LOGIN_REQUEST: 'adfs.login.request',
        LOGIN_ERROR: 'adfs.login.error',
        RENEW_STATUS: 'adfs.token.renew.status',
        ANGULAR_LOGIN_REQUEST: 'adfs.angular.login.request'
      },
      RESOURCE_DELIMETER: '|',
      CACHE_DELIMETER: '||',
      TOKEN_RENEW_STATUS_CANCELED: 'Canceled',
      TOKEN_RENEW_STATUS_COMPLETED: 'Completed',
      TOKEN_RENEW_STATUS_IN_PROGRESS: 'In Progress',
      LOGGING_LEVEL: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        VERBOSE: 3
      },
      LEVEL_STRING_MAP: {
        0: 'ERROR:',
        1: 'WARNING:',
        2: 'INFO:',
        3: 'VERBOSE:'
      }
    };

    if (_AuthenticationContext.prototype._singletonInstance) {
      return _AuthenticationContext.prototype._singletonInstance;
    }

    _AuthenticationContext.prototype._singletonInstance = this; // public

    this.instance = 'https://login.microsoftonline.com/';
    this.resource = null;
    this.config = {};
    this.callback = null;
    this.popUp = false; // private

    this._user = null;
    this._activeRenewals = {};
    this._loginInProgress = false;
    this._acquireTokenInProgress = false;
    this._renewStates = [];
    this._callBackMappedToRenewStates = {};
    this._callBacksMappedToRenewStates = {};
    this._openedWindows = [];
    this._requestType = this.REQUEST_TYPE.LOGIN;
    window._adfsInstance = this; // validate before constructor assignments

    if (config.displayCall && typeof config.displayCall !== 'function') {
      throw new Error('displayCall is not a function');
    }

    if (!config.clientId) {
      throw new Error('clientId is required');
    }

    this.config = this._cloneConfig(config);
    if (this.config.navigateToLoginRequestUrl === undefined) this.config.navigateToLoginRequestUrl = true;
    if (this.config.popUp) this.popUp = true;
    if (this.config.callback && typeof this.config.callback === 'function') this.callback = this.config.callback;

    if (this.config.instance) {
      this.instance = this.config.instance;
    }

    if (this.config.resource) {
      this.resource = this.config.resource;
    } // App can request idtoken for itself using clientid as resource


    if (!this.config.loginResource) {
      this.config.loginResource = this.config.clientId;
    } // redirect and logout_redirect are set to current location by default


    if (!this.config.redirectUri) {
      // strip off query parameters or hashes from the redirect uri as AAD does not allow those.
      this.config.redirectUri = window.location.href.split("?")[0].split("#")[0];
    }

    if (!this.config.postLogoutRedirectUri) {
      // strip off query parameters or hashes from the post logout redirect uri as AAD does not allow those.
      this.config.postLogoutRedirectUri = window.location.href.split("?")[0].split("#")[0];
    }

    if (!this.config.anonymousEndpoints) {
      this.config.anonymousEndpoints = [];
    }
  };

  if (typeof window !== 'undefined') {
    window.Logging = {
      piiLoggingEnabled: false,
      level: 0,
      log: function log(message) {}
    };
  }
  /**
   * Initiates the login process by redirecting the user to Azure AD authorization endpoint.
   */


  _AuthenticationContext.prototype.login = function () {
    if (this._loginInProgress) {
      this.info("Login in progress");
      return;
    }

    this._loginInProgress = true; // Token is not present and user needs to login

    var expectedState = this._guid();

    this.config.state = expectedState;
    this._idTokenNonce = this._guid();

    var loginStartPage = this._getItem(this.CONSTANTS.STORAGE.ANGULAR_LOGIN_REQUEST);

    if (!loginStartPage || loginStartPage === "") {
      loginStartPage = window.location.href;
    } else {
      this._saveItem(this.CONSTANTS.STORAGE.ANGULAR_LOGIN_REQUEST, "");
    }

    this.verbose('Expected state: ' + expectedState + ' startPage:' + loginStartPage);

    this._saveItem(this.CONSTANTS.STORAGE.LOGIN_REQUEST, loginStartPage);

    this._saveItem(this.CONSTANTS.STORAGE.LOGIN_ERROR, '');

    this._saveItem(this.CONSTANTS.STORAGE.STATE_LOGIN, expectedState, true);

    this._saveItem(this.CONSTANTS.STORAGE.NONCE_IDTOKEN, this._idTokenNonce, true);

    this._saveItem(this.CONSTANTS.STORAGE.ERROR, '');

    this._saveItem(this.CONSTANTS.STORAGE.ERROR_DESCRIPTION, '');

    var urlNavigate = this._getNavigateUrl('code', this.resource) + '&nonce=' + encodeURIComponent(this._idTokenNonce);

    if (this.config.displayCall) {
      // User defined way of handling the navigation
      this.config.displayCall(urlNavigate);
    } else {
      this.promptUser(urlNavigate);
    }
  };

  _AuthenticationContext.prototype.loginInProgress = function () {
    return this._loginInProgress;
  };
  /**
   * Checks for the resource in the cache. By default, cache location is Session Storage
   * @ignore
   * @returns {Boolean} 'true' if login is in progress, else returns 'false'.
   */


  _AuthenticationContext.prototype._hasResource = function (key) {
    var keys = this._getItem(this.CONSTANTS.STORAGE.TOKEN_KEYS);

    return keys && !this._isEmpty(keys) && keys.indexOf(key + this.CONSTANTS.RESOURCE_DELIMETER) > -1;
  };
  /**
   * Gets token for the specified resource from the cache.
   * @param {string}   resource A URI that identifies the resource for which the token is requested.
   * @returns {string} token if if it exists and not expired, otherwise null.
   */


  _AuthenticationContext.prototype.getCachedToken = function (resource) {
    if (!this._hasResource(resource)) {
      return null;
    }

    var token = this._getItem(this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource);

    var expiry = this._getItem(this.CONSTANTS.STORAGE.EXPIRATION_KEY + resource); // If expiration is within offset, it will force renew


    var offset = this.config.expireOffsetSeconds || 300;

    if (expiry && expiry > this._now() + offset) {
      return token;
    } else {
      this._saveItem(this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource, '');

      this._saveItem(this.CONSTANTS.STORAGE.EXPIRATION_KEY + resource, 0);

      return null;
    }
  };
  /**
   * User information from idtoken.
   *  @class User
   *  @property {string} userName - username assigned from upn or email.
   *  @property {object} profile - properties parsed from idtoken.
   */

  /**
   * If user object exists, returns it. Else creates a new user object by decoding id_token from the cache.
   * @returns {User} user object
   */


  _AuthenticationContext.prototype.getCachedUser = function () {
    if (this._user) {
      return this._user;
    }

    var idtoken = this._getItem(this.CONSTANTS.STORAGE.IDTOKEN);

    this._user = this._createUser(idtoken);
    return this._user;
  };
  /**
   * Adds the passed callback to the array of callbacks for the specified resource and puts the array on the window object.
   * @param {string}   resource A URI that identifies the resource for which the token is requested.
   * @param {string}   expectedState A unique identifier (guid).
   * @param {tokenCallback} callback - The callback provided by the caller. It will be called with token or error.
   */


  _AuthenticationContext.prototype.registerCallback = function (expectedState, resource, callback) {
    this._activeRenewals[resource] = expectedState;

    if (!this._callBacksMappedToRenewStates[expectedState]) {
      this._callBacksMappedToRenewStates[expectedState] = [];
    }

    var self = this;

    this._callBacksMappedToRenewStates[expectedState].push(callback);

    if (!this._callBackMappedToRenewStates[expectedState]) {
      this._callBackMappedToRenewStates[expectedState] = function (errorDesc, token, error, tokenType) {
        self._activeRenewals[resource] = null;

        for (var i = 0; i < self._callBacksMappedToRenewStates[expectedState].length; ++i) {
          try {
            self._callBacksMappedToRenewStates[expectedState][i](errorDesc, token, error, tokenType);
          } catch (error) {
            self.warn(error);
          }
        }

        self._callBacksMappedToRenewStates[expectedState] = null;
        self._callBackMappedToRenewStates[expectedState] = null;
      };
    }
  };
  /**
   * Renews idtoken for app's own backend when resource is clientId and calls the callback with token/error
   * @ignore
   */


  _AuthenticationContext.prototype._renewIdToken =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(callback, responseType) {
      var expectedState, resource, requestBody, headers, fetchArgs, request, response, modifiedResponse, objectToQueryString;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this.info('renewIdToken is called');
              expectedState = this._guid() + '|' + this.config.clientId;
              this._idTokenNonce = this._guid();

              this._saveItem(this.CONSTANTS.STORAGE.NONCE_IDTOKEN, this._idTokenNonce, true);

              this.config.state = expectedState;

              this._renewStates.push(expectedState);

              this.verbose('Renew Idtoken Expected state: ' + expectedState);
              resource = this.config.clientId;
              this.registerCallback(expectedState, this.config.clientId, callback);
              requestBody = {
                refresh_token: this._getItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_KEY)
              };
              headers = new Headers({
                "Content-Type": "application/json"
              });
              fetchArgs = {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody)
              };
              this.verbose('Set loading state to pending for: ' + resource);

              this._saveItem(this.CONSTANTS.STORAGE.RENEW_STATUS + resource, this.CONSTANTS.TOKEN_RENEW_STATUS_IN_PROGRESS);

              _context.prev = 14;
              _context.next = 17;
              return fetch(this.config.tokenRefreshUri, fetchArgs);

            case 17:
              request = _context.sent;
              _context.next = 20;
              return request.json();

            case 20:
              response = _context.sent;

              if (!(response.status === 401 || response.status === 500)) {
                _context.next = 31;
                break;
              }

              this.clearCache();
              this._user = null;

              if (resource && this._activeRenewals[resource]) {
                this._activeRenewals[resource] = null;
              }

              if (!this._callBacksMappedToRenewStates[expectedState]) {
                this._callBacksMappedToRenewStates[expectedState] = [];
              }

              if (!this._callBackMappedToRenewStates[expectedState]) {
                this._callBackMappedToRenewStates[expectedState] = [];
              }

              this._loginInProgress = false;

              this._saveItem(this.CONSTANTS.STORAGE.RENEW_STATUS + resource, this.CONSTANTS.TOKEN_RENEW_STATUS_CANCELED);

              this.login();
              return _context.abrupt("return");

            case 31:
              _context.next = 40;
              break;

            case 33:
              _context.prev = 33;
              _context.t0 = _context["catch"](14);

              if (!(this._getItem(this.CONSTANTS.STORAGE.RENEW_STATUS + resource) === this.CONSTANTS.TOKEN_RENEW_STATUS_IN_PROGRESS)) {
                _context.next = 40;
                break;
              }

              expectedState = this._activeRenewals[resource];

              if (expectedState && this._callBackMappedToRenewStates[expectedState]) {
                this._callBackMappedToRenewStates[expectedState]('Token renewal operation failed', null, 'Token Renewal Failed');
              }

              this._saveItem(this.CONSTANTS.STORAGE.RENEW_STATUS + resource, this.CONSTANTS.TOKEN_RENEW_STATUS_CANCELED);

              return _context.abrupt("return");

            case 40:
              modifiedResponse = Object.assign({}, response, {
                state: expectedState
              });

              objectToQueryString = function objectToQueryString(obj) {
                return Object.keys(obj).map(function (key) {
                  return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(obj[key]));
                }).join('&');
              };

              this.handleWindowCallback(objectToQueryString(modifiedResponse), true);

            case 43:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[14, 33]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  /**
   * Checks if the authorization endpoint URL contains query string parameters
   * @ignore
   */


  _AuthenticationContext.prototype._urlContainsQueryStringParameter = function (name, url) {
    // regex to detect pattern of a ? or & followed by the name parameter and an equals character
    var regex = new RegExp("[\\?&]" + name + "=");
    return regex.test(url);
  };
  /**
   * Removes the query string parameter from the authorization endpoint URL if it exists
   * @ignore
   */


  _AuthenticationContext.prototype._urlRemoveQueryStringParameter = function (url, name) {
    // we remove &name=value, name=value& and name=value
    // &name=value
    var regex = new RegExp('(\\&' + name + '=)[^\&]+');
    url = url.replace(regex, ''); // name=value&

    regex = new RegExp('(' + name + '=)[^\&]+&');
    url = url.replace(regex, ''); // name=value

    regex = new RegExp('(' + name + '=)[^\&]+');
    url = url.replace(regex, '');
    return url;
  };
  /**
   * @callback tokenCallback
   * @param {string} error_description error description returned from AAD if token request fails.
   * @param {string} token token returned from AAD if token request is successful.
   * @param {string} error error message returned from AAD if token request fails.
   */

  /**
   * Acquires token from the cache if it is not expired. Otherwise sends request to AAD to obtain a new token.
   * @param {string}   resource  ResourceUri identifying the target resource
   * @param {tokenCallback} callback -  The callback provided by the caller. It will be called with token or error.
   */


  _AuthenticationContext.prototype.acquireToken = function (resource, callback) {
    if (this._isEmpty(resource)) {
      this.warn('resource is required');
      callback('resource is required', null, 'resource is required');
      return;
    }

    var token = this.getCachedToken(resource);

    if (token) {
      this.info('Token is already in cache for resource:' + resource);
      callback(null, token, null);
      return;
    }

    if (!this._user && !(this.config.extraQueryParameter && this.config.extraQueryParameter.indexOf('login_hint') !== -1)) {
      this.warn('User login is required');
      callback('User login is required', null, 'login required');
      return;
    } // renew attempt
    // Already renewing for this resource, callback when we get the token.


    if (this._activeRenewals[resource]) {
      // Active renewals contains the state for each renewal.
      this.registerCallback(this._activeRenewals[resource], resource, callback);
    } else {
      this._requestType = this.REQUEST_TYPE.RENEW_TOKEN;

      if (resource === this.config.clientId) {
        // App uses idtoken to send to api endpoints
        // Default resource is tracked as clientid to store this token
        if (this._user) {
          this.verbose('renewing idtoken');

          this._renewIdToken(callback);
        } else {
          this.verbose('renewing idtoken and access_token');

          this._renewIdToken(callback, this.RESPONSE_TYPE.ID_TOKEN_TOKEN);
        }
      }
    }
  };
  /**
   * Redirects the browser to Azure AD authorization endpoint.
   * @param {string}   urlNavigate  Url of the authorization endpoint.
   */


  _AuthenticationContext.prototype.promptUser = function (urlNavigate) {
    if (urlNavigate) {
      this.infoPii('Navigate to:' + urlNavigate);
      window.location.replace(urlNavigate);
    } else {
      this.info('Navigate url is empty');
    }
  };
  /**
   * Clears cache items.
   */


  _AuthenticationContext.prototype.clearCache = function () {
    this._saveItem(this.CONSTANTS.STORAGE.LOGIN_REQUEST, '');

    this._saveItem(this.CONSTANTS.STORAGE.ANGULAR_LOGIN_REQUEST, '');

    this._saveItem(this.CONSTANTS.STORAGE.SESSION_STATE, '');

    this._saveItem(this.CONSTANTS.STORAGE.STATE_LOGIN, '');

    this._saveItem(this.CONSTANTS.STORAGE.STATE_RENEW, '');

    this._renewStates = [];

    this._saveItem(this.CONSTANTS.STORAGE.NONCE_IDTOKEN, '');

    this._saveItem(this.CONSTANTS.STORAGE.IDTOKEN, '');

    this._saveItem(this.CONSTANTS.STORAGE.ERROR, '');

    this._saveItem(this.CONSTANTS.STORAGE.ERROR_DESCRIPTION, '');

    this._saveItem(this.CONSTANTS.STORAGE.LOGIN_ERROR, '');

    this._saveItem(this.CONSTANTS.STORAGE.LOGIN_ERROR, '');

    this._saveItem(this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY, '');

    this._saveItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_KEY, '');

    var keys = this._getItem(this.CONSTANTS.STORAGE.TOKEN_KEYS);

    if (!this._isEmpty(keys)) {
      keys = keys.split(this.CONSTANTS.RESOURCE_DELIMETER);

      for (var i = 0; i < keys.length; i++) {
        this._saveItem(this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + keys[i], '');

        this._saveItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_KEY + keys[i], '');

        this._saveItem(this.CONSTANTS.STORAGE.EXPIRATION_KEY + keys[i], 0);

        this._saveItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_EXPIRATION_KEY + keys[i], 0);
      }
    }

    this._saveItem(this.CONSTANTS.STORAGE.TOKEN_KEYS, '');
  };
  /**
   * Clears cache items for a given resource.
   * @param {string}  resource a URI that identifies the resource.
   */


  _AuthenticationContext.prototype.clearCacheForResource = function (resource) {
    this._saveItem(this.CONSTANTS.STORAGE.STATE_RENEW, '');

    this._saveItem(this.CONSTANTS.STORAGE.ERROR, '');

    this._saveItem(this.CONSTANTS.STORAGE.ERROR_DESCRIPTION, '');

    if (this._hasResource(resource)) {
      this._saveItem(this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource, '');

      this._saveItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_KEY + resource, '');

      this._saveItem(this.CONSTANTS.STORAGE.EXPIRATION_KEY + resource, 0);

      this._saveItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_EXPIRATION_KEY + resource, 0);
    }
  };
  /**
   * Redirects user to logout endpoint.
   * After logout, it will redirect to postLogoutRedirectUri if added as a property on the config object.
   */


  _AuthenticationContext.prototype.logOut = function () {
    this.clearCache();
    this._user = null;
    var urlNavigate;

    if (this.config.logOutUri) {
      urlNavigate = this.config.logOutUri;
    } else {
      var tenant = 'common';
      var logout = '';

      if (this.config.tenant) {
        tenant = this.config.tenant;
      }

      if (this.config.postLogoutRedirectUri) {
        logout = 'post_logout_redirect_uri=' + encodeURIComponent(this.config.postLogoutRedirectUri);
      }

      urlNavigate = this.instance + tenant + '/oauth2/logout?' + logout;
    }

    this.infoPii('Logout navigate to: ' + urlNavigate);
    this.promptUser(urlNavigate);
  };

  _AuthenticationContext.prototype._isEmpty = function (str) {
    return typeof str === 'undefined' || !str || 0 === str.length;
  };
  /**
   * @callback userCallback
   * @param {string} error error message if user info is not available.
   * @param {User} user user object retrieved from the cache.
   */

  /**
   * Calls the passed in callback with the user object or error message related to the user.
   * @param {userCallback} callback - The callback provided by the caller. It will be called with user or error.
   */


  _AuthenticationContext.prototype.getUser = function (callback) {
    // IDToken is first call
    if (typeof callback !== 'function') {
      throw new Error('callback is not a function');
    } // user in memory


    if (this._user) {
      callback(null, this._user);
      return;
    } // frame is used to get idtoken


    var idtoken = this._getItem(this.CONSTANTS.STORAGE.IDTOKEN);

    if (!this._isEmpty(idtoken)) {
      this.info('User exists in cache: ');
      this._user = this._createUser(idtoken);
      callback(null, this._user);
    } else {
      this.warn('User information is not available');
      callback('User information is not available', null);
    }
  };
  /**
   * Creates a user object by decoding the id_token
   * @ignore
   */


  _AuthenticationContext.prototype._createUser = function (idToken) {
    var user = null;

    var parsedJson = this._extractIdToken(idToken);

    if (parsedJson && parsedJson.hasOwnProperty('aud')) {
      if (parsedJson.aud.toLowerCase() === this.config.clientId.toLowerCase()) {
        user = {
          userName: '',
          profile: parsedJson
        };

        if (parsedJson.hasOwnProperty('upn')) {
          user.userName = parsedJson.upn;
        } else if (parsedJson.hasOwnProperty('email')) {
          user.userName = parsedJson.email;
        }
      } else {
        this.warn('IdToken has invalid aud field');
      }
    }

    return user;
  };
  /**
   * Returns the anchor part(#) of the URL
   * @ignore
   */


  _AuthenticationContext.prototype._getHash = function (hash) {
    if (hash.indexOf('#/') > -1) {
      hash = hash.substring(hash.indexOf('#/') + 2);
    } else if (hash.indexOf('#') > -1) {
      hash = hash.substring(1);
    }

    return hash;
  };
  /**
   * Checks if the URL fragment contains access token, id token or error_description.
   * @param {string} hash  -  Hash passed from redirect page
   * @returns {Boolean} true if response contains id_token, access_token or error, false otherwise.
   */


  _AuthenticationContext.prototype.isCallback = function (hash) {
    hash = this._getHash(hash);

    var parameters = this._deserialize(hash);

    return parameters.hasOwnProperty(this.CONSTANTS.ERROR_DESCRIPTION) || parameters.hasOwnProperty(this.CONSTANTS.ACCESS_TOKEN) || parameters.hasOwnProperty(this.CONSTANTS.ID_TOKEN) || parameters.hasOwnProperty(this.CONSTANTS.CODE);
  };
  /**
   * Gets login error
   * @returns {string} error message related to login.
   */


  _AuthenticationContext.prototype.getLoginError = function () {
    return this._getItem(this.CONSTANTS.STORAGE.LOGIN_ERROR);
  };
  /**
   * Request info object created from the response received from AAD.
   *  @class RequestInfo
   *  @property {object} parameters - object comprising of fields such as id_token/error, session_state, state, e.t.c.
   *  @property {REQUEST_TYPE} requestType - either LOGIN, RENEW_TOKEN or UNKNOWN.
   *  @property {boolean} stateMatch - true if state is valid, false otherwise.
   *  @property {string} stateResponse - unique guid used to match the response with the request.
   *  @property {boolean} valid - true if requestType contains id_token, access_token or error, false otherwise.
   */

  /**
   * Creates a requestInfo object from the URL fragment and returns it.
   * @returns {RequestInfo} an object created from the redirect response from AAD comprising of the keys - parameters, requestType, stateMatch, stateResponse and valid.
   */


  _AuthenticationContext.prototype.getRequestInfo = function (hash) {
    hash = this._getHash(hash);

    var parameters = this._deserialize(hash);

    var requestInfo = {
      valid: false,
      parameters: {},
      stateMatch: false,
      stateResponse: '',
      requestType: this.REQUEST_TYPE.UNKNOWN
    };

    if (parameters) {
      requestInfo.parameters = parameters;

      if (parameters.hasOwnProperty(this.CONSTANTS.ERROR_DESCRIPTION) || parameters.hasOwnProperty(this.CONSTANTS.ACCESS_TOKEN) || parameters.hasOwnProperty(this.CONSTANTS.ID_TOKEN) || parameters.hasOwnProperty(this.CONSTANTS.CODE)) {
        requestInfo.valid = true; // which call

        var stateResponse = '';

        if (parameters.hasOwnProperty('state')) {
          this.verbose('State: ' + parameters.state);
          stateResponse = parameters.state;
        } else {
          this.warn('No state returned');
          return requestInfo;
        }

        requestInfo.stateResponse = stateResponse; // incoming callback needs to be looked up to find the request type

        if (this._matchState(requestInfo)) {
          return requestInfo;
        } // external api requests may have many renewtoken requests for different resource


        if (!requestInfo.stateMatch && window.parent) {
          requestInfo.requestType = this._requestType;
          var statesInParentContext = this._renewStates;

          for (var i = 0; i < statesInParentContext.length; i++) {
            if (statesInParentContext[i] === requestInfo.stateResponse) {
              requestInfo.stateMatch = true;
              break;
            }
          }
        }
      }
    }

    return requestInfo;
  };
  /**
   * Matches nonce from the request with the response.
   * @ignore
   */


  _AuthenticationContext.prototype._matchNonce = function (user) {
    var requestNonce = this._getItem(this.CONSTANTS.STORAGE.NONCE_IDTOKEN);

    if (requestNonce) {
      requestNonce = requestNonce.split(this.CONSTANTS.CACHE_DELIMETER);

      for (var i = 0; i < requestNonce.length; i++) {
        if (requestNonce[i] === user.profile.nonce) {
          return true;
        }
      }
    }

    return false;
  };
  /**
   * Matches state from the request with the response.
   * @ignore
   */


  _AuthenticationContext.prototype._matchState = function (requestInfo) {
    var loginStates = this._getItem(this.CONSTANTS.STORAGE.STATE_LOGIN);

    if (loginStates) {
      loginStates = loginStates.split(this.CONSTANTS.CACHE_DELIMETER);

      for (var i = 0; i < loginStates.length; i++) {
        if (loginStates[i] === requestInfo.stateResponse) {
          requestInfo.requestType = this.REQUEST_TYPE.LOGIN;
          requestInfo.stateMatch = true;
          return true;
        }
      }
    }

    var acquireTokenStates = this._getItem(this.CONSTANTS.STORAGE.STATE_RENEW);

    if (acquireTokenStates) {
      acquireTokenStates = acquireTokenStates.split(this.CONSTANTS.CACHE_DELIMETER);

      for (var i = 0; i < acquireTokenStates.length; i++) {
        if (acquireTokenStates[i] === requestInfo.stateResponse) {
          requestInfo.requestType = this.REQUEST_TYPE.RENEW_TOKEN;
          requestInfo.stateMatch = true;
          return true;
        }
      }
    }

    return false;
  };
  /**
   * Extracts resource value from state.
   * @ignore
   */


  _AuthenticationContext.prototype._getResourceFromState = function (state) {
    if (state) {
      var splitIndex = state.indexOf('|');

      if (splitIndex > -1 && splitIndex + 1 < state.length) {
        return state.substring(splitIndex + 1);
      }
    }

    return '';
  };
  /**
   * Saves token or error received in the response from AAD in the cache. In case of id_token, it also creates the user object.
   */


  _AuthenticationContext.prototype.saveTokenFromHash =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(requestInfo) {
      var resource, requestBody, headers, fetchArgs, _Object$assign, request, response, keys;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this.info('State status:' + requestInfo.stateMatch + '; Request type:' + requestInfo.requestType);

              this._saveItem(this.CONSTANTS.STORAGE.ERROR, '');

              this._saveItem(this.CONSTANTS.STORAGE.ERROR_DESCRIPTION, '');

              resource = this._getResourceFromState(requestInfo.stateResponse); // Record error

              if (!requestInfo.parameters.hasOwnProperty(this.CONSTANTS.ERROR_DESCRIPTION)) {
                _context2.next = 11;
                break;
              }

              this.infoPii('Error :' + requestInfo.parameters.error + '; Error description:' + requestInfo.parameters[this.CONSTANTS.ERROR_DESCRIPTION]);

              this._saveItem(this.CONSTANTS.STORAGE.ERROR, requestInfo.parameters.error);

              this._saveItem(this.CONSTANTS.STORAGE.ERROR_DESCRIPTION, requestInfo.parameters[this.CONSTANTS.ERROR_DESCRIPTION]);

              if (requestInfo.requestType === this.REQUEST_TYPE.LOGIN) {
                this._loginInProgress = false;

                this._saveItem(this.CONSTANTS.STORAGE.LOGIN_ERROR, requestInfo.parameters.error_description);
              }

              _context2.next = 45;
              break;

            case 11:
              if (!requestInfo.stateMatch) {
                _context2.next = 41;
                break;
              }

              // record tokens to storage if exists
              this.info('State is right');

              if (requestInfo.parameters.hasOwnProperty(this.CONSTANTS.SESSION_STATE)) {
                this._saveItem(this.CONSTANTS.STORAGE.SESSION_STATE, requestInfo.parameters[this.CONSTANTS.SESSION_STATE]);
              }

              if (!requestInfo.parameters.hasOwnProperty(this.CONSTANTS.CODE)) {
                _context2.next = 37;
                break;
              }

              requestBody = {
                client_id: this.config.clientId,
                code: requestInfo.parameters[this.CONSTANTS.CODE],
                redirect_uri: this.config.redirectUri
              };
              headers = new Headers({
                "Content-Type": "application/json"
              });
              fetchArgs = {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody)
              };
              _context2.prev = 18;
              _context2.next = 21;
              return fetch(this.config.tokenUri, fetchArgs);

            case 21:
              request = _context2.sent;
              _context2.next = 24;
              return request.json();

            case 24:
              response = _context2.sent;

              if (!(response.status === 403)) {
                _context2.next = 29;
                break;
              }

              this._loginInProgress = false;

              this._saveItem(this.CONSTANTS.STORAGE.LOGIN_ERROR, response.message);

              return _context2.abrupt("return");

            case 29:
              requestInfo.parameters = Object.assign({}, requestInfo.parameters, (_Object$assign = {}, _defineProperty(_Object$assign, this.CONSTANTS.ACCESS_TOKEN, response.access_token), _defineProperty(_Object$assign, this.CONSTANTS.ID_TOKEN, response.id_token), _defineProperty(_Object$assign, this.CONSTANTS.EXPIRES_IN, response.expires_in), _defineProperty(_Object$assign, this.CONSTANTS.REFRESH_TOKEN, response.refresh_token), _defineProperty(_Object$assign, this.CONSTANTS.REFRESH_TOKEN_EXPIRES_IN, response.refresh_token_expires_in), _Object$assign));
              _context2.next = 37;
              break;

            case 32:
              _context2.prev = 32;
              _context2.t0 = _context2["catch"](18);
              this.infoPii('Error :' + _context2.t0 + ';');

              this._saveItem(this.CONSTANTS.STORAGE.ERROR, 'role error');

              return _context2.abrupt("return");

            case 37:
              if (requestInfo.parameters.hasOwnProperty(this.CONSTANTS.ACCESS_TOKEN)) {
                this.info('Fragment has access token');

                if (!this._hasResource(resource)) {
                  keys = this._getItem(this.CONSTANTS.STORAGE.TOKEN_KEYS) || '';

                  this._saveItem(this.CONSTANTS.STORAGE.TOKEN_KEYS, keys + resource + this.CONSTANTS.RESOURCE_DELIMETER);
                } // save token with related resource


                this._saveItem(this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource, requestInfo.parameters[this.CONSTANTS.ACCESS_TOKEN]);

                this._saveItem(this.CONSTANTS.STORAGE.EXPIRATION_KEY + resource, this._expiresIn(requestInfo.parameters[this.CONSTANTS.EXPIRES_IN]));

                this._saveItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_KEY + resource, requestInfo.parameters[this.CONSTANTS.REFRESH_TOKEN]);

                this._saveItem(this.CONSTANTS.STORAGE.REFRESH_TOKEN_EXPIRATION_KEY + resource, this._expiresIn(requestInfo.parameters[this.CONSTANTS.REFRESH_TOKEN_EXPIRES_IN]));
              }

              if (requestInfo.parameters.hasOwnProperty(this.CONSTANTS.ID_TOKEN)) {
                this.info('Fragment has id token');
                this._loginInProgress = false;
                this._user = this._createUser(requestInfo.parameters[this.CONSTANTS.ID_TOKEN]);

                if (this._user && this._user.profile) {
                  if (!this._matchNonce(this._user)) {
                    this._saveItem(this.CONSTANTS.STORAGE.LOGIN_ERROR, 'Nonce received: ' + this._user.profile.nonce + ' is not same as requested: ' + this._getItem(this.CONSTANTS.STORAGE.NONCE_IDTOKEN));

                    this._user = null;
                  } else {
                    this._saveItem(this.CONSTANTS.STORAGE.IDTOKEN, requestInfo.parameters[this.CONSTANTS.ID_TOKEN]); // Save idtoken as access token for app itself


                    resource = this.config.loginResource ? this.config.loginResource : this.config.clientId;

                    if (!this._hasResource(resource)) {
                      keys = this._getItem(this.CONSTANTS.STORAGE.TOKEN_KEYS) || '';

                      this._saveItem(this.CONSTANTS.STORAGE.TOKEN_KEYS, keys + resource + this.CONSTANTS.RESOURCE_DELIMETER);
                    }

                    this._saveItem(this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource, requestInfo.parameters[this.CONSTANTS.ACCESS_TOKEN]);

                    this._saveItem(this.CONSTANTS.STORAGE.EXPIRATION_KEY + resource, this._user.profile.exp);
                  }
                } else {
                  requestInfo.parameters['error'] = 'invalid id_token';
                  requestInfo.parameters['error_description'] = 'Invalid id_token. id_token: ' + requestInfo.parameters[this.CONSTANTS.ID_TOKEN];

                  this._saveItem(this.CONSTANTS.STORAGE.ERROR, 'invalid id_token');

                  this._saveItem(this.CONSTANTS.STORAGE.ERROR_DESCRIPTION, 'Invalid id_token. id_token: ' + requestInfo.parameters[this.CONSTANTS.ID_TOKEN]);
                }
              }

              _context2.next = 45;
              break;

            case 41:
              requestInfo.parameters['error'] = 'Invalid_state';
              requestInfo.parameters['error_description'] = 'Invalid_state. state: ' + requestInfo.stateResponse;

              this._saveItem(this.CONSTANTS.STORAGE.ERROR, 'Invalid_state');

              this._saveItem(this.CONSTANTS.STORAGE.ERROR_DESCRIPTION, 'Invalid_state. state: ' + requestInfo.stateResponse);

            case 45:
              this._saveItem(this.CONSTANTS.STORAGE.RENEW_STATUS + resource, this.CONSTANTS.TOKEN_RENEW_STATUS_COMPLETED);

            case 46:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[18, 32]]);
    }));

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }();
  /**
   * Gets resource for given endpoint if mapping is provided with config.
   * @param {string} endpoint  -  The URI for which the resource Id is requested.
   * @returns {string} resource for this API endpoint.
   */


  _AuthenticationContext.prototype.getResourceForEndpoint = function (endpoint) {
    // if user specified list of anonymous endpoints, no need to send token to these endpoints, return null.
    if (this.config && this.config.anonymousEndpoints) {
      for (var i = 0; i < this.config.anonymousEndpoints.length; i++) {
        if (endpoint.indexOf(this.config.anonymousEndpoints[i]) > -1) {
          return null;
        }
      }
    }

    if (this.config && this.config.endpoints) {
      for (var configEndpoint in this.config.endpoints) {
        // configEndpoint is like /api/Todo requested endpoint can be /api/Todo/1
        if (endpoint.indexOf(configEndpoint) > -1) {
          return this.config.endpoints[configEndpoint];
        }
      }
    } // default resource will be clientid if nothing specified
    // App will use idtoken for calls to itself
    // check if it's staring from http or https, needs to match with app host


    if (endpoint.indexOf('http://') > -1 || endpoint.indexOf('https://') > -1) {
      if (this._getHostFromUri(endpoint) === this._getHostFromUri(this.config.redirectUri)) {
        return this.config.loginResource;
      }
    } else {
      // in angular level, the url for $http interceptor call could be relative url,
      // if it's relative call, we'll treat it as app backend call.
      return this.config.loginResource;
    } // if not the app's own backend or not a domain listed in the endpoints structure


    return null;
  };
  /**
   * Strips the protocol part of the URL and returns it.
   * @ignore
   */


  _AuthenticationContext.prototype._getHostFromUri = function (uri) {
    // remove http:// or https:// from uri
    var extractedUri = String(uri).replace(/^(https?:)\/\//, '');
    extractedUri = extractedUri.split('/')[0];
    return extractedUri;
  };
  /**
   * This method must be called for processing the response received from AAD. It extracts the hash, processes the token or error, saves it in the cache and calls the registered callbacks with the result.
   * @param {string} [hash=window.location.hash] - Hash fragment of Url.
   */


  _AuthenticationContext.prototype.handleWindowCallback =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(hash, isRedirect) {
      var self, isPopup, requestInfo, token, tokenReceivedCallback, tokenType, errorDesc, error;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // This is for regular javascript usage for redirect handling
              // need to make sure this is for callback
              if (hash == null) {
                hash = window.location.search;
              }

              if (!this.isCallback(hash)) {
                _context3.next = 16;
                break;
              }

              self = null;
              isPopup = false;

              if (this._openedWindows.length > 0 && this._openedWindows[this._openedWindows.length - 1].opener && this._openedWindows[this._openedWindows.length - 1].opener._adfsInstance) {
                self = this._openedWindows[this._openedWindows.length - 1].opener._adfsInstance;
                isPopup = true;
              } else if (window.parent && window.parent._adfsInstance) {
                self = window.parent._adfsInstance;
              }

              requestInfo = self.getRequestInfo(hash);
              tokenType = null;

              if (isPopup || window.parent !== window) {
                tokenReceivedCallback = self._callBackMappedToRenewStates[requestInfo.stateResponse];
              } else {
                tokenReceivedCallback = self.callback;
              }

              self.info("Returned from redirect url");
              _context3.next = 11;
              return self.saveTokenFromHash(requestInfo);

            case 11:
              if (requestInfo.requestType === this.REQUEST_TYPE.RENEW_TOKEN && window.parent) {
                if (window.parent !== window) {
                  self.verbose("Window is in iframe, acquiring token silently");
                } else {
                  self.verbose("acquiring token interactive in progress");
                }

                token = requestInfo.parameters[self.CONSTANTS.ACCESS_TOKEN] || requestInfo.parameters[self.CONSTANTS.ID_TOKEN];
                tokenType = self.CONSTANTS.ACCESS_TOKEN;
                tokenReceivedCallback = self._callBackMappedToRenewStates[requestInfo.stateResponse];
              } else if (requestInfo.requestType === this.REQUEST_TYPE.LOGIN) {
                token = requestInfo.parameters[self.CONSTANTS.ID_TOKEN];
                tokenType = self.CONSTANTS.ID_TOKEN;
              }

              errorDesc = requestInfo.parameters[self.CONSTANTS.ERROR_DESCRIPTION];
              error = requestInfo.parameters[self.CONSTANTS.ERROR];

              try {
                if (tokenReceivedCallback) {
                  tokenReceivedCallback(errorDesc, token, error, tokenType);
                }
              } catch (err) {
                self.error("Error occurred in user defined callback function: " + err);
              }

              if (window.parent === window && !isPopup && !isRedirect) {
                if (self.config.navigateToLoginRequestUrl) {
                  window.location.href = self._getItem(self.CONSTANTS.STORAGE.LOGIN_REQUEST);
                } else window.location.hash = '';
              }

            case 16:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  }();
  /**
   * Constructs the authorization endpoint URL and returns it.
   * @ignore
   */


  _AuthenticationContext.prototype._getNavigateUrl = function (responseType, resource) {
    var tenant = 'common';

    if (this.config.tenant) {
      tenant = this.config.tenant;
    }

    var urlNavigate = this.instance + tenant + '/oauth2/authorize' + this._serialize(responseType, this.config, resource) + this._addLibMetadata();

    this.info('Navigate url:' + urlNavigate);
    return urlNavigate;
  };
  /**
   * Returns the decoded id_token.
   * @ignore
   */


  _AuthenticationContext.prototype._extractIdToken = function (encodedIdToken) {
    // id token will be decoded to get the username
    var decodedToken = this._decodeJwt(encodedIdToken);

    if (!decodedToken) {
      return null;
    }

    try {
      var base64IdToken = decodedToken.JWSPayload;

      var base64Decoded = this._base64DecodeStringUrlSafe(base64IdToken);

      if (!base64Decoded) {
        this.info('The returned id_token could not be base64 url safe decoded.');
        return null;
      } // ECMA script has JSON built-in support


      return JSON.parse(base64Decoded);
    } catch (err) {
      this.error('The returned id_token could not be decoded', err);
    }

    return null;
  };
  /**
   * Decodes a string of data which has been encoded using base-64 encoding.
   * @ignore
   */


  _AuthenticationContext.prototype._base64DecodeStringUrlSafe = function (base64IdToken) {
    // html5 should support atob function for decoding
    base64IdToken = base64IdToken.replace(/-/g, '+').replace(/_/g, '/');

    if (window.atob) {
      return decodeURIComponent(escape(window.atob(base64IdToken))); // jshint ignore:line
    } else {
      return decodeURIComponent(escape(this._decode(base64IdToken)));
    }
  }; //Take https://cdnjs.cloudflare.com/ajax/libs/Base64/0.3.0/base64.js and https://en.wikipedia.org/wiki/Base64 as reference.


  _AuthenticationContext.prototype._decode = function (base64IdToken) {
    var codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    base64IdToken = String(base64IdToken).replace(/=+$/, '');
    var length = base64IdToken.length;

    if (length % 4 === 1) {
      throw new Error('The token to be decoded is not correctly encoded.');
    }

    var h1,
        h2,
        h3,
        h4,
        bits,
        c1,
        c2,
        c3,
        decoded = '';

    for (var i = 0; i < length; i += 4) {
      //Every 4 base64 encoded character will be converted to 3 byte string, which is 24 bits
      // then 6 bits per base64 encoded character
      h1 = codes.indexOf(base64IdToken.charAt(i));
      h2 = codes.indexOf(base64IdToken.charAt(i + 1));
      h3 = codes.indexOf(base64IdToken.charAt(i + 2));
      h4 = codes.indexOf(base64IdToken.charAt(i + 3)); // For padding, if last two are '='

      if (i + 2 === length - 1) {
        bits = h1 << 18 | h2 << 12 | h3 << 6;
        c1 = bits >> 16 & 255;
        c2 = bits >> 8 & 255;
        decoded += String.fromCharCode(c1, c2);
        break;
      } // if last one is '='
      else if (i + 1 === length - 1) {
          bits = h1 << 18 | h2 << 12;
          c1 = bits >> 16 & 255;
          decoded += String.fromCharCode(c1);
          break;
        }

      bits = h1 << 18 | h2 << 12 | h3 << 6 | h4; // then convert to 3 byte chars

      c1 = bits >> 16 & 255;
      c2 = bits >> 8 & 255;
      c3 = bits & 255;
      decoded += String.fromCharCode(c1, c2, c3);
    }

    return decoded;
  };
  /**
   * Decodes an id token into an object with header, payload and signature fields.
   * @ignore
   */
  // Adal.node js crack function


  _AuthenticationContext.prototype._decodeJwt = function (jwtToken) {
    if (this._isEmpty(jwtToken)) {
      return null;
    }

    ;
    var idTokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;
    var matches = idTokenPartsRegex.exec(jwtToken);

    if (!matches || matches.length < 4) {
      this.warn('The returned id_token is not parseable.');
      return null;
    }

    var crackedToken = {
      header: matches[1],
      JWSPayload: matches[2],
      JWSSig: matches[3]
    };
    return crackedToken;
  };
  /**
   * Converts string to represent binary data in ASCII string format by translating it into a radix-64 representation and returns it
   * @ignore
   */


  _AuthenticationContext.prototype._convertUrlSafeToRegularBase64EncodedString = function (str) {
    return str.replace('-', '+').replace('_', '/');
  };
  /**
   * Serializes the parameters for the authorization endpoint URL and returns the serialized uri string.
   * @ignore
   */


  _AuthenticationContext.prototype._serialize = function (responseType, obj, resource) {
    var str = [];

    if (obj !== null) {
      str.push('?response_type=' + responseType);
      str.push('client_id=' + encodeURIComponent(obj.clientId));

      if (resource) {
        str.push('resource=' + encodeURIComponent(resource));
      }

      str.push('redirect_uri=' + encodeURIComponent(obj.redirectUri));
      str.push('state=' + encodeURIComponent(obj.state));

      if (obj.hasOwnProperty('slice')) {
        str.push('slice=' + encodeURIComponent(obj.slice));
      }

      if (obj.hasOwnProperty('extraQueryParameter')) {
        str.push(obj.extraQueryParameter);
      }

      var correlationId = obj.correlationId ? obj.correlationId : this._guid();
      str.push('client-request-id=' + encodeURIComponent(correlationId));
    }

    return str.join('&');
  };
  /**
   * Parses the query string parameters into a key-value pair object.
   * @ignore
   */


  _AuthenticationContext.prototype._deserialize = function (query) {
    var match,
        pl = /\+/g,
        // Regex for replacing addition symbol with a space
    search = /([^&=]+)=([^&]*)/g,
        decode = function decode(s) {
      return decodeURIComponent(s.replace(pl, ' '));
    },
        obj = {};

    match = search.exec(query);

    while (match) {
      obj[decode(match[1])] = decode(match[2]);
      match = search.exec(query);
    }

    return obj;
  };
  /**
   * Converts decimal value to hex equivalent
   * @ignore
   */


  _AuthenticationContext.prototype._decimalToHex = function (number) {
    var hex = number.toString(16);

    while (hex.length < 2) {
      hex = '0' + hex;
    }

    return hex;
  };
  /**
   * Generates RFC4122 version 4 guid (128 bits)
   * @ignore
   */

  /* jshint ignore:start */


  _AuthenticationContext.prototype._guid = function () {
    // RFC4122: The version 4 UUID is meant for generating UUIDs from truly-random or
    // pseudo-random numbers.
    // The algorithm is as follows:
    //     Set the two most significant bits (bits 6 and 7) of the
    //        clock_seq_hi_and_reserved to zero and one, respectively.
    //     Set the four most significant bits (bits 12 through 15) of the
    //        time_hi_and_version field to the 4-bit version number from
    //        Section 4.1.3. Version4
    //     Set all the other bits to randomly (or pseudo-randomly) chosen
    //     values.
    // UUID                   = time-low "-" time-mid "-"time-high-and-version "-"clock-seq-reserved and low(2hexOctet)"-" node
    // time-low               = 4hexOctet
    // time-mid               = 2hexOctet
    // time-high-and-version  = 2hexOctet
    // clock-seq-and-reserved = hexOctet:
    // clock-seq-low          = hexOctet
    // node                   = 6hexOctet
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // y could be 1000, 1001, 1010, 1011 since most significant two bits needs to be 10
    // y values are 8, 9, A, B
    var cryptoObj = window.crypto || window.msCrypto; // for IE 11

    if (cryptoObj && cryptoObj.getRandomValues) {
      var buffer = new Uint8Array(16);
      cryptoObj.getRandomValues(buffer); //buffer[6] and buffer[7] represents the time_hi_and_version field. We will set the four most significant bits (4 through 7) of buffer[6] to represent decimal number 4 (UUID version number).

      buffer[6] |= 0x40; //buffer[6] | 01000000 will set the 6 bit to 1.

      buffer[6] &= 0x4f; //buffer[6] & 01001111 will set the 4, 5, and 7 bit to 0 such that bits 4-7 == 0100 = "4".
      //buffer[8] represents the clock_seq_hi_and_reserved field. We will set the two most significant bits (6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively.

      buffer[8] |= 0x80; //buffer[8] | 10000000 will set the 7 bit to 1.

      buffer[8] &= 0xbf; //buffer[8] & 10111111 will set the 6 bit to 0.

      return this._decimalToHex(buffer[0]) + this._decimalToHex(buffer[1]) + this._decimalToHex(buffer[2]) + this._decimalToHex(buffer[3]) + '-' + this._decimalToHex(buffer[4]) + this._decimalToHex(buffer[5]) + '-' + this._decimalToHex(buffer[6]) + this._decimalToHex(buffer[7]) + '-' + this._decimalToHex(buffer[8]) + this._decimalToHex(buffer[9]) + '-' + this._decimalToHex(buffer[10]) + this._decimalToHex(buffer[11]) + this._decimalToHex(buffer[12]) + this._decimalToHex(buffer[13]) + this._decimalToHex(buffer[14]) + this._decimalToHex(buffer[15]);
    } else {
      var guidHolder = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
      var hex = '0123456789abcdef';
      var r = 0;
      var guidResponse = "";

      for (var i = 0; i < 36; i++) {
        if (guidHolder[i] !== '-' && guidHolder[i] !== '4') {
          // each x and y needs to be random
          r = Math.random() * 16 | 0;
        }

        if (guidHolder[i] === 'x') {
          guidResponse += hex[r];
        } else if (guidHolder[i] === 'y') {
          // clock-seq-and-reserved first hex is filtered and remaining hex values are random
          r &= 0x3; // bit and with 0011 to set pos 2 to zero ?0??

          r |= 0x8; // set pos 3 to 1 as 1???

          guidResponse += hex[r];
        } else {
          guidResponse += guidHolder[i];
        }
      }

      return guidResponse;
    }
  };
  /* jshint ignore:end */

  /**
   * Calculates the expires in value in milliseconds for the acquired token
   * @ignore
   */


  _AuthenticationContext.prototype._expiresIn = function (expires) {
    // if AAD did not send "expires_in" property, use default expiration of 3599 seconds, for some reason AAD sends 3599 as "expires_in" value instead of 3600
    if (!expires) expires = 3599;
    return this._now() + parseInt(expires, 10);
  };
  /**
   * Return the number of milliseconds since 1970/01/01
   * @ignore
   */


  _AuthenticationContext.prototype._now = function () {
    return Math.round(new Date().getTime() / 1000.0);
  };
  /**
   * Saves the key-value pair in the cache
   * @ignore
   */


  _AuthenticationContext.prototype._saveItem = function (key, obj, preserve) {
    if (this.config && this.config.cacheLocation && this.config.cacheLocation === 'localStorage') {
      if (!this._supportsLocalStorage()) {
        this.info('Local storage is not supported');
        return false;
      }

      if (preserve) {
        var value = this._getItem(key) || '';
        localStorage.setItem(key, value + obj + this.CONSTANTS.CACHE_DELIMETER);
      } else {
        localStorage.setItem(key, obj);
      }

      return true;
    } // Default as session storage


    if (!this._supportsSessionStorage()) {
      this.info('Session storage is not supported');
      return false;
    }

    sessionStorage.setItem(key, obj);
    return true;
  };
  /**
   * Searches the value for the given key in the cache
   * @ignore
   */


  _AuthenticationContext.prototype._getItem = function (key) {
    if (this.config && this.config.cacheLocation && this.config.cacheLocation === 'localStorage') {
      if (!this._supportsLocalStorage()) {
        this.info('Local storage is not supported');
        return null;
      }

      return localStorage.getItem(key);
    } // Default as session storage


    if (!this._supportsSessionStorage()) {
      this.info('Session storage is not supported');
      return null;
    }

    return sessionStorage.getItem(key);
  };
  /**
   * Returns true if browser supports localStorage, false otherwise.
   * @ignore
   */


  _AuthenticationContext.prototype._supportsLocalStorage = function () {
    try {
      if (!window.localStorage) return false; // Test availability

      window.localStorage.setItem('storageTest', 'A'); // Try write

      if (window.localStorage.getItem('storageTest') != 'A') return false; // Test read/write

      window.localStorage.removeItem('storageTest'); // Try delete

      if (window.localStorage.getItem('storageTest')) return false; // Test delete

      return true; // Success
    } catch (e) {
      return false;
    }
  };
  /**
   * Returns true if browser supports sessionStorage, false otherwise.
   * @ignore
   */


  _AuthenticationContext.prototype._supportsSessionStorage = function () {
    try {
      if (!window.sessionStorage) return false; // Test availability

      window.sessionStorage.setItem('storageTest', 'A'); // Try write

      if (window.sessionStorage.getItem('storageTest') != 'A') return false; // Test read/write

      window.sessionStorage.removeItem('storageTest'); // Try delete

      if (window.sessionStorage.getItem('storageTest')) return false; // Test delete

      return true; // Success
    } catch (e) {
      return false;
    }
  };
  /**
   * Returns a cloned copy of the passed object.
   * @ignore
   */


  _AuthenticationContext.prototype._cloneConfig = function (obj) {
    if (null === obj || 'object' !== _typeof(obj)) {
      return obj;
    }

    var copy = {};

    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = obj[attr];
      }
    }

    return copy;
  };
  /**
   * Adds the library version and returns it.
   * @ignore
   */


  _AuthenticationContext.prototype._addLibMetadata = function () {
    // x-client-SKU
    // x-client-Ver
    return '&x-client-SKU=Js&x-client-Ver=' + this._libVersion();
  };
  /**
   * Checks the Logging Level, constructs the Log message and logs it. Users need to implement/override this method to turn on Logging.
   * @param {number} level  -  Level can be set 0,1,2 and 3 which turns on 'error', 'warning', 'info' or 'verbose' level logging respectively.
   * @param {string} message  -  Message to log.
   * @param {string} error  -  Error to log.
   */


  _AuthenticationContext.prototype.log = function (level, message, error, containsPii) {
    if (level <= window.Logging.level) {
      if (!window.Logging.piiLoggingEnabled && containsPii) return;
      var timestamp = new Date().toUTCString();
      var formattedMessage = '';
      if (this.config.correlationId) formattedMessage = timestamp + ':' + this.config.correlationId + '-' + this._libVersion() + '-' + this.CONSTANTS.LEVEL_STRING_MAP[level] + ' ' + message;else formattedMessage = timestamp + ':' + this._libVersion() + '-' + this.CONSTANTS.LEVEL_STRING_MAP[level] + ' ' + message;

      if (error) {
        formattedMessage += '\nstack:\n' + error.stack;
      }

      window.Logging.log(formattedMessage);
    }
  };
  /**
   * Logs messages when Logging Level is set to 0.
   * @param {string} message  -  Message to log.
   * @param {string} error  -  Error to log.
   */


  _AuthenticationContext.prototype.error = function (message, error) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.ERROR, message, error);
  };
  /**
   * Logs messages when Logging Level is set to 1.
   * @param {string} message  -  Message to log.
   */


  _AuthenticationContext.prototype.warn = function (message) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.WARN, message, null);
  };
  /**
   * Logs messages when Logging Level is set to 2.
   * @param {string} message  -  Message to log.
   */


  _AuthenticationContext.prototype.info = function (message) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.INFO, message, null);
  };
  /**
   * Logs messages when Logging Level is set to 3.
   * @param {string} message  -  Message to log.
   */


  _AuthenticationContext.prototype.verbose = function (message) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.VERBOSE, message, null);
  };
  /**
   * Logs Pii messages when Logging Level is set to 0 and window.piiLoggingEnabled is set to true.
   * @param {string} message  -  Message to log.
   * @param {string} error  -  Error to log.
   */


  _AuthenticationContext.prototype.errorPii = function (message, error) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.ERROR, message, error, true);
  };
  /**
   * Logs  Pii messages when Logging Level is set to 1 and window.piiLoggingEnabled is set to true.
   * @param {string} message  -  Message to log.
   */


  _AuthenticationContext.prototype.warnPii = function (message) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.WARN, message, null, true);
  };
  /**
   * Logs messages when Logging Level is set to 2 and window.piiLoggingEnabled is set to true.
   * @param {string} message  -  Message to log.
   */


  _AuthenticationContext.prototype.infoPii = function (message) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.INFO, message, null, true);
  };
  /**
   * Logs messages when Logging Level is set to 3 and window.piiLoggingEnabled is set to true.
   * @param {string} message  -  Message to log.
   */


  _AuthenticationContext.prototype.verbosePii = function (message) {
    this.log(this.CONSTANTS.LOGGING_LEVEL.VERBOSE, message, null, true);
  };
  /**
   * Returns the library version.
   * @ignore
   */


  _AuthenticationContext.prototype._libVersion = function () {
    return '1.0.17';
  };
  /**
   * Returns a reference of Authentication Context as a result of a require call.
   * @ignore
   */


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _AuthenticationContext;

    module.exports.inject = function (conf) {
      return new _AuthenticationContext(conf);
    };
  }

  return _AuthenticationContext;
}();

var _default = _AuthenticationContext;
exports["default"] = _default;