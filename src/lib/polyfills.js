// Polyfills para Safari iOS
if (typeof window !== 'undefined') {
  
  // Polyfill para Array.prototype.find (Safari < 7.1)
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = parseInt(list.length) || 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }

  // Polyfill para Array.prototype.includes (Safari < 9)
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/) {
      'use strict';
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (len === 0) {
        return false;
      }
      var n = parseInt(arguments[1]) || 0;
      var k;
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) {k = 0;}
      }
      var currentElement;
      while (k < len) {
        currentElement = O[k];
        if (searchElement === currentElement ||
           (searchElement !== searchElement && currentElement !== currentElement)) {
          return true;
        }
        k++;
      }
      return false;
    };
  }

  // Polyfill para Object.assign (Safari < 9)
  if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }

  // Polyfill para fetch (Safari < 10.1)
  if (!window.fetch) {
    window.fetch = function(url, options) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(options && options.method || 'GET', url);
        
        if (options && options.headers) {
          for (var key in options.headers) {
            xhr.setRequestHeader(key, options.headers[key]);
          }
        }
        
        xhr.onload = function() {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            json: function() {
              try {
                return Promise.resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                return Promise.reject(e);
              }
            },
            text: function() {
              return Promise.resolve(xhr.responseText);
            }
          });
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error'));
        };
        
        xhr.send(options && options.body || null);
      });
    };
  }

  // Soporte mejorado para Notification en Safari
  if ('Notification' in window && Notification.permission === 'denied') {
    // Safari iOS bloquea notificaciones por defecto
    console.log('Notifications are blocked in this browser');
  }
}