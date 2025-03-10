/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/.pnpm/debug@4.4.0_supports-color@8.1.1/node_modules/debug/src/browser.js":
/*!***************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/debug@4.4.0_supports-color@8.1.1/node_modules/debug/src/browser.js ***!
  \***************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	let m;

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	// eslint-disable-next-line no-return-assign
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(/*! ./common */ "../../node_modules/.pnpm/debug@4.4.0_supports-color@8.1.1/node_modules/debug/src/common.js")(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ "../../node_modules/.pnpm/debug@4.4.0_supports-color@8.1.1/node_modules/debug/src/common.js":
/*!**************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/debug@4.4.0_supports-color@8.1.1/node_modules/debug/src/common.js ***!
  \**************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(/*! ms */ "../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js");
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		const split = (typeof namespaces === 'string' ? namespaces : '')
			.trim()
			.replace(' ', ',')
			.split(',')
			.filter(Boolean);

		for (const ns of split) {
			if (ns[0] === '-') {
				createDebug.skips.push(ns.slice(1));
			} else {
				createDebug.names.push(ns);
			}
		}
	}

	/**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */
	function matchesTemplate(search, template) {
		let searchIndex = 0;
		let templateIndex = 0;
		let starIndex = -1;
		let matchIndex = 0;

		while (searchIndex < search.length) {
			if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
				// Match character or proceed with wildcard
				if (template[templateIndex] === '*') {
					starIndex = templateIndex;
					matchIndex = searchIndex;
					templateIndex++; // Skip the '*'
				} else {
					searchIndex++;
					templateIndex++;
				}
			} else if (starIndex !== -1) { // eslint-disable-line no-negated-condition
				// Backtrack to the last '*' and try to match more characters
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else {
				return false; // No match
			}
		}

		// Handle trailing '*' in template
		while (templateIndex < template.length && template[templateIndex] === '*') {
			templateIndex++;
		}

		return templateIndex === template.length;
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names,
			...createDebug.skips.map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		for (const skip of createDebug.skips) {
			if (matchesTemplate(name, skip)) {
				return false;
			}
		}

		for (const ns of createDebug.names) {
			if (matchesTemplate(name, ns)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ "../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js":
/*!******************************************************************!*\
  !*** ../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js ***!
  \******************************************************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ "../cache/dist/constructions/constructionCache.js":
/*!********************************************************!*\
  !*** ../cache/dist/constructions/constructionCache.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConstructionCache: () => (/* binding */ ConstructionCache)
/* harmony export */ });
/* harmony import */ var _constructions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constructions.js */ "../cache/dist/constructions/constructions.js");
/* harmony import */ var _matchPart_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./matchPart.js */ "../cache/dist/constructions/matchPart.js");
/* harmony import */ var _transforms_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transforms.js */ "../cache/dist/constructions/transforms.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! debug */ "../../node_modules/.pnpm/debug@4.4.0_supports-color@8.1.1/node_modules/debug/src/browser.js");
/* harmony import */ var _constructionMatch_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constructionMatch.js */ "../cache/dist/constructions/constructionMatch.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.





const debugConst = debug__WEBPACK_IMPORTED_MODULE_3__("typeagent:const");
const debugConstMatchStat = debug__WEBPACK_IMPORTED_MODULE_3__("typeagent:const:match:stat");
// Agent Cache define the namespace policy.  At the cache, it just combine the keys into a string for lookup.
function getConstructionNamespace(namespaceKeys) {
    // Combine the namespace keys into a string using | as the separator.  Use to filter easily when
    // during match for schemas are disabled or not or hash mismatches.
    return namespaceKeys.join("|");
}
function getNamespaceKeys(constructionNamespace) {
    // Convert the namespace into an array of translator names for filtering.
    return constructionNamespace.split("|");
}
const constructionCacheJSONVersion = 3;
class ConstructionCache {
    constructor(explainerName) {
        this.explainerName = explainerName;
        this.matchSetsByUid = new Map();
        // Construction and transforms use different namespaces.
        this.constructionNamespaces = new Map();
        this.transformNamespaces = new Map();
    }
    get count() {
        let count = 0;
        for (const constructionNamespace of this.constructionNamespaces.values()) {
            count += constructionNamespace.constructions.length;
        }
        return count;
    }
    getFilteredCount(filter) {
        let count = 0;
        for (const [namespace, constructionNamespace,] of this.constructionNamespaces.entries()) {
            const keys = getNamespaceKeys(namespace);
            if (keys.every((key) => filter(key))) {
                count += constructionNamespace.constructions.length;
            }
        }
        return count;
    }
    addMatchSet(matchSet, mergeMatchSet) {
        const merge = mergeMatchSet && matchSet.canBeMerged;
        const uid = merge ? matchSet.mergedUid : matchSet.unmergedUid;
        let newMatchSet = this.matchSetsByUid.get(uid);
        if (newMatchSet !== undefined) {
            // If merge, then add to the existing match set.
            // If non-merge, then the uid will have determine the equivalent match set to reuse
            if (newMatchSet !== matchSet && merge) {
                for (const match of matchSet.matches) {
                    // Merge matches
                    newMatchSet.matches.add(match);
                }
                // match set is modified, clear the regexp
                newMatchSet.clearRegexp();
            }
        }
        else {
            newMatchSet = matchSet.clone(merge, this.matchSetsByUid.size);
            this.matchSetsByUid.set(uid, newMatchSet);
        }
        return newMatchSet;
    }
    ensureConstructionNamespace(namespace) {
        const constructionNamespace = this.constructionNamespaces.get(namespace);
        if (constructionNamespace !== undefined) {
            return constructionNamespace;
        }
        const newCacheNamespace = {
            constructions: [],
            transforms: new _transforms_js__WEBPACK_IMPORTED_MODULE_2__.Transforms(),
            maxId: 0,
        };
        this.constructionNamespaces.set(namespace, newCacheNamespace);
        return newCacheNamespace;
    }
    mergeTransformNamespaces(transformNamespaces, cacheConflicts) {
        for (const [namespace, transforms] of transformNamespaces) {
            const transformNamespace = this.transformNamespaces.get(namespace);
            if (transformNamespace === undefined) {
                this.transformNamespaces.set(namespace, transforms);
            }
            else {
                transformNamespace.merge(transforms, cacheConflicts);
            }
        }
    }
    addConstruction(namespaceKeys, construction, mergeMatchSets, cacheConflicts) {
        const mergedParts = construction.parts.map((p) => (0,_matchPart_js__WEBPACK_IMPORTED_MODULE_1__.isMatchPart)(p)
            ? new _matchPart_js__WEBPACK_IMPORTED_MODULE_1__.MatchPart(this.addMatchSet(p.matchSet, mergeMatchSets), p.optional, p.wildcardMode, p.transformInfos)
            : p);
        const namespace = getConstructionNamespace(namespaceKeys);
        const constructionNamespace = this.ensureConstructionNamespace(namespace);
        this.mergeTransformNamespaces(construction.transformNamespaces, cacheConflicts);
        // Detect if there are existing rules
        const existingRules = constructionNamespace.constructions.filter((c) => c.isSupersetOf(mergedParts, construction.implicitParameters));
        if (existingRules.length) {
            return { added: false, existing: existingRules };
        }
        // Create a new rule and remove all the existing rule that the new rule is a superset of
        // REVIEW: do we want to share transforms globally?
        const newConstruction = new _constructions_js__WEBPACK_IMPORTED_MODULE_0__.Construction(mergedParts, this.transformNamespaces, construction.implicitParameters, construction.implicitActionName, constructionNamespace.maxId++);
        const removedRules = [];
        constructionNamespace.constructions =
            constructionNamespace.constructions.filter((c) => {
                const isSupersetOf = newConstruction.isSupersetOf(c.parts, c.implicitParameters);
                if (isSupersetOf) {
                    removedRules.push(c);
                    return false;
                }
                return true;
            });
        constructionNamespace.constructions.push(newConstruction);
        return {
            added: true,
            existing: removedRules,
            construction: newConstruction,
        };
    }
    forceRegexp() {
        this.matchSetsByUid.forEach((matchSet) => matchSet.forceRegexp());
    }
    delete(namespace, id) {
        const constructionNamespace = this.constructionNamespaces.get(namespace);
        if (constructionNamespace === undefined) {
            return -1;
        }
        const count = constructionNamespace.constructions.length;
        constructionNamespace.constructions =
            constructionNamespace.constructions.filter((c) => c.id !== id);
        // TODO: GC match sets
        return count - constructionNamespace.constructions.length;
    }
    getMatches(request, matchConfig, constructionNamespace) {
        return constructionNamespace.constructions.flatMap((construction) => {
            return construction.match(request, matchConfig);
        });
    }
    prune(filter) {
        let count = 0;
        for (const namespace of this.constructionNamespaces.keys()) {
            const keys = getNamespaceKeys(namespace);
            if (!keys.every((key) => filter(key))) {
                this.constructionNamespaces.delete(namespace);
                debugConst(`Prune: ${namespace} deleted`);
                count++;
            }
        }
        return count;
    }
    match(request, options) {
        const namespaceKeys = options?.namespaceKeys;
        const config = {
            enableWildcard: options?.wildcard ?? true, // default to true.
            rejectReferences: options?.rejectReferences ?? true, // default to true.
            history: options?.history,
            conflicts: options?.conflicts,
            matchPartsCache: (0,_constructionMatch_js__WEBPACK_IMPORTED_MODULE_4__.createMatchPartsCache)(request),
        };
        // If the useTranslators is undefined use all the translators
        // otherwise filter the translators based on the useTranslators
        const matches = [];
        const filter = namespaceKeys ? new Set(namespaceKeys) : undefined;
        for (const [name, constructionNamespace,] of this.constructionNamespaces.entries()) {
            const keys = getNamespaceKeys(name);
            if (keys.some((key) => filter?.has(key) === false)) {
                continue;
            }
            matches.push(...this.getMatches(request, config, constructionNamespace));
        }
        debugConstMatchStat((0,_constructionMatch_js__WEBPACK_IMPORTED_MODULE_4__.getMatchPartsCacheStats)(config.matchPartsCache));
        return matches.sort((a, b) => {
            // REVIEW: temporary heuristics to get better result with wildcards
            // Prefer non-wildcard matches
            if (a.wildcardCharCount === 0) {
                if (b.wildcardCharCount !== 0) {
                    return -1;
                }
            }
            else {
                if (b.wildcardCharCount === 0) {
                    return 1;
                }
            }
            // Prefer less implicit parameters
            if (a.construction.implicitParameterCount !==
                b.construction.implicitParameterCount) {
                return (a.construction.implicitParameterCount -
                    b.construction.implicitParameterCount);
            }
            // Prefer more non-optional parts
            if (b.nonOptionalCount !== a.nonOptionalCount) {
                return b.nonOptionalCount - a.nonOptionalCount;
            }
            // Prefer more matched parts
            if (b.matchedCount !== a.matchedCount) {
                return b.matchedCount - a.matchedCount;
            }
            // Prefer less wildcard characters
            return a.wildcardCharCount - b.wildcardCharCount;
        });
    }
    get matchSets() {
        return this.matchSetsByUid.values();
    }
    toJSON() {
        return {
            version: constructionCacheJSONVersion,
            explainerName: this.explainerName,
            matchSets: Array.from(this.matchSets),
            constructionNamespaces: Array.from(this.constructionNamespaces.entries()).map(([name, constructionNamespace]) => ({
                name,
                constructions: constructionNamespace.constructions,
            })),
            transformNamespaces: Array.from(this.transformNamespaces.entries()).map(([name, transforms]) => ({
                name,
                transforms,
            })),
        };
    }
    static fromJSON(originalJSON) {
        const json = ensureVersion(originalJSON);
        const store = new ConstructionCache(json.explainerName);
        // Load the match sets
        const allMatchSets = new Map();
        for (const matchSet of json.matchSets) {
            const newMatchSet = new _matchPart_js__WEBPACK_IMPORTED_MODULE_1__.MatchSet(matchSet.matches, matchSet.basename, matchSet.canBeMerged, matchSet.namespace, matchSet.index);
            const uid = matchSet.canBeMerged
                ? newMatchSet.mergedUid
                : newMatchSet.unmergedUid;
            store.matchSetsByUid.set(uid, newMatchSet);
            allMatchSets.set(newMatchSet.fullName, newMatchSet);
        }
        // load the constructions and transforms for each translator
        json.constructionNamespaces.forEach(({ name, constructions }) => {
            const newConstructions = constructions.map((construction, index) => _constructions_js__WEBPACK_IMPORTED_MODULE_0__.Construction.fromJSON(construction, allMatchSets, store.transformNamespaces, index));
            store.constructionNamespaces.set(name, {
                constructions: newConstructions,
                maxId: newConstructions.length,
            });
            debugConst(newConstructions.join("\n  "));
        });
        json.transformNamespaces.forEach(({ name, transforms }) => {
            store.transformNamespaces.set(name, _transforms_js__WEBPACK_IMPORTED_MODULE_2__.Transforms.fromJSON(transforms));
        });
        return store;
    }
    // for viewers
    getConstructionNamespace(namespace) {
        return this.constructionNamespaces.get(namespace);
    }
    getConstructionNamespaces() {
        return Array.from(this.constructionNamespaces.keys());
    }
    getTransformNamespaces() {
        return this.transformNamespaces;
    }
}
const constructionCacheJSONVersion2 = 2;
function ensureVersion(json) {
    if (json.version === constructionCacheJSONVersion) {
        return json;
    }
    if (json.version !== constructionCacheJSONVersion2) {
        throw new Error(`Unsupported version of ConstructionCache: ${json.version}`);
    }
    // Convert from V2 to V3
    const jsonV2 = json;
    const { matchSets, matchSetToTransformInfo } = (0,_matchPart_js__WEBPACK_IMPORTED_MODULE_1__.convertMatchSetV2ToV3)(jsonV2.matchSets);
    const constructionNamespaces = new Map();
    for (const { name, constructions } of jsonV2.translators) {
        (0,_constructions_js__WEBPACK_IMPORTED_MODULE_0__.convertConstructionV2ToV3)(constructions, matchSetToTransformInfo);
        // v3 only use the translator name as the namespaces for constructions.
        const namespace = name.split(".")[0];
        const existing = constructionNamespaces.get(namespace) ?? [];
        existing.push(...constructions);
        constructionNamespaces.set(namespace, existing);
    }
    const jsonV3 = {
        version: constructionCacheJSONVersion,
        explainerName: jsonV2.explainerName,
        matchSets,
        constructionNamespaces: Array.from(constructionNamespaces.entries()).map(([name, constructions]) => ({
            name,
            constructions,
        })),
        transformNamespaces: jsonV2.translators.map(({ name, transforms }) => {
            return { name, transforms };
        }),
    };
    return jsonV3;
}
//# sourceMappingURL=constructionCache.js.map

/***/ }),

/***/ "../cache/dist/constructions/constructionMatch.js":
/*!********************************************************!*\
  !*** ../cache/dist/constructions/constructionMatch.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createMatchPartsCache: () => (/* binding */ createMatchPartsCache),
/* harmony export */   getMatchPartsCacheStats: () => (/* binding */ getMatchPartsCacheStats),
/* harmony export */   matchParts: () => (/* binding */ matchParts)
/* harmony export */ });
/* harmony import */ var _utils_language_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/language.js */ "../cache/dist/utils/language.js");
/* harmony import */ var _utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/regexp.js */ "../cache/dist/utils/regexp.js");
/* harmony import */ var _constructionValue_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constructionValue.js */ "../cache/dist/constructions/constructionValue.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.



const wildcardRegex = new RegExp(`^${_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.spaceAndPunctuationRegexStr}*([^\\s].*?)${_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.spaceAndPunctuationRegexStr}*$`);
function matchParts(request, parts, config, matchValueTranslator) {
    const state = {
        capture: [],
        matchedStart: [],
        matchedEnd: [],
        matchedCurrent: 0,
        pendingWildcard: -1,
    };
    const wildcardQueue = [];
    do {
        if (finishMatchParts(state, request, parts, config)) {
            const values = (0,_constructionValue_js__WEBPACK_IMPORTED_MODULE_2__.matchedValues)(parts, state.capture, config, matchValueTranslator);
            if (values !== undefined) {
                return values;
            }
        }
    } while (backtrack(state, request, parts, config, wildcardQueue));
    return undefined;
}
function findPendingWildcard(request, matchedCurrent) {
    let current = matchedCurrent + 1; // wildcard must have at least one character
    while (current < request.length) {
        if ((0,_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.isWordBoundary)(request, current)) {
            const wildcardRange = request.substring(matchedCurrent, current);
            const wildcardMatch = wildcardRegex.exec(wildcardRange);
            if (wildcardMatch !== null) {
                break;
            }
        }
        // not word boundary or no text for the wildcard
        current++;
    }
    // first potential end of the wildcard
    return current - matchedCurrent;
}
const langTool = (0,_utils_language_js__WEBPACK_IMPORTED_MODULE_0__.getLanguageTools)("en");
function captureMatch(state, part, m, rejectReference) {
    if (part.capture) {
        state.capture.push(m.text);
        if (rejectReference && langTool?.possibleReferentialPhrase(m.text)) {
            // The captured text can't be a referential phrase.
            // Return false after adding the text to capture so that backtrack will
            // try longer wildcard before this part or shorter match for this part.
            return false;
        }
    }
    return true;
}
function captureWildcardMatch(state, wildcardText, rejectReferences) {
    if (rejectReferences && langTool?.possibleReferentialPhrase(wildcardText)) {
        // The wildcard can't be a referential phrase. Return false before adding
        // the wildcard text to capture to stop backtrack and try another state
        // from the wildcard queue (that is not at this position).
        return false;
    }
    state.pendingWildcard = -1;
    state.capture.push(wildcardText);
    state.matchedEnd.push(-1); // Use -1 to indicate a wildcard match
    return true;
}
function finishMatchParts(state, request, parts, config) {
    while (state.matchedStart.length < parts.length) {
        const part = parts[state.matchedStart.length];
        const m = matchRegExp(state, request, part.regExp, config.matchPartsCache);
        if (m === undefined) {
            // No match
            if (part.optional) {
                // Skip the optional part
                state.matchedStart.push(-1);
                continue;
            }
            return false;
        }
        // Matched
        if (state.pendingWildcard !== -1) {
            const wildcardText = m.wildcard;
            const wildpart = parts[state.matchedStart.length - 1];
            if (!captureWildcardMatch(state, wildcardText, config.rejectReferences &&
                wildpart.wildcardMode !== 2 /* WildcardMode.Checked */)) {
                return false;
            }
            state.matchedStart.push(m.start);
        }
        else {
            state.matchedStart.push(state.matchedCurrent);
        }
        const matchedEnd = m.start + m.text.length;
        state.matchedEnd.push(matchedEnd);
        state.matchedCurrent = matchedEnd;
        if (!captureMatch(state, part, m, config.rejectReferences)) {
            return false;
        }
    }
    if (state.pendingWildcard === -1) {
        // The tail should only be space or punctuation
        return (state.matchedCurrent === request.length ||
            (0,_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.isSpaceOrPunctuationRange)(request, state.matchedCurrent, request.length));
    }
    // End with wildcard
    const wildcardRange = request.substring(state.matchedCurrent);
    const wildcardMatch = wildcardRegex.exec(wildcardRange);
    if (wildcardMatch !== null) {
        // Update the state in case we need to backtrack because value translation failed.
        if (!captureWildcardMatch(state, wildcardMatch[1], config.rejectReferences)) {
            return false;
        }
        state.matchedCurrent = request.length;
        return true;
    }
    return false;
}
function cloneMatchState(state) {
    return {
        capture: [...state.capture],
        matchedStart: [...state.matchedStart],
        matchedEnd: [...state.matchedEnd],
        matchedCurrent: state.matchedCurrent,
        pendingWildcard: state.pendingWildcard,
    };
}
function resumeFromWildcardQueue(state, request, wildcardQueue) {
    // backtrack to from the wildcard queue
    const wildcardState = wildcardQueue.shift();
    if (wildcardState === undefined) {
        // No more to backtrack
        return false;
    }
    // Restore the state and set up the next wildcard.
    state.matchedStart = wildcardState.matchedStart;
    state.matchedEnd = wildcardState.matchedEnd;
    state.matchedCurrent = wildcardState.matchedCurrent;
    state.capture = wildcardState.capture;
    state.pendingWildcard = findPendingWildcard(request, state.matchedCurrent);
    state.matchedStart.push(state.matchedCurrent);
    return true;
}
function backtrack(state, request, parts, config, wildcardQueue) {
    if (config.enableWildcard) {
        // if the part we failed to match could be wildcard, queue up the wildcard match for later
        const failedPart = parts[state.matchedStart.length];
        if (failedPart && failedPart.wildcardMode) {
            // Do not queue up consecutive wildcard.
            if (state.pendingWildcard === -1) {
                wildcardQueue.push(cloneMatchState(state));
            }
        }
    }
    // Go thru the previous match to backtrack to to resume the search.
    // - wildcard that can be longer
    // - shorter match
    // - skip space and punctuation
    // - skipping optional part
    while (true) {
        const backtrackStart = state.matchedStart.pop();
        if (backtrackStart === undefined) {
            // No more to backtrack, resume from wildcard queue if available
            return resumeFromWildcardQueue(state, request, wildcardQueue);
        }
        if (backtrackStart === -1) {
            // the part was skipped (optional), continue to find the part that was not skipped
            continue;
        }
        const lastMatchedCurrent = state.matchedCurrent;
        state.matchedCurrent = backtrackStart;
        if (state.pendingWildcard !== -1) {
            // This mean we can't find the next part after the wildcard
            // since wildcard are matched from cloned state, no more backtracking is necessary.
            // resume from wildcard queue if available
            return resumeFromWildcardQueue(state, request, wildcardQueue);
        }
        const backtrackPart = parts[state.matchedStart.length];
        if (backtrackPart.capture) {
            state.capture.pop();
        }
        const backtrackEnd = state.matchedEnd.pop();
        if (backtrackEnd === -1) {
            // -1 indicates a wildcard match
            if (lastMatchedCurrent >= request.length - 1) {
                // wildcard can't be longer
                // since wildcard are matched from cloned state, no more backtracking is necessary.
                // resume from wildcard queue if available
                return resumeFromWildcardQueue(state, request, wildcardQueue);
            }
            // Try for a longer wildcard
            state.pendingWildcard = lastMatchedCurrent - backtrackStart + 1;
            state.matchedStart.push(backtrackStart);
            return true;
        }
        // Try to find a shorter match or skip space and punctuation
        const backtrackMatch = backtrackPartNextMatch(request, backtrackStart, backtrackEnd, backtrackPart, config.matchPartsCache);
        if (backtrackMatch !== undefined) {
            // record the backtrack next match and continue the search
            state.matchedStart.push(backtrackMatch.start);
            const matchedEnd = backtrackMatch.start + backtrackMatch.text.length;
            state.matchedEnd.push(matchedEnd);
            state.matchedCurrent = matchedEnd;
            if (!captureMatch(state, backtrackPart, backtrackMatch, config.rejectReferences)) {
                // continue to backtrack.
                continue;
            }
            return true;
        }
        // Give up on the current backtrackPart, queue up wildcard match for later if enabled.
        if (config.enableWildcard && backtrackPart.wildcardMode) {
            // queue up wildcard match
            wildcardQueue.push(cloneMatchState(state));
        }
        // Check if it is optional, backtrack to before the optional and resume the search
        if (backtrackPart.optional) {
            // REVIEW: the constructor enforced that parts before and after a wildcard can't be optional.
            // Otherwise, we need to restor pendingWildcard state here.
            state.matchedStart.push(-1);
            return true;
        }
        // continue to backtrack if it is not optional and no shorter match
    }
}
function backtrackPartNextMatch(request, lastStart, lastEnd, part, matchPartsCache) {
    // Check if the part has a shorter match
    const backtrackString = request.substring(0, lastEnd - 1);
    const backtrackMatch = matchRegExpAt(backtrackString, lastStart, part.regExp, matchPartsCache);
    // If no shorter match and matched position is space or punctuation, try to match skipping it.
    return (backtrackMatch ??
        ((0,_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.isSpaceOrPunctuation)(request, lastStart)
            ? matchRegExpWithoutWildcard(request, lastStart + 1, part.regExp, matchPartsCache)
            : undefined));
}
function matchRegExpWithWildcard(request, matchedCurrent, regExp, pendingWildcard, matchPartsCache) {
    let searchStart = matchedCurrent + pendingWildcard;
    while (searchStart < request.length) {
        // Skip to the next word boundary
        if (!(0,_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.isWordBoundary)(request, searchStart)) {
            searchStart++;
            continue;
        }
        // Check if we can find a match with regExp (include shorter match and space skipping)
        const result = matchRegExpWithoutWildcard(request, searchStart, regExp, matchPartsCache);
        if (result === undefined) {
            searchStart++;
            continue;
        }
        // Found a match, fill in the wildcard
        const wildcardRange = request.substring(matchedCurrent, result.start);
        const wildcardMatch = wildcardRegex.exec(wildcardRange);
        if (wildcardMatch === null) {
            throw new Error("internal error: wildcard should have text");
        }
        result.wildcard = wildcardMatch[1];
        return result;
    }
    return undefined;
}
function matchRegExpAt(request, start, regExp, matchPartsCache) {
    let currentRange = request;
    while (true) {
        const text = stickyRegExpExecWithCache(regExp, currentRange, start, matchPartsCache);
        if (text === null) {
            // No smaller match found at the index
            return undefined;
        }
        const matchedEnd = start + text.length;
        if ((0,_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.isWordBoundary)(request, matchedEnd)) {
            return { start, text };
        }
        if (matchedEnd - start === 1) {
            // Can't go smaller
            return undefined;
        }
        currentRange = request.substring(0, matchedEnd - 1);
    }
}
function matchRegExpWithoutWildcard(request, matchedCurrent, regExp, matchPartsCache) {
    let i = matchedCurrent;
    do {
        const matched = matchRegExpAt(request, i, regExp, matchPartsCache);
        if (matched) {
            return matched;
        }
        if (!(0,_utils_regexp_js__WEBPACK_IMPORTED_MODULE_1__.isSpaceOrPunctuation)(request, i)) {
            return undefined;
        }
        i++;
    } while (i < request.length);
}
function matchRegExp(state, request, regExp, matchPartsCache) {
    if (!regExp.sticky) {
        throw new Error("RegExp should be sticky");
    }
    return state.pendingWildcard !== -1
        ? matchRegExpWithWildcard(request, state.matchedCurrent, regExp, state.pendingWildcard, matchPartsCache)
        : matchRegExpWithoutWildcard(request, state.matchedCurrent, regExp, matchPartsCache);
}
function stickyRegExpExec(regExp, s, start) {
    regExp.lastIndex = start;
    const matched = regExp.exec(s);
    if (matched === null) {
        return null;
    }
    if (matched.index !== start) {
        throw new Error("internal error: sticky regex should match at index");
    }
    return matched[0];
}
function createMatchPartsCache(cachedString) {
    return {
        cachedString,
        cache: new Map(),
        cacheWithEnd: new Map(),
        totalTime: 0,
        hit: 0,
        miss: 0,
    };
}
function getMatchPartsCacheStats(matchPartsCache) {
    const total = matchPartsCache.hit + matchPartsCache.miss;
    const messages = [];
    messages.push(`  Time: ${matchPartsCache.totalTime}`);
    messages.push(`   Hit: ${matchPartsCache.hit} (${((matchPartsCache.hit / total) * 100).toFixed(2)}%)`);
    messages.push(`  Miss: ${matchPartsCache.miss} (${((matchPartsCache.miss / total) * 100).toFixed(2)}%)`);
    messages.push(`Regexp: ${matchPartsCache.cache.size}`);
    return messages.join("\n");
}
function getResultCache(matchPartsCache, regExp, s, start) {
    let cache;
    if (matchPartsCache.cachedString === s) {
        cache = matchPartsCache.cache;
    }
    else {
        if (!matchPartsCache.cachedString.startsWith(s)) {
            throw new Error(`internal error: cache should be prefix\n${matchPartsCache.cachedString}\n${s}`);
        }
        const length = s.length - start;
        const existingCache = matchPartsCache.cacheWithEnd.get(length);
        if (existingCache !== undefined) {
            cache = existingCache;
        }
        else {
            cache = new Map();
            matchPartsCache.cacheWithEnd.set(length, cache);
        }
    }
    const resultCache = cache.get(regExp);
    if (resultCache !== undefined) {
        return resultCache;
    }
    const newResultCache = [];
    cache.set(regExp, newResultCache);
    return newResultCache;
}
function stickyRegExpExecWithCache(regExp, s, start, matchPartsCache) {
    if (matchPartsCache === undefined) {
        return stickyRegExpExec(regExp, s, start);
    }
    const resultCache = getResultCache(matchPartsCache, regExp, s, start);
    if (resultCache[start] !== undefined) {
        matchPartsCache.hit++;
        return resultCache[start];
    }
    matchPartsCache.miss++;
    const startTime = performance.now();
    const result = stickyRegExpExec(regExp, s, start);
    matchPartsCache.totalTime += performance.now() - startTime;
    resultCache[start] = result;
    return result;
}
//# sourceMappingURL=constructionMatch.js.map

/***/ }),

/***/ "../cache/dist/constructions/constructionValue.js":
/*!********************************************************!*\
  !*** ../cache/dist/constructions/constructionValue.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createActionProps: () => (/* binding */ createActionProps),
/* harmony export */   matchedValues: () => (/* binding */ matchedValues)
/* harmony export */ });
/* harmony import */ var common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! common-utils */ "../commonUtils/dist/indexBrowser.js");
/* harmony import */ var _matchPart_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./matchPart.js */ "../cache/dist/constructions/matchPart.js");
/* harmony import */ var _parsePart_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parsePart.js */ "../cache/dist/constructions/parsePart.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.



function matchedValues(parts, matched, config, matchValueTranslator) {
    const matchedParts = parts.filter((e) => e.capture);
    if (matchedParts.length !== matched.length) {
        throw new Error("Internal error: number of matched parts doesn't equal match groups");
    }
    const values = [];
    const conflictValues = config.conflicts ? [] : undefined;
    let matchedCount = 0;
    let wildcardCharCount = 0;
    const wildcardNames = new Set();
    const matchedTransformText = new Map();
    for (let i = 0; i < matchedParts.length; i++) {
        const part = matchedParts[i];
        const match = matched[i];
        if ((0,_matchPart_js__WEBPACK_IMPORTED_MODULE_1__.isMatchPart)(part)) {
            for (const info of part.transformInfos) {
                // Format of key doesn't matter, it is only to ensure uniqueness
                const key = (0,_matchPart_js__WEBPACK_IMPORTED_MODULE_1__.toTransformInfoKey)(info);
                let entry = matchedTransformText.get(key);
                if (entry !== undefined) {
                    entry.text.push(match);
                }
                else {
                    entry = { transformInfo: info, text: [match] };
                    matchedTransformText.set(key, entry);
                    if (config.enableWildcard && part.wildcardMode) {
                        wildcardNames.add(key);
                    }
                }
            }
        }
        else if ((0,_parsePart_js__WEBPACK_IMPORTED_MODULE_2__.isParsePart)(part)) {
            values.push([
                part.propertyName,
                matchValueTranslator.parse(part, match),
            ]);
            matchedCount++;
        }
        else {
            throw new Error("Internal error: unknown part type");
        }
    }
    for (const [key, matches] of matchedTransformText.entries()) {
        // See if there are known entities
        const value = matchValueTranslator.transform(matches.transformInfo, matches.text, config.history);
        const { transformName, actionIndex } = matches.transformInfo;
        const propertyName = `${actionIndex !== undefined ? `${actionIndex}.` : ""}${transformName}`;
        if (value !== undefined) {
            values.push([propertyName, value]);
            matchedCount++;
            if (conflictValues !== undefined) {
                const v = matchValueTranslator.transformConflicts?.(matches.transformInfo, matches.text);
                if (v !== undefined) {
                    conflictValues.push([propertyName, v]);
                }
            }
            continue;
        }
        // Try wildcard
        if (wildcardNames.has(key)) {
            // Wildcard match
            if (matches.text.length > 1) {
                // TODO: Don't support multiple subphrase wildcard match for now.
                return undefined;
            }
            const match = matches.text.join(" ");
            values.push([propertyName, match]);
            wildcardCharCount += match.length;
            continue;
        }
        // TODO: Only deal with exact match for now
        return undefined;
    }
    return {
        values,
        conflictValues,
        matchedCount,
        wildcardCharCount,
    };
}
function createActionProps(values, initial) {
    const result = { actionProps: structuredClone(initial) };
    for (const [name, value] of values) {
        (0,common_utils__WEBPACK_IMPORTED_MODULE_0__.setObjectProperty)(result, "actionProps", name, value);
    }
    const actionProps = result.actionProps;
    // validate fullActionName
    if (Array.isArray(actionProps)) {
        actionProps.forEach((actionProp) => {
            if (actionProp.fullActionName === undefined) {
                throw new Error("Internal error: fullActionName missing");
            }
        });
    }
    else {
        if (actionProps.fullActionName === undefined) {
            throw new Error("Internal error: fullActionName missing");
        }
    }
    return actionProps;
}
//# sourceMappingURL=constructionValue.js.map

/***/ }),

/***/ "../cache/dist/constructions/constructions.js":
/*!****************************************************!*\
  !*** ../cache/dist/constructions/constructions.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Construction: () => (/* binding */ Construction),
/* harmony export */   convertConstructionV2ToV3: () => (/* binding */ convertConstructionV2ToV3)
/* harmony export */ });
/* harmony import */ var _explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../explanation/requestAction.js */ "../cache/dist/explanation/requestAction.js");
/* harmony import */ var _constructionMatch_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constructionMatch.js */ "../cache/dist/constructions/constructionMatch.js");
/* harmony import */ var _parsePart_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parsePart.js */ "../cache/dist/constructions/parsePart.js");
/* harmony import */ var _matchPart_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./matchPart.js */ "../cache/dist/constructions/matchPart.js");
/* harmony import */ var _constructionValue_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constructionValue.js */ "../cache/dist/constructions/constructionValue.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.





function getDefaultTranslator(transformNamespaces) {
    return {
        transform(transformInfo, matchedText, history) {
            const matchedTextKey = matchedText.join("|");
            const { namespace, transformName } = transformInfo;
            return transformNamespaces
                .get(namespace)
                ?.get(transformName, matchedTextKey, history);
        },
        transformConflicts(transformInfo, matchedText) {
            const matchedTextKey = matchedText.join("|");
            const { namespace, transformName } = transformInfo;
            return transformNamespaces
                .get(namespace)
                ?.getConflicts(transformName, matchedTextKey);
        },
        parse(parsePart, match) {
            return parsePart.convertToValue(match);
        },
    };
}
class Construction {
    static create(parts, transformNamespaces, implicitParameters, implicitActionName) {
        return new Construction(parts, transformNamespaces, implicitParameters, implicitActionName, -1);
    }
    constructor(parts, transformNamespaces, implicitParameters, implicitActionName, id) {
        this.parts = parts;
        this.transformNamespaces = transformNamespaces;
        this.implicitParameters = implicitParameters;
        this.implicitActionName = implicitActionName;
        this.id = id;
        if (parts.every((p) => p.optional)) {
            throw new Error("Construction must have one non-optional part");
        }
    }
    get implicitParameterCount() {
        return this.implicitParameters ? this.implicitParameters.length : 0;
    }
    match(request, config) {
        const matchedValues = (0,_constructionMatch_js__WEBPACK_IMPORTED_MODULE_1__.matchParts)(request, this.parts, config, getDefaultTranslator(this.transformNamespaces));
        if (matchedValues === undefined) {
            return [];
        }
        this.collectImplicitProperties(matchedValues.values);
        const actionProps = (0,_constructionValue_js__WEBPACK_IMPORTED_MODULE_4__.createActionProps)(matchedValues.values);
        return [
            {
                construction: this,
                match: new _explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.RequestAction(request, (0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.fromJsonActions)(actionProps), config.history),
                conflictValues: matchedValues.conflictValues,
                matchedCount: matchedValues.matchedCount,
                wildcardCharCount: matchedValues.wildcardCharCount,
                nonOptionalCount: this.parts.filter((p) => !p.optional).length,
            },
        ];
    }
    getMatchedValues(matched, config, matchValueTranslator) {
        const result = (0,_constructionValue_js__WEBPACK_IMPORTED_MODULE_4__.matchedValues)(this.parts, matched, config, matchValueTranslator);
        if (result === undefined) {
            return undefined;
        }
        this.collectImplicitProperties(result.values);
        return result;
    }
    collectImplicitProperties(values) {
        if (this.implicitParameters) {
            for (const implicit of this.implicitParameters) {
                values.push([implicit.paramName, implicit.paramValue]);
            }
        }
    }
    toString(verbose = false) {
        return `${this.parts.map((p) => p.toString(verbose)).join("")}${this.implicitParameterCount !== 0
            ? `[${this.implicitParameters
                ?.map((p) => `${p.paramName}=${p.paramValue}`)
                .join("][")}]`
            : ""}${this.implicitActionName
            ? `[actionName=${this.implicitActionName}]`
            : ""}`;
    }
    isSupersetOf(others, implicitParameters) {
        let index = 0;
        for (const e of others) {
            let found = false;
            while (index < this.parts.length) {
                if (e.equals(this.parts[index])) {
                    found = true;
                    index++;
                    break;
                }
                if (!this.parts[index].optional) {
                    return false;
                }
                index++;
            }
            if (!found) {
                return false;
            }
        }
        for (let curr = index; curr < this.parts.length; curr++) {
            if (!this.parts[curr].optional) {
                return false;
            }
        }
        // Check implicitParameters
        const otherLength = implicitParameters ? implicitParameters.length : 0;
        const thisLength = this.implicitParameters
            ? this.implicitParameters.length
            : 0;
        if (thisLength !== otherLength) {
            return false;
        }
        if (thisLength === 0) {
            return true;
        }
        const otherSorted = implicitParameters.sort((a, b) => a.paramName.localeCompare(b.paramName));
        const thisSorted = this.implicitParameters.sort((a, b) => a.paramName.localeCompare(b.paramName));
        for (let i = 0; i < thisLength; i++) {
            if (otherSorted[i].paramName !== thisSorted[i].paramName) {
                return false;
            }
            if (otherSorted[i].paramValue !== thisSorted[i].paramValue) {
                return false;
            }
        }
        return true;
    }
    static fromJSON(construction, allMatchSets, transformNamespaces, index) {
        return new Construction(construction.parts.map((part) => {
            if (isParsePartJSON(part)) {
                return (0,_parsePart_js__WEBPACK_IMPORTED_MODULE_2__.createParsePartFromJSON)(part);
            }
            const matchSet = allMatchSets.get(part.matchSet);
            if (matchSet === undefined) {
                throw new Error(`Unable to resolve MatchSet ${part.matchSet}`);
            }
            return new _matchPart_js__WEBPACK_IMPORTED_MODULE_3__.MatchPart(matchSet, part.optional ?? false, part.wildcardMode ?? 0 /* WildcardMode.Disabled */, part.transformInfos);
        }), transformNamespaces, construction.implicitParameters, construction.implicitActionName, index);
    }
    toJSON() {
        // NOTE: transform needs to be saved separately, as they are currently global when the construction is in a cache.
        return {
            parts: this.parts,
            implicitParameters: this.implicitParameters?.length === 0
                ? undefined
                : this.implicitParameters,
            implicitActionName: this.implicitActionName,
        };
    }
}
function isParsePartJSON(part) {
    return part.parserName !== undefined;
}
function convertConstructionV2ToV3(constructions, matchSetToTransformInfo) {
    for (const construction of constructions) {
        construction.parts.forEach((part) => {
            if (isParsePartJSON(part)) {
                throw new Error("ParsePart is not supported in V2");
            }
            const transformInfos = matchSetToTransformInfo.get(part.matchSet);
            if (transformInfos) {
                part.transformInfos = transformInfos;
            }
        });
    }
}
//# sourceMappingURL=constructions.js.map

/***/ }),

/***/ "../cache/dist/constructions/matchPart.js":
/*!************************************************!*\
  !*** ../cache/dist/constructions/matchPart.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MatchPart: () => (/* binding */ MatchPart),
/* harmony export */   MatchSet: () => (/* binding */ MatchSet),
/* harmony export */   convertMatchSetV2ToV3: () => (/* binding */ convertMatchSetV2ToV3),
/* harmony export */   createMatchPart: () => (/* binding */ createMatchPart),
/* harmony export */   isMatchPart: () => (/* binding */ isMatchPart),
/* harmony export */   toTransformInfoKey: () => (/* binding */ toTransformInfoKey)
/* harmony export */ });
/* harmony import */ var _utils_regexp_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/regexp.js */ "../cache/dist/utils/regexp.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

function toTransformInfoKey(transformInfo) {
    return `${transformInfo.namespace}::${transformInfo.actionIndex ? `${transformInfo.actionIndex}.}` : ""}${transformInfo.transformName}`;
}
function toTransformInfosKey(transformInfos) {
    return transformInfos?.map(toTransformInfoKey).sort().join(",");
}
function getMatchSetNamespace(transformInfos) {
    // Since the matchset needs to grow along with the available transform, we need to use the same
    // namespace schema, which is the transform namespace determined when the construction is created.
    // Currently the transform namespace is <translatorName> or <translatorName>.<actionName> depending on the SchemaConfig
    // See `getNamespaceForCache` in schemaConfig.ts
    // Flattening the pair using :: as the separator, and sort them so that it is stable for equality comparison
    return transformInfos
        ?.map((t) => `${t.namespace}::${t.transformName}`)
        .sort() // sort it so that it is stable
        .join(",");
}
/**
 * MatchSet
 *
 * Merge policy:
 * - If canBeMerged is false, it will never be substituted with other matchset unless it is an exact match.
 * - If canBeMerged is true, it will be merged with other match set with the same name AND transformInfo if any
 *
 * See mergedUid and unmergedUid for the look up key for them
 *
 * Additionally, merge can be enabled/disabled via a flag when construction is added to the cache.
 */
class MatchSet {
    constructor(matches, name, // note: characters "_", ",", "|", ":" are reserved for internal use
    canBeMerged, namespace, index = -1) {
        this.name = name;
        this.canBeMerged = canBeMerged;
        this.namespace = namespace;
        this.index = index;
        // Case insensitive match
        // TODO: non-diacritic match
        this.matches = new Set(Array.from(matches).map((m) => m.toLowerCase()));
    }
    get fullName() {
        return `${this.name}${this.index !== -1 ? `_${this.index}` : ""}`;
    }
    get mergedUid() {
        return `${this.name}${this.namespace ? `,${this.namespace}` : ""}`;
    }
    get unmergedUid() {
        // Use the static set of match set strings to ensure only exact match will be reused
        return `${this.mergedUid},${this.matchSetString}`;
    }
    get matchSetString() {
        return Array.from(this.matches).sort().join("|");
    }
    get regexPart() {
        return Array.from(this.matches)
            .sort((a, b) => b.length - a.length) // Match longest first
            .map((m) => (0,_utils_regexp_js__WEBPACK_IMPORTED_MODULE_0__.escapeMatch)(m))
            .join("|");
    }
    get regExp() {
        if (this._regExp === undefined) {
            this._regExp = new RegExp(`(?:${this.regexPart})`, "iuy");
        }
        return this._regExp;
    }
    forceRegexp() {
        const regExp = this.regExp;
        regExp.exec("");
        regExp.exec("");
        regExp.exec("");
        regExp.exec("");
        regExp.exec("");
    }
    clearRegexp() {
        this._regExp = undefined;
    }
    clone(canBeMerged, index) {
        return new MatchSet(this.matches, this.name, canBeMerged, this.namespace, index);
    }
    toJSON() {
        return {
            matches: Array.from(this.matches),
            basename: this.name,
            namespace: this.namespace,
            canBeMerged: this.canBeMerged,
            index: this.index,
        };
    }
}
class MatchPart {
    constructor(matchSet, optional, wildcardMode, transformInfos) {
        this.matchSet = matchSet;
        this.optional = optional;
        this.wildcardMode = wildcardMode;
        this.transformInfos = transformInfos;
    }
    get capture() {
        return this.transformInfos !== undefined;
    }
    get regExp() {
        return this.matchSet.regExp;
    }
    toString(verbose = false) {
        return (`<${verbose ? this.matchSet.fullName : this.matchSet.name}>` +
            (this.optional ? "?" : ""));
    }
    toJSON() {
        return {
            matchSet: this.matchSet.fullName,
            optional: this.optional ? true : undefined,
            wildcardMode: this.wildcardMode !== 0 /* WildcardMode.Disabled */
                ? this.wildcardMode
                : undefined,
            transformInfos: this.transformInfos,
        };
    }
    equals(e) {
        return (isMatchPart(e) &&
            e.matchSet === this.matchSet &&
            e.optional === this.optional &&
            e.wildcardMode === this.wildcardMode &&
            toTransformInfosKey(e.transformInfos) ===
                toTransformInfosKey(this.transformInfos));
    }
}
function createMatchPart(matches, name, options) {
    const canBeMerged = options?.canBeMerged ?? true;
    const optional = options?.optional ?? false;
    const wildcardMode = options?.wildcardMode ?? 0 /* WildcardMode.Disabled */;
    const transformInfos = options?.transformInfos;
    // Error checking
    if (wildcardMode && transformInfos === undefined) {
        throw new Error("Wildcard part must be captured");
    }
    if (optional && transformInfos !== undefined) {
        throw new Error("Optional part cannot be captured");
    }
    if (matches.some((m) => m === "")) {
        throw new Error("Empty match is not allowed");
    }
    // Add all the transform namespace and transformName to the match namespace
    // so that matches will have corresponding entry in the transforms
    const matchSetNamespace = getMatchSetNamespace(transformInfos);
    const matchSet = new MatchSet(matches, name, canBeMerged, matchSetNamespace);
    return new MatchPart(matchSet, optional, wildcardMode, transformInfos);
}
function isMatchPart(part) {
    return part.hasOwnProperty("matchSet");
}
function convertMatchSetV2ToV3(matchSetsV2) {
    const matchSets = [];
    const matchSetToTransformInfo = new Map();
    for (const matchSet of matchSetsV2) {
        let namespace;
        const oldTransformInfo = matchSet.transformInfo;
        if (oldTransformInfo !== undefined) {
            const transformInfo = oldTransformInfo.transformNames.map((transformName) => {
                return {
                    namespace: oldTransformInfo.translatorName,
                    transformName,
                };
            });
            const matchSetName = `${matchSet.basename}${matchSet.index !== -1 ? `_${matchSet.index}` : ""}`;
            matchSetToTransformInfo.set(matchSetName, transformInfo);
            namespace = getMatchSetNamespace(transformInfo);
        }
        matchSets.push({
            matches: matchSet.matches,
            basename: matchSet.basename,
            namespace,
            canBeMerged: matchSet.canBeMerged,
            index: matchSet.index,
        });
    }
    return { matchSets, matchSetToTransformInfo };
}
//# sourceMappingURL=matchPart.js.map

/***/ }),

/***/ "../cache/dist/constructions/parsePart.js":
/*!************************************************!*\
  !*** ../cache/dist/constructions/parsePart.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ParsePart: () => (/* binding */ ParsePart),
/* harmony export */   createParsePart: () => (/* binding */ createParsePart),
/* harmony export */   createParsePartFromJSON: () => (/* binding */ createParsePartFromJSON),
/* harmony export */   isParsePart: () => (/* binding */ isParsePart)
/* harmony export */ });
/* harmony import */ var _matchPart_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./matchPart.js */ "../cache/dist/constructions/matchPart.js");
/* harmony import */ var _propertyParser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./propertyParser.js */ "../cache/dist/constructions/propertyParser.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.


class ParsePart {
    constructor(propertyName, parser) {
        this.propertyName = propertyName;
        this.parser = parser;
    }
    get wildcardMode() {
        return 0 /* WildcardMode.Disabled */;
    }
    get capture() {
        return true;
    }
    get regExp() {
        return this.parser.regExp;
    }
    get optional() {
        return false;
    }
    convertToValue(match) {
        return this.parser.convertToValue(match);
    }
    equals(e) {
        return (isParsePart(e) &&
            e.propertyName === this.propertyName &&
            e.parser === this.parser);
    }
    toJSON() {
        return {
            propertyName: this.propertyName,
            parserName: this.parser.name,
        };
    }
    toString(verbose = false) {
        return `<P:${this.parser.name}${verbose ? `=${this.propertyName}` : ""}>`;
    }
}
function createParsePart(propertyName, parser) {
    return new ParsePart(propertyName, parser);
}
function createParsePartFromJSON(json) {
    const parser = (0,_propertyParser_js__WEBPACK_IMPORTED_MODULE_1__.getPropertyParser)(json.parserName);
    if (parser === undefined) {
        throw new Error(`Unable to resolve property parser ${json.parserName}`);
    }
    return createParsePart(json.propertyName, parser);
}
function isParsePart(part) {
    return !(0,_matchPart_js__WEBPACK_IMPORTED_MODULE_0__.isMatchPart)(part);
}
//# sourceMappingURL=parsePart.js.map

/***/ }),

/***/ "../cache/dist/constructions/propertyParser.js":
/*!*****************************************************!*\
  !*** ../cache/dist/constructions/propertyParser.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getPropertyParser: () => (/* binding */ getPropertyParser)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const propertyParsers = [
    {
        name: "number",
        valueType: "number",
        regExp: /-?\d+/y,
        convertToValue: (str) => parseInt(str),
    },
    {
        name: "percentage",
        valueType: "number",
        regExp: /-?\d+%/y,
        convertToValue: (str) => parseInt(str),
    },
];
const propertyParserMap = new Map(propertyParsers.map((p) => [p.name, p]));
function getPropertyParser(name) {
    return propertyParserMap.get(name);
}
//# sourceMappingURL=propertyParser.js.map

/***/ }),

/***/ "../cache/dist/constructions/transforms.js":
/*!*************************************************!*\
  !*** ../cache/dist/constructions/transforms.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Transforms: () => (/* binding */ Transforms)
/* harmony export */ });
/* harmony import */ var _explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../explanation/requestAction.js */ "../cache/dist/explanation/requestAction.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! debug */ "../../node_modules/.pnpm/debug@4.4.0_supports-color@8.1.1/node_modules/debug/src/browser.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.


const debugConstConflict = debug__WEBPACK_IMPORTED_MODULE_1__("typeagent:const:conflict");
function isTransformEntityRecord(record) {
    return record.entityTypes !== undefined;
}
class Transforms {
    constructor() {
        // paramName -> (text -> value)
        this.transforms = new Map();
    }
    add(paramName, text, value, original) {
        let map = this.transforms.get(paramName);
        if (map === undefined) {
            map = new Map();
            this.transforms.set(paramName, map);
        }
        // Case insensitive/non-diacritic match
        // Use the count ot heuristic to prefer values original to user request
        // and not from a synonym or alternative suggested by GPT
        this.addTransformRecord(map, (0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.normalizeParamString)(text), {
            value,
            count: original ? 1 : 0,
        });
    }
    addEntity(paramName, text, entityTypes) {
        let map = this.transforms.get(paramName);
        if (map === undefined) {
            map = new Map();
            this.transforms.set(paramName, map);
        }
        // Case insensitive/non-diacritic match
        this.addTransformRecord(map, (0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.normalizeParamString)(text), {
            entityTypes,
        });
    }
    addTransformRecord(map, text, value, clone, cacheConflicts) {
        const existingValue = map.get(text);
        // REVIEW: how do we deal with conflict transforms?
        if (existingValue !== undefined) {
            if (isTransformEntityRecord(existingValue)) {
                // Heuristic to prefer entity type over value
                return;
            }
            if (!isTransformEntityRecord(value)) {
                if (cacheConflicts) {
                    const normConflictValue = (0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.normalizeParamValue)(value.value);
                    const normExistingValue = (0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.normalizeParamValue)(existingValue.value);
                    if (normConflictValue === normExistingValue) {
                        existingValue.count += value.count;
                        return;
                    }
                    // store the conflict if it is enabled.
                    let existingConflictCount;
                    if (existingValue.conflicts === undefined) {
                        // Initialize the conflict map with the existing value.
                        existingValue.conflicts = new Map();
                        existingConflictCount = 0;
                        debugConstConflict(text, existingValue.value);
                    }
                    else {
                        existingConflictCount =
                            existingValue.conflicts.get(normConflictValue) ?? 0;
                    }
                    // Add the conflict value
                    if (debugConstConflict.enabled &&
                        existingConflictCount === 0 &&
                        !existingValue.conflicts.has(normConflictValue)) {
                        debugConstConflict(text, value.value);
                    }
                    existingConflictCount += value.count;
                    // Switch the value in use if the count is higher
                    if (existingValue.count <= existingConflictCount) {
                        existingValue.conflicts.delete(normConflictValue);
                        existingValue.conflicts.set(normExistingValue, existingValue.count);
                        existingValue.count = existingConflictCount;
                        existingValue.value = value.value;
                    }
                    else {
                        existingValue.conflicts.set(normConflictValue, existingConflictCount);
                    }
                }
                else {
                    if ((0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.equalNormalizedParamValue)(existingValue.value, value.value)) {
                        // No need to replace if the value is the same. Just update the count.
                        if (value.count > existingValue.count) {
                            existingValue.count = value.count;
                            existingValue.conflicts = undefined;
                        }
                        return;
                    }
                    // Heuristic to prefer values original to user request
                    // and not from a synonym or alternative suggested by GPT
                    // If the same, we prefer the latest value
                    if (existingValue.count <= value.count) {
                        existingValue.value = value.value;
                        existingValue.count = value.count;
                        existingValue.conflicts = undefined;
                        debugConstConflict(text, existingValue.value, value.value);
                    }
                }
            }
        }
        else {
            map.set(text, clone ? structuredClone(value) : value);
        }
    }
    merge(transforms, cacheConflicts) {
        transforms.transforms.forEach((textTransform, paramName) => {
            const existing = this.transforms.get(paramName);
            if (existing !== undefined) {
                textTransform.forEach((value, key) => {
                    this.addTransformRecord(existing, key, value, true, cacheConflicts);
                });
            }
            else {
                this.transforms.set(paramName, new Map(textTransform));
            }
        });
    }
    get(paramName, text, history) {
        const textTransform = this.transforms.get(paramName);
        if (textTransform === undefined) {
            throw new Error(`Internal error: no transform found for ${paramName}`);
        }
        // Case insensitive/non-diacritic match
        const record = textTransform.get((0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.normalizeParamString)(text));
        if (record === undefined) {
            return undefined;
        }
        if (isTransformEntityRecord(record)) {
            // TODO: Better history matching heuristic. Currently it will just the first one in the list.
            return history?.entities.find((entity) => record.entityTypes.every((entityType) => entity.type.includes(entityType)))?.name;
        }
        return record.value;
    }
    getConflicts(paramName, text) {
        const textTransform = this.transforms.get(paramName);
        if (textTransform === undefined) {
            throw new Error(`Internal error: no transform found for ${paramName}`);
        }
        // Case insensitive/non-diacritic match
        const record = textTransform.get((0,_explanation_requestAction_js__WEBPACK_IMPORTED_MODULE_0__.normalizeParamString)(text));
        if (record === undefined ||
            isTransformEntityRecord(record) ||
            record.conflicts === undefined) {
            return undefined;
        }
        return Array.from(record.conflicts.keys());
    }
    toJSON() {
        const transformsJSON = [];
        this.transforms.forEach((transformMap, name) => {
            const transform = [];
            for (const [text, record] of transformMap.entries()) {
                if (isTransformEntityRecord(record)) {
                    transform.push([text, record]);
                }
                else {
                    transform.push([
                        text,
                        {
                            value: record.value,
                            count: record.count,
                            conflicts: record.conflicts
                                ? Array.from(record.conflicts.entries())
                                : undefined,
                        },
                    ]);
                }
            }
            transformsJSON.push({
                name,
                transform,
            });
        });
        return transformsJSON;
    }
    static fromJSON(transformsJSON) {
        const transforms = new Transforms();
        for (const transform of transformsJSON) {
            const transformRecords = transform.transform.map(([text, record]) => {
                if (isTransformEntityRecord(record)) {
                    return [text, record];
                }
                // Legacy format for count, convert to new format
                const count = (record.count ?? record.original) ? 1 : 0;
                const valueRecord = {
                    value: record.value,
                    count,
                    conflicts: record.conflicts
                        ? new Map(record.conflicts)
                        : undefined,
                };
                return [text, valueRecord];
            });
            transforms.transforms.set(transform.name, new Map(transformRecords));
        }
        return transforms;
    }
    toString(prefix = "  ") {
        const transforms = Array.from(this.transforms.entries());
        const result = [];
        for (const [paramName, transformMap] of transforms) {
            result.push(`${prefix}${paramName}:`);
            for (const [key, value] of transformMap) {
                result.push(`${prefix}  ${key} -> ${isTransformEntityRecord(value) ? `(entity types: ${value.entityTypes.join(", ")})` : value.value}`);
            }
        }
        return result.join("\n");
    }
}
//# sourceMappingURL=transforms.js.map

/***/ }),

/***/ "../cache/dist/explanation/requestAction.js":
/*!**************************************************!*\
  !*** ../cache/dist/explanation/requestAction.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RequestAction: () => (/* binding */ RequestAction),
/* harmony export */   createExecutableAction: () => (/* binding */ createExecutableAction),
/* harmony export */   equalNormalizedParamObject: () => (/* binding */ equalNormalizedParamObject),
/* harmony export */   equalNormalizedParamValue: () => (/* binding */ equalNormalizedParamValue),
/* harmony export */   fromJsonActions: () => (/* binding */ fromJsonActions),
/* harmony export */   getFullActionName: () => (/* binding */ getFullActionName),
/* harmony export */   getTranslationNamesForActions: () => (/* binding */ getTranslationNamesForActions),
/* harmony export */   normalizeParamString: () => (/* binding */ normalizeParamString),
/* harmony export */   normalizeParamValue: () => (/* binding */ normalizeParamValue),
/* harmony export */   toExecutableActions: () => (/* binding */ toExecutableActions),
/* harmony export */   toFullActions: () => (/* binding */ toFullActions),
/* harmony export */   toJsonActions: () => (/* binding */ toJsonActions)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function normalizeParamString(str) {
    return str
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
}
function normalizeParamValue(value) {
    return typeof value === "string" ? normalizeParamString(value) : value;
}
function equalNormalizedParamValue(a, b) {
    return a === b || normalizeParamValue(a) === normalizeParamValue(b);
}
function equalNormalizedParamObject(a = {}, b = {}) {
    return (normalizeParamString(JSON.stringify(a)) ===
        normalizeParamString(JSON.stringify(b)));
}
function createExecutableAction(translatorName, actionName, parameters, resultEntityId) {
    const action = {
        translatorName,
        actionName,
    };
    if (parameters !== undefined) {
        action.parameters = parameters;
    }
    const executableAction = {
        action,
    };
    if (resultEntityId !== undefined) {
        executableAction.resultEntityId = resultEntityId;
    }
    return executableAction;
}
const format = "'<request> => translator.action(<parameters>)' or '<request> => [ translator.action1(<parameters1>), translator.action2(<parameters2>), ... ]'";
function parseFullActionNameParts(fullActionName) {
    const parts = fullActionName.split(".");
    const translatorName = parts.slice(0, -1).join(".");
    const actionName = parts.at(-1);
    return { translatorName, actionName };
}
function parseAction(action, index = -1) {
    const leftParan = action.indexOf("(");
    if (leftParan === -1) {
        throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Missing '('. Input must be in the form of ${format}`);
    }
    const functionName = action.substring(0, leftParan);
    const { translatorName, actionName } = parseFullActionNameParts(functionName);
    if (!actionName) {
        throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Unable to parse action name from '${functionName}'. Input must be in the form of ${format}`);
    }
    if (action[action.length - 1] !== ")") {
        throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Missing terminating ')'. Input must be in the form of ${format}`);
    }
    const paramStr = action.substring(leftParan + 1, action.length - 1).trim();
    let parameters;
    if (paramStr) {
        try {
            parameters = JSON.parse(paramStr);
        }
        catch (e) {
            throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Unable to parse parameters as JSON: '${paramStr}\n${e.message}'`);
        }
    }
    return createExecutableAction(translatorName, actionName, parameters);
}
function parseActions(actionStr) {
    if (actionStr[actionStr.length - 1] !== "]") {
        `Missing terminating ']'. Input must be in the form of ${format}`;
    }
    const actions = [];
    // Remove the brackets
    let curr = actionStr.substring(1, actionStr.length - 1);
    // Try guessing the end of the action and try parsing it.
    let right = -1;
    while (true) {
        // Find the next possible end of the action
        right = curr.indexOf("}),", right + 1);
        if (right === -1) {
            // End of the list, try parse the error, and if it fails, the error propagates
            actions.push(parseAction(curr, actions.length + 1));
            break;
        }
        const action = curr.substring(0, right + 2);
        try {
            // Try to see if we can parse action.
            actions.push(parseAction(action, actions.length));
        }
        catch {
            // If not, it could be that the pattern is in a quote. Try to find the next possible end of the action
            continue;
        }
        curr = curr.substring(right + 3).trim();
        right = -1;
    }
    return actions;
}
function getFullActionName(action) {
    return `${action.action.translatorName}.${action.action.actionName}`;
}
function parseExecutableActionsString(actions) {
    return actions[0] === "[" ? parseActions(actions) : [parseAction(actions)];
}
function executableActionToString(action) {
    return `${getFullActionName(action)}(${action.action.parameters ? JSON.stringify(action.action.parameters) : ""})`;
}
function executableActionsToString(actions) {
    return actions.length !== 1
        ? `[${actions.map(executableActionToString).join(",")}]`
        : executableActionToString(actions[0]);
}
function fromJsonAction(actionJSON) {
    const { translatorName, actionName } = parseFullActionNameParts(actionJSON.fullActionName);
    return createExecutableAction(translatorName, actionName, actionJSON.parameters, actionJSON.resultEntityId);
}
function fromJsonActions(actions) {
    return Array.isArray(actions)
        ? actions.map((a) => fromJsonAction(a))
        : [fromJsonAction(actions)];
}
function toJsonAction(action) {
    const result = { fullActionName: getFullActionName(action) };
    if (action.action.parameters) {
        result.parameters = action.action.parameters;
    }
    if (action.resultEntityId) {
        result.resultEntityId = action.resultEntityId;
    }
    return result;
}
function toJsonActions(actions) {
    return actions.length !== 1
        ? actions.map(toJsonAction)
        : toJsonAction(actions[0]);
}
function toExecutableActions(actions) {
    return actions.map((action) => ({ action }));
}
function toFullActions(actions) {
    return actions.map((a) => a.action);
}
function getTranslationNamesForActions(actions) {
    return Array.from(new Set(actions.map((a) => a.action.translatorName))).sort();
}
class RequestAction {
    constructor(request, actions, history) {
        this.request = request;
        this.actions = actions;
        this.history = history;
    }
    toString() {
        return `${this.request}${RequestAction.Separator}${executableActionsToString(this.actions)}`;
    }
    toPromptString() {
        return JSON.stringify({
            request: this.request,
            actions: this.actions,
        }, undefined, 2);
    }
    static fromString(input) {
        // Very simplistic parser for request/action.
        const trimmed = input.trim();
        const separator = trimmed.indexOf(RequestAction.Separator);
        if (separator === -1) {
            throw new Error(`'${RequestAction.Separator}' not found. Input must be in the form of ${format}`);
        }
        const request = trimmed.substring(0, separator).trim();
        const actions = trimmed
            .substring(separator + RequestAction.Separator.length)
            .trim();
        return new RequestAction(request, parseExecutableActionsString(actions));
    }
    static create(request, actions, history) {
        return new RequestAction(request, Array.isArray(actions) ? actions : [actions], history);
    }
}
RequestAction.Separator = " => ";
//# sourceMappingURL=requestAction.js.map

/***/ }),

/***/ "../cache/dist/indexBrowser.js":
/*!*************************************!*\
  !*** ../cache/dist/indexBrowser.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Construction: () => (/* reexport safe */ _constructions_constructions_js__WEBPACK_IMPORTED_MODULE_0__.Construction),
/* harmony export */   ConstructionCache: () => (/* reexport safe */ _constructions_constructionCache_js__WEBPACK_IMPORTED_MODULE_2__.ConstructionCache),
/* harmony export */   MatchSet: () => (/* reexport safe */ _constructions_matchPart_js__WEBPACK_IMPORTED_MODULE_1__.MatchSet),
/* harmony export */   isMatchPart: () => (/* reexport safe */ _constructions_matchPart_js__WEBPACK_IMPORTED_MODULE_1__.isMatchPart)
/* harmony export */ });
/* harmony import */ var _constructions_constructions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constructions/constructions.js */ "../cache/dist/constructions/constructions.js");
/* harmony import */ var _constructions_matchPart_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constructions/matchPart.js */ "../cache/dist/constructions/matchPart.js");
/* harmony import */ var _constructions_constructionCache_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constructions/constructionCache.js */ "../cache/dist/constructions/constructionCache.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Export for cache explorer for now



//# sourceMappingURL=indexBrowser.js.map

/***/ }),

/***/ "../cache/dist/utils/language.js":
/*!***************************************!*\
  !*** ../cache/dist/utils/language.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getLanguageTools: () => (/* binding */ getLanguageTools)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const subjectPronouns = [
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    // "you",  // doubled above
    "they",
    "you-all",
    "y'all",
    "thou",
    "ye",
    "youse",
];
const objectPronouns = [
    "me",
    "you",
    "him",
    "her",
    "it",
    "us",
    // "you",  // doubled above
    "them",
    "you-all",
    "y'all",
    "thee",
    "ye",
    "youse",
];
const possessivePronouns = [
    "mine",
    "yours",
    "his",
    "hers",
    "its",
    "ours",
    "yours",
    "theirs",
    "one's",
    "thine",
    "yeers",
    "y'all's",
    "each other's",
    "one another's",
];
const reflexivePronouns = [
    "myself",
    "yourself",
    "himself",
    "herself",
    "itself",
    "ourselves",
    "yourselves",
    "themselves",
    "oneself",
    "thyself",
    "whoself",
];
const demostrativePronouns = ["this", "that", "these", "those"];
const indefinitePronouns = [
    "all",
    "another",
    "any",
    "anybody",
    "anyone",
    "anything",
    "aught",
    "both",
    "certain",
    "each",
    "either",
    "enough",
    "everybody",
    "everyone",
    "everything",
    "few",
    "fewer",
    "fewest",
    "little",
    "many",
    "more",
    "most",
    "neither",
    "no one",
    "nobody",
    "none",
    "nothing",
    "one",
    "other",
    "others",
    "own",
    "plenty",
    "several",
    "same",
    "some",
    "somebody",
    "someone",
    "something",
    "somewhat",
    "such and such",
    "such",
    "suchlike",
];
const interrogativePronouns = [
    "what",
    "whate'er",
    "whatever",
    "whatsoever",
    "which",
    "whichever",
    "whichsoever",
    "who",
    "whoever",
    "whoso",
    "whosoever",
    "whom",
    "whomever",
    "whomsoever",
    "whose",
];
const relativePronuns = ["as", "that", ...interrogativePronouns];
const reciprocalPronouns = ["each other", "one another"];
const possessiveAdjectives = [
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "your",
    "their",
    "one's",
    "yeer",
    "y'all's",
    "each other's",
    "one another's",
];
const demostrativeAdverbs = ["here", "there"];
const conjunctions = [
    "according as",
    "and",
    "after",
    "albeit",
    "although",
    "as if",
    "as long as",
    "as though",
    "as",
    "because",
    "before",
    "both and",
    "but that",
    "but then again",
    "but then",
    "but",
    "considering",
    "cos",
    "directly",
    "either or",
    "ere",
    "except",
    "for",
    "forasmuchas",
    "how",
    "however",
    "if",
    "immediately",
    "in as far as",
    "inasmuch as",
    "insofar as",
    "insomuch that",
    "insomuchas",
    "lest",
    "like",
    "neither nor",
    "neither",
    "nor",
    "notwithstanding",
    "now that",
    "now",
    "once",
    "only",
    "or",
    "provided that",
    "provided",
    "providing that",
    "providing",
    "seeing as how",
    "seeing as",
    "seeing that",
    "seeing",
    "since",
    "so",
    "suppose",
    "supposing",
    "than",
    "that",
    "though",
    "till",
    "unless",
    "until",
    "when",
    "whenever",
    "where",
    "whereas",
    "whereat",
    "whereby",
    "wherever",
    "whereof",
    "wherein",
    "whereon",
    "wheresoever",
    "whereto",
    "whereupon",
    "whereunto",
    "whether",
    "while",
    "whilst",
    "why",
    "without",
    "yet",
];
const prepositions = [
    "aboard",
    "about",
    "above",
    "across",
    "after",
    "against",
    "along",
    "amid",
    "amidst",
    "among",
    "amongst",
    "around",
    "as",
    "at",
    "before",
    "behind",
    "below",
    "beneath",
    "beside",
    "besides",
    "between",
    "beyond",
    "but",
    "by",
    "circa",
    "concerning",
    "considering",
    "despite",
    "down",
    "during",
    "ere",
    "except",
    "following",
    "for",
    "from",
    "in",
    "inside",
    "into",
    "less",
    "like",
    "mid", // amid
    "midst",
    "minus",
    "near",
    "next",
    "nigh",
    "of",
    "off",
    "on",
    "onto",
    "opposite",
    "out",
    "outside",
    "over",
    "o'vr", // over
    "pace",
    "past",
    "per",
    "plus",
    "re",
    "regarding",
    "round",
    "sans",
    "save",
    "since",
    "than",
    "through",
    "throughout",
    "thru",
    "till",
    "to",
    "toward",
    "towards",
    "under",
    "underneath",
    "unlike",
    "until",
    "up",
    "upon",
    "versus",
    "via",
    "vice",
    "vs",
    "while",
    "with",
    "within",
    "without",
    "worth",
];
function combineSets(words) {
    const set = new Set(words.flat());
    return Array.from(set.values()).sort();
}
function exactMatch(words) {
    return new RegExp(`^(?:${combineSets(words).join("|")})$`, "i");
}
function suffixMatch(words, prefix) {
    return new RegExp(`\\b${prefix ? `${prefix}\\s` : ""}(?:${combineSets(words).join("|")})$`, "i");
}
function partOfMatch(words) {
    return new RegExp(`\\b(?:${combineSets(words).join("|")})\\b`, "i");
}
const referenceWords = exactMatch([
    objectPronouns,
    possessivePronouns,
    reflexivePronouns,
]);
const referenceOfSuffixes = suffixMatch([objectPronouns, possessivePronouns, reflexivePronouns], "of");
const referenceParts = partOfMatch([
    demostrativePronouns,
    indefinitePronouns,
    interrogativePronouns,
    relativePronuns,
    reciprocalPronouns,
    possessiveAdjectives,
]);
const referenceSuffixes = suffixMatch([demostrativeAdverbs]);
const closeClass = [
    subjectPronouns,
    objectPronouns,
    possessivePronouns,
    reflexivePronouns,
    demostrativePronouns,
    indefinitePronouns,
    interrogativePronouns,
    relativePronuns,
    reciprocalPronouns,
    possessiveAdjectives,
    demostrativeAdverbs,
    prepositions,
    conjunctions,
];
const partClosedClass = partOfMatch(closeClass);
const exactClosedClass = exactMatch(closeClass);
// REVIEW: Heuristics to allow time references from now.
const relativeToNow = /this (week|month|year|quarter|season|day|hour|minute|second|morning|afternoon)$/i;
const languageToolsEn = {
    possibleReferentialPhrase(phrase) {
        // TODO: initial implemention. Can be overbroad and incomplete.
        return ((referenceWords.test(phrase) ||
            referenceSuffixes.test(phrase) ||
            referenceOfSuffixes.test(phrase) ||
            referenceParts.test(phrase)) &&
            !relativeToNow.test(phrase));
    },
    hasClosedClass(phrase, exact = false) {
        return (exact ? exactClosedClass : partClosedClass).test(phrase);
    },
};
function getLanguageTools(language) {
    if (language !== "en") {
        return undefined;
    }
    return languageToolsEn;
}
//# sourceMappingURL=language.js.map

/***/ }),

/***/ "../cache/dist/utils/regexp.js":
/*!*************************************!*\
  !*** ../cache/dist/utils/regexp.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   escapeMatch: () => (/* binding */ escapeMatch),
/* harmony export */   isSpaceOrPunctuation: () => (/* binding */ isSpaceOrPunctuation),
/* harmony export */   isSpaceOrPunctuationRange: () => (/* binding */ isSpaceOrPunctuationRange),
/* harmony export */   isWordBoundary: () => (/* binding */ isWordBoundary),
/* harmony export */   spaceAndPunctuationRegexStr: () => (/* binding */ spaceAndPunctuationRegexStr),
/* harmony export */   wordBoundaryRegexStr: () => (/* binding */ wordBoundaryRegexStr)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// REVIEW: Use \p{P}?  Will need to turn on unicode flag.  Need to assess perf impact.
const punctuations = [",", ".", "?", "!"];
const spaceAndPunctuationRegexStr = `[${punctuations.join("")}\\s]`;
const wordBoundaryRegexStr = "(?:(?<!\\w)|(?!\\w))";
function escapeMatch(m) {
    // escape all regex special characters
    return m.replaceAll(/([()\][{*+.$^\\|?])/g, "\\$1");
}
const spaceAndPunctuationRegex = new RegExp(spaceAndPunctuationRegexStr, "y");
function isSpaceOrPunctuation(s, index) {
    spaceAndPunctuationRegex.lastIndex = index;
    return spaceAndPunctuationRegex.test(s);
}
function isSpaceOrPunctuationRange(s, start, end) {
    for (let i = start; i < end; i++) {
        if (!isSpaceOrPunctuation(s, i)) {
            return false;
        }
    }
    return true;
}
const wordBoundaryRegex = /\w\W|\W./iuy;
function isWordBoundary(s, index) {
    if (index === 0 || s.length == index) {
        return true;
    }
    wordBoundaryRegex.lastIndex = index - 1;
    return wordBoundaryRegex.test(s);
}
//# sourceMappingURL=regexp.js.map

/***/ }),

/***/ "../commonUtils/dist/indexBrowser.js":
/*!*******************************************!*\
  !*** ../commonUtils/dist/indexBrowser.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createLimiter: () => (/* reexport safe */ _limiter_js__WEBPACK_IMPORTED_MODULE_1__.createLimiter),
/* harmony export */   getObjectProperty: () => (/* reexport safe */ _objectProperty_js__WEBPACK_IMPORTED_MODULE_0__.getObjectProperty),
/* harmony export */   setObjectProperty: () => (/* reexport safe */ _objectProperty_js__WEBPACK_IMPORTED_MODULE_0__.setObjectProperty)
/* harmony export */ });
/* harmony import */ var _objectProperty_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectProperty.js */ "../commonUtils/dist/objectProperty.js");
/* harmony import */ var _limiter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./limiter.js */ "../commonUtils/dist/limiter.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.


//# sourceMappingURL=indexBrowser.js.map

/***/ }),

/***/ "../commonUtils/dist/limiter.js":
/*!**************************************!*\
  !*** ../commonUtils/dist/limiter.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createLimiter: () => (/* binding */ createLimiter)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function createLimiter(limit) {
    let current = 0;
    let resolve = undefined;
    let p = undefined;
    return async (callback) => {
        while (current >= limit) {
            if (p === undefined) {
                p = new Promise((res) => (resolve = res));
            }
            await p;
        }
        current++;
        try {
            return await callback();
        }
        finally {
            current--;
            if (resolve !== undefined) {
                resolve();
                resolve = undefined;
                p = undefined;
            }
        }
    };
}
//# sourceMappingURL=limiter.js.map

/***/ }),

/***/ "../commonUtils/dist/objectProperty.js":
/*!*********************************************!*\
  !*** ../commonUtils/dist/objectProperty.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getObjectProperty: () => (/* binding */ getObjectProperty),
/* harmony export */   setObjectProperty: () => (/* binding */ setObjectProperty)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function getObjectProperty(data, objectName, name) {
    if (name === "") {
        return data[objectName];
    }
    const properties = name.split(".");
    let lastName = objectName;
    let curr = data;
    for (const name of properties) {
        // Protect against prototype pollution
        if (name === "__proto__" ||
            name === "constructor" ||
            name === "prototype") {
            throw new Error(`Invalid property name: ${name}`);
        }
        const next = curr[lastName];
        if (next === undefined) {
            return undefined;
        }
        const maybeIndex = parseInt(name);
        if (maybeIndex.toString() === name) {
            // Array index
            if (!Array.isArray(next)) {
                return undefined;
            }
            lastName = maybeIndex;
        }
        else {
            if (typeof next !== "object") {
                return undefined;
            }
            lastName = name;
        }
        curr = next;
    }
    return curr[lastName];
}
function setObjectProperty(data, objectName, name, value, override = false) {
    const properties = name.split(".");
    let lastName = objectName;
    let curr = data;
    for (const name of properties) {
        // Protect against prototype pollution
        if (name === "__proto__" ||
            name === "constructor" ||
            name === "prototype") {
            throw new Error(`Invalid property name: ${name}`);
        }
        let next = curr[lastName];
        const maybeIndex = parseInt(name);
        if (maybeIndex.toString() === name) {
            // Array index
            if (next === undefined || (override && !Array.isArray(next))) {
                next = [];
                curr[lastName] = next;
            }
            curr = next;
            if (!Array.isArray(curr)) {
                throw new Error(`Internal error: ${lastName} is not an array`);
            }
            lastName = maybeIndex;
        }
        else {
            if (next === undefined || (override && typeof next !== "object")) {
                next = {};
                curr[lastName] = next;
            }
            curr = next;
            if (typeof curr !== "object") {
                throw new Error(`Internal error: ${lastName} is not an object`);
            }
            lastName = name;
        }
    }
    curr[lastName] = value;
}
//# sourceMappingURL=objectProperty.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***************************!*\
  !*** ./src/site/index.ts ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var agent_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! agent-cache */ "../cache/dist/indexBrowser.js");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

function createMatchSetListGroup(groupName, matchSetsDiv) {
    const groupDiv = document.createElement("div");
    // Plus Div
    const groupPlusDiv = document.createElement("button");
    groupPlusDiv.innerText = "+";
    groupPlusDiv.style.padding = "0px";
    groupPlusDiv.style.margin = "5px";
    groupPlusDiv.style.width = "15px";
    groupPlusDiv.style.height = "15px";
    groupPlusDiv.style.textAlign = "center";
    groupPlusDiv.style.border = "1px solid black";
    groupPlusDiv.addEventListener("click", () => {
        if (groupDiv.contains(groupElem)) {
            groupDiv.removeChild(groupElem);
            groupPlusDiv.innerText = "+";
        }
        else {
            groupDiv.appendChild(groupElem);
            groupPlusDiv.innerText = "-";
        }
    });
    // Name Div
    const groupNameDiv = document.createElement("div");
    groupNameDiv.innerText = groupName;
    groupNameDiv.style.display = "inline-block";
    groupDiv.appendChild(groupPlusDiv);
    groupDiv.appendChild(groupNameDiv);
    matchSetsDiv.appendChild(groupDiv);
    // Group Div
    const groupElem = document.createElement("div");
    groupElem.style.position = "relative";
    groupElem.style.left = "30px";
    return groupElem;
}
let constructionViews = [];
let selectedMatchSets = [];
const matchSetElemMap = new Map();
function toMatchSetElem(matchSets) {
    return matchSets.map((m) => matchSetElemMap.get(m));
}
function selectMatchSets(newSelectedMatchSets) {
    toMatchSetElem(selectedMatchSets).forEach((s) => s.classList.remove("selected"));
    toMatchSetElem(newSelectedMatchSets).forEach((s) => s.classList.add("selected"));
    selectedMatchSets = newSelectedMatchSets;
    constructionViews.forEach((constructionView) => {
        const show = selectedMatchSets.length === 0 ||
            selectedMatchSets.every((m) => constructionView.partViews.some((partView) => (0,agent_cache__WEBPACK_IMPORTED_MODULE_0__.isMatchPart)(partView.part) &&
                partView.part.matchSet === m));
        if (show) {
            constructionView.elem.classList.remove("hidden");
            constructionView.partViews.forEach((partView) => {
                if ((0,agent_cache__WEBPACK_IMPORTED_MODULE_0__.isMatchPart)(partView.part)) {
                    if (selectedMatchSets.includes(partView.part.matchSet)) {
                        partView.elem.classList.add("selected");
                    }
                    else {
                        partView.elem.classList.remove("selected");
                    }
                }
            });
        }
        else {
            constructionView.elem.classList.add("hidden");
        }
    });
    const selectedMatchSetDetail = document.getElementById("selectedMatchSetDetail");
    selectedMatchSetDetail.innerHTML = "";
    selectedMatchSets.forEach((m) => {
        const matchSetDiv = document.createElement("div");
        matchSetDiv.classList.add("matchsetdetails");
        const header = document.createElement("h3");
        header.innerText = m.fullName;
        matchSetDiv.appendChild(header);
        m.matches.forEach((match) => {
            const matchDiv = document.createElement("div");
            matchDiv.innerText = match;
            matchSetDiv.appendChild(matchDiv);
        });
        selectedMatchSetDetail.appendChild(matchSetDiv);
    });
}
function createMatchSetListView(cache) {
    const matchSetsDiv = document.getElementById("matchsets");
    const matchSetGroups = new Map();
    for (const matchSet of cache.matchSets) {
        const group = matchSetGroups.get(matchSet.name);
        if (group === undefined) {
            matchSetGroups.set(matchSet.name, [matchSet]);
        }
        else {
            group.push(matchSet);
        }
    }
    // List the action and then parameter parts first.
    const sortedMatchSetGroups = Array.from(matchSetGroups.entries()).sort((a, b) => {
        const aname = a[0].split(":");
        const bname = b[0].split(":");
        if (aname.length !== bname.length) {
            return bname.length - aname.length;
        }
        else {
            const c = aname[0].localeCompare(bname[0]);
            return c !== 0
                ? c
                : aname.length === 1
                    ? 0
                    : aname[1].localeCompare(bname[1]);
        }
    });
    sortedMatchSetGroups.forEach(([name, matchSets]) => {
        const matchSetListGroup = matchSets.length === 1
            ? matchSetsDiv
            : createMatchSetListGroup(name, matchSetsDiv);
        matchSets.map((m) => {
            const matchSetDiv = document.createElement("div");
            matchSetDiv.classList.add("matchset");
            matchSetDiv.innerText = m.fullName;
            matchSetDiv.addEventListener("click", (e) => {
                if (e.ctrlKey) {
                    if (selectedMatchSets.includes(m)) {
                        selectMatchSets(selectedMatchSets.filter((s) => s !== m));
                    }
                    else {
                        selectMatchSets([...selectedMatchSets, m]);
                    }
                }
                else {
                    selectMatchSets([m]);
                }
            });
            matchSetListGroup.appendChild(matchSetDiv);
            matchSetElemMap.set(m, matchSetDiv);
        });
    });
}
function createConstructionView(cache, namespace) {
    const constructionsDiv = document.getElementById("constructions");
    const constructionTable = document.createElement("table");
    constructionsDiv.replaceChildren(constructionTable);
    const constructionNamespace = cache.getConstructionNamespace(namespace);
    constructionViews = constructionNamespace
        ? constructionNamespace.constructions.map((construction, index) => {
            const constructionElem = document.createElement("tr");
            const constructionIndexElem = document.createElement("td");
            constructionIndexElem.innerText = index.toString();
            constructionElem.appendChild(constructionIndexElem);
            const partViews = construction.parts.map((p) => {
                const partElem = document.createElement("td");
                constructionElem.appendChild(partElem);
                partElem.innerText = `${p.toString()}${p.wildcardMode ? "(w)" : ""}`;
                return { part: p, elem: partElem };
            });
            constructionElem.addEventListener("click", () => {
                selectMatchSets(construction.parts
                    .filter(agent_cache__WEBPACK_IMPORTED_MODULE_0__.isMatchPart)
                    .map((p) => p.matchSet));
            });
            constructionTable.appendChild(constructionElem);
            return { construction, elem: constructionElem, partViews };
        })
        : [];
}
function clearCacheView(loading) {
    const constructionsDiv = document.getElementById("constructions");
    constructionsDiv.replaceChildren();
    const matchSetsDiv = document.getElementById("matchsets");
    matchSetsDiv.replaceChildren();
    if (loading) {
        constructionsDiv.appendChild(document.createTextNode("Loading cache..."));
    }
}
function createCacheView(cache, namespace) {
    createConstructionView(cache, namespace);
    createMatchSetListView(cache);
}
async function loadConstructionCache(session, cacheName) {
    const content = await fetch(`/session/${session}/cache/${cacheName}`);
    if (content.status !== 200) {
        throw new Error(`Failed to load construction cache: ${content.statusText}`);
    }
    const cacheData = await content.json();
    return agent_cache__WEBPACK_IMPORTED_MODULE_0__.ConstructionCache.fromJSON(cacheData);
}
function updateCacheView(ui) {
    clearCacheView(true);
    if (currentCache) {
        const namespace = ui.namespace.value;
        createCacheView(currentCache, namespace);
    }
}
let currentSession;
let currentCacheName;
let currentCache;
function updateCacheSelection(ui, entries) {
    const filtered = entries.filter((e) => e.explainer === ui.explainer.value);
    let currentIndex = 0;
    ui.name.replaceChildren(...filtered.map((e, index) => {
        const option = document.createElement("option");
        option.text = `${e.name} ${e.current ? " (current)" : ""}`;
        option.value = e.name;
        if (e.current) {
            currentIndex = index;
        }
        return option;
    }));
    ui.name.selectedIndex = currentIndex;
    updateTranslatorSelection(ui);
}
async function updateTranslatorSelection(ui) {
    clearCacheView(true);
    const sessionSelect = document.getElementById("sessions");
    const session = sessionSelect.value;
    const cacheName = ui.name.value;
    const cache = await loadConstructionCache(session, cacheName);
    if (session === sessionSelect.value &&
        cacheName === ui.name.value &&
        currentSession === session &&
        cacheName !== currentCacheName) {
        currentCacheName = cacheName;
        currentCache = cache;
        const namespaces = cache.getConstructionNamespaces();
        ui.namespace.replaceChildren(...namespaces.map((e) => {
            const option = document.createElement("option");
            option.text = e;
            return option;
        }));
        updateCacheView(ui);
    }
}
function createCacheSelection(entries) {
    if (entries.length === 0) {
        clearCacheSelection(false);
        return;
    }
    const explainer = document.createElement("select");
    const name = document.createElement("select");
    const namespace = document.createElement("select");
    explainer.addEventListener("change", () => {
        updateCacheSelection(ui, entries);
    });
    name.addEventListener("change", () => {
        updateTranslatorSelection(ui);
    });
    namespace.addEventListener("change", () => {
        updateCacheView(ui);
    });
    const cachesDiv = document.getElementById("cacheSelection");
    cachesDiv.replaceChildren(document.createTextNode(" Explainer: "), explainer, document.createTextNode(" Cache: "), name, document.createTextNode(" Translator: "), namespace);
    const ui = { explainer, name, namespace };
    explainer.replaceChildren(...Array.from(new Set(entries.map((e) => e.explainer)).values()).map((t) => {
        const option = document.createElement("option");
        option.text = t;
        option.value = t;
        return option;
    }));
    updateCacheSelection(ui, entries);
}
async function getSessionCacheInfo(session) {
    try {
        const cachesResponse = await fetch(`/session/${session}/caches`);
        return cachesResponse.json();
    }
    catch {
        return [];
    }
}
function clearCacheSelection(loading) {
    const cachesDiv = document.getElementById("cacheSelection");
    cachesDiv.replaceChildren();
    cachesDiv.appendChild(document.createTextNode(loading ? "Loading cache from session..." : "No cache available"));
}
async function initializeUI() {
    const sessionSelection = document.getElementById("sessions");
    const sessionsResponse = await fetch("/sessions");
    const sessions = await sessionsResponse.json();
    sessions.forEach((session) => {
        const option = document.createElement("option");
        option.text = session;
        sessionSelection.add(option);
    });
    sessionSelection.selectedIndex = sessionSelection.options.length - 1;
    const updateCacheSelection = async () => {
        clearCacheSelection(true);
        clearCacheView(false);
        const session = sessionSelection.value;
        const data = await getSessionCacheInfo(session);
        if (session === sessionSelection.value && currentSession !== session) {
            currentSession = session;
            createCacheSelection(data);
        }
    };
    sessionSelection.addEventListener("change", updateCacheSelection);
    await updateCacheSelection();
}
initializeUI().catch((e) => {
    const cacheExplorer = document.getElementById("content");
    cacheExplorer.innerHTML = `Error rendering construction cache: ${e}`;
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksMkVBQXlCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsc0VBQW9CO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxnRUFBYztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLDZCQUE2QjtBQUMxRDtBQUNBO0FBQ0EsNEJBQTRCLFlBQVksT0FBTyxVQUFVLEtBQUssNkJBQTZCO0FBQzNGO0FBQ0E7QUFDQSwrQkFBK0IsNkJBQTZCO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7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QkFBZ0IsQ0FBQyxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFckUsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLElBQUksRUFBRTtRQUNwQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsSUFBSSxPQUFPLEtBQUssZ0JBQWdCLENBQUMsS0FBSyxJQUFJLGNBQWMsS0FBSyxPQUFPLEVBQUUsQ0FBQztZQUNuRSxjQUFjLEdBQUcsT0FBTyxDQUFDO1lBQ3pCLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDLENBQUM7SUFDRixnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUNsRSxNQUFNLG9CQUFvQixFQUFFLENBQUM7QUFDakMsQ0FBQztBQUVELFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0lBQ3ZCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFFLENBQUM7SUFDMUQsYUFBYSxDQUFDLFNBQVMsR0FBRyx1Q0FBdUMsQ0FBQyxFQUFFLENBQUM7QUFDekUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hZ2VudC1jYWNoZS1leHBsb3Jlci8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZGVidWdANC40LjBfc3VwcG9ydHMtY29sb3JAOC4xLjEvbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9kZWJ1Z0A0LjQuMF9zdXBwb3J0cy1jb2xvckA4LjEuMS9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2NvbW1vbi5qcyIsIndlYnBhY2s6Ly9hZ2VudC1jYWNoZS1leHBsb3Jlci8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vbXNAMi4xLjMvbm9kZV9tb2R1bGVzL21zL2luZGV4LmpzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyLy4uL2NhY2hlL2Rpc3QvY29uc3RydWN0aW9ucy9jb25zdHJ1Y3Rpb25DYWNoZS5qcyIsIndlYnBhY2s6Ly9hZ2VudC1jYWNoZS1leHBsb3Jlci8uLi9jYWNoZS9kaXN0L2NvbnN0cnVjdGlvbnMvY29uc3RydWN0aW9uTWF0Y2guanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvLi4vY2FjaGUvZGlzdC9jb25zdHJ1Y3Rpb25zL2NvbnN0cnVjdGlvblZhbHVlLmpzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyLy4uL2NhY2hlL2Rpc3QvY29uc3RydWN0aW9ucy9jb25zdHJ1Y3Rpb25zLmpzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyLy4uL2NhY2hlL2Rpc3QvY29uc3RydWN0aW9ucy9tYXRjaFBhcnQuanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvLi4vY2FjaGUvZGlzdC9jb25zdHJ1Y3Rpb25zL3BhcnNlUGFydC5qcyIsIndlYnBhY2s6Ly9hZ2VudC1jYWNoZS1leHBsb3Jlci8uLi9jYWNoZS9kaXN0L2NvbnN0cnVjdGlvbnMvcHJvcGVydHlQYXJzZXIuanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvLi4vY2FjaGUvZGlzdC9jb25zdHJ1Y3Rpb25zL3RyYW5zZm9ybXMuanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvLi4vY2FjaGUvZGlzdC9leHBsYW5hdGlvbi9yZXF1ZXN0QWN0aW9uLmpzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyLy4uL2NhY2hlL2Rpc3QvaW5kZXhCcm93c2VyLmpzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyLy4uL2NhY2hlL2Rpc3QvdXRpbHMvbGFuZ3VhZ2UuanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvLi4vY2FjaGUvZGlzdC91dGlscy9yZWdleHAuanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvLi4vY29tbW9uVXRpbHMvZGlzdC9pbmRleEJyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvLi4vY29tbW9uVXRpbHMvZGlzdC9saW1pdGVyLmpzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyLy4uL2NvbW1vblV0aWxzL2Rpc3Qvb2JqZWN0UHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2FnZW50LWNhY2hlLWV4cGxvcmVyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYWdlbnQtY2FjaGUtZXhwbG9yZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9hZ2VudC1jYWNoZS1leHBsb3Jlci8uL3NyYy9zaXRlL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcbmV4cG9ydHMuc3RvcmFnZSA9IGxvY2Fsc3RvcmFnZSgpO1xuZXhwb3J0cy5kZXN0cm95ID0gKCgpID0+IHtcblx0bGV0IHdhcm5lZCA9IGZhbHNlO1xuXG5cdHJldHVybiAoKSA9PiB7XG5cdFx0aWYgKCF3YXJuZWQpIHtcblx0XHRcdHdhcm5lZCA9IHRydWU7XG5cdFx0XHRjb25zb2xlLndhcm4oJ0luc3RhbmNlIG1ldGhvZCBgZGVidWcuZGVzdHJveSgpYCBpcyBkZXByZWNhdGVkIGFuZCBubyBsb25nZXIgZG9lcyBhbnl0aGluZy4gSXQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IG1ham9yIHZlcnNpb24gb2YgYGRlYnVnYC4nKTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcblx0JyMwMDAwQ0MnLFxuXHQnIzAwMDBGRicsXG5cdCcjMDAzM0NDJyxcblx0JyMwMDMzRkYnLFxuXHQnIzAwNjZDQycsXG5cdCcjMDA2NkZGJyxcblx0JyMwMDk5Q0MnLFxuXHQnIzAwOTlGRicsXG5cdCcjMDBDQzAwJyxcblx0JyMwMENDMzMnLFxuXHQnIzAwQ0M2NicsXG5cdCcjMDBDQzk5Jyxcblx0JyMwMENDQ0MnLFxuXHQnIzAwQ0NGRicsXG5cdCcjMzMwMENDJyxcblx0JyMzMzAwRkYnLFxuXHQnIzMzMzNDQycsXG5cdCcjMzMzM0ZGJyxcblx0JyMzMzY2Q0MnLFxuXHQnIzMzNjZGRicsXG5cdCcjMzM5OUNDJyxcblx0JyMzMzk5RkYnLFxuXHQnIzMzQ0MwMCcsXG5cdCcjMzNDQzMzJyxcblx0JyMzM0NDNjYnLFxuXHQnIzMzQ0M5OScsXG5cdCcjMzNDQ0NDJyxcblx0JyMzM0NDRkYnLFxuXHQnIzY2MDBDQycsXG5cdCcjNjYwMEZGJyxcblx0JyM2NjMzQ0MnLFxuXHQnIzY2MzNGRicsXG5cdCcjNjZDQzAwJyxcblx0JyM2NkNDMzMnLFxuXHQnIzk5MDBDQycsXG5cdCcjOTkwMEZGJyxcblx0JyM5OTMzQ0MnLFxuXHQnIzk5MzNGRicsXG5cdCcjOTlDQzAwJyxcblx0JyM5OUNDMzMnLFxuXHQnI0NDMDAwMCcsXG5cdCcjQ0MwMDMzJyxcblx0JyNDQzAwNjYnLFxuXHQnI0NDMDA5OScsXG5cdCcjQ0MwMENDJyxcblx0JyNDQzAwRkYnLFxuXHQnI0NDMzMwMCcsXG5cdCcjQ0MzMzMzJyxcblx0JyNDQzMzNjYnLFxuXHQnI0NDMzM5OScsXG5cdCcjQ0MzM0NDJyxcblx0JyNDQzMzRkYnLFxuXHQnI0NDNjYwMCcsXG5cdCcjQ0M2NjMzJyxcblx0JyNDQzk5MDAnLFxuXHQnI0NDOTkzMycsXG5cdCcjQ0NDQzAwJyxcblx0JyNDQ0NDMzMnLFxuXHQnI0ZGMDAwMCcsXG5cdCcjRkYwMDMzJyxcblx0JyNGRjAwNjYnLFxuXHQnI0ZGMDA5OScsXG5cdCcjRkYwMENDJyxcblx0JyNGRjAwRkYnLFxuXHQnI0ZGMzMwMCcsXG5cdCcjRkYzMzMzJyxcblx0JyNGRjMzNjYnLFxuXHQnI0ZGMzM5OScsXG5cdCcjRkYzM0NDJyxcblx0JyNGRjMzRkYnLFxuXHQnI0ZGNjYwMCcsXG5cdCcjRkY2NjMzJyxcblx0JyNGRjk5MDAnLFxuXHQnI0ZGOTkzMycsXG5cdCcjRkZDQzAwJyxcblx0JyNGRkNDMzMnXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG5cdC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcblx0Ly8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2Vcblx0Ly8gZXhwbGljaXRseVxuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MgJiYgKHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicgfHwgd2luZG93LnByb2Nlc3MuX19ud2pzKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gSW50ZXJuZXQgRXhwbG9yZXIgYW5kIEVkZ2UgZG8gbm90IHN1cHBvcnQgY29sb3JzLlxuXHRpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goLyhlZGdlfHRyaWRlbnQpXFwvKFxcZCspLykpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRsZXQgbTtcblxuXHQvLyBJcyB3ZWJraXQ/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE2NDU5NjA2LzM3Njc3M1xuXHQvLyBkb2N1bWVudCBpcyB1bmRlZmluZWQgaW4gcmVhY3QtbmF0aXZlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QtbmF0aXZlL3B1bGwvMTYzMlxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmV0dXJuLWFzc2lnblxuXHRyZXR1cm4gKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuV2Via2l0QXBwZWFyYW5jZSkgfHxcblx0XHQvLyBJcyBmaXJlYnVnPyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zOTgxMjAvMzc2NzczXG5cdFx0KHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jb25zb2xlICYmICh3aW5kb3cuY29uc29sZS5maXJlYnVnIHx8ICh3aW5kb3cuY29uc29sZS5leGNlcHRpb24gJiYgd2luZG93LmNvbnNvbGUudGFibGUpKSkgfHxcblx0XHQvLyBJcyBmaXJlZm94ID49IHYzMT9cblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1Rvb2xzL1dlYl9Db25zb2xlI1N0eWxpbmdfbWVzc2FnZXNcblx0XHQodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiAobSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pKSAmJiBwYXJzZUludChtWzFdLCAxMCkgPj0gMzEpIHx8XG5cdFx0Ly8gRG91YmxlIGNoZWNrIHdlYmtpdCBpbiB1c2VyQWdlbnQganVzdCBpbiBjYXNlIHdlIGFyZSBpbiBhIHdvcmtlclxuXHRcdCh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvYXBwbGV3ZWJraXRcXC8oXFxkKykvKSk7XG59XG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG5cdGFyZ3NbMF0gPSAodGhpcy51c2VDb2xvcnMgPyAnJWMnIDogJycpICtcblx0XHR0aGlzLm5hbWVzcGFjZSArXG5cdFx0KHRoaXMudXNlQ29sb3JzID8gJyAlYycgOiAnICcpICtcblx0XHRhcmdzWzBdICtcblx0XHQodGhpcy51c2VDb2xvcnMgPyAnJWMgJyA6ICcgJykgK1xuXHRcdCcrJyArIG1vZHVsZS5leHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cblx0aWYgKCF0aGlzLnVzZUNvbG9ycykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuXHRhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKTtcblxuXHQvLyBUaGUgZmluYWwgXCIlY1wiIGlzIHNvbWV3aGF0IHRyaWNreSwgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvdGhlclxuXHQvLyBhcmd1bWVudHMgcGFzc2VkIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlICVjLCBzbyB3ZSBuZWVkIHRvXG5cdC8vIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgaW5kZXggdG8gaW5zZXJ0IHRoZSBDU1MgaW50b1xuXHRsZXQgaW5kZXggPSAwO1xuXHRsZXQgbGFzdEMgPSAwO1xuXHRhcmdzWzBdLnJlcGxhY2UoLyVbYS16QS1aJV0vZywgbWF0Y2ggPT4ge1xuXHRcdGlmIChtYXRjaCA9PT0gJyUlJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpbmRleCsrO1xuXHRcdGlmIChtYXRjaCA9PT0gJyVjJykge1xuXHRcdFx0Ly8gV2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG5cdFx0XHQvLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxuXHRcdFx0bGFzdEMgPSBpbmRleDtcblx0XHR9XG5cdH0pO1xuXG5cdGFyZ3Muc3BsaWNlKGxhc3RDLCAwLCBjKTtcbn1cblxuLyoqXG4gKiBJbnZva2VzIGBjb25zb2xlLmRlYnVnKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5kZWJ1Z2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICogSWYgYGNvbnNvbGUuZGVidWdgIGlzIG5vdCBhdmFpbGFibGUsIGZhbGxzIGJhY2tcbiAqIHRvIGBjb25zb2xlLmxvZ2AuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0cy5sb2cgPSBjb25zb2xlLmRlYnVnIHx8IGNvbnNvbGUubG9nIHx8ICgoKSA9PiB7fSk7XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBzYXZlKG5hbWVzcGFjZXMpIHtcblx0dHJ5IHtcblx0XHRpZiAobmFtZXNwYWNlcykge1xuXHRcdFx0ZXhwb3J0cy5zdG9yYWdlLnNldEl0ZW0oJ2RlYnVnJywgbmFtZXNwYWNlcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyBTd2FsbG93XG5cdFx0Ly8gWFhYIChAUWl4LSkgc2hvdWxkIHdlIGJlIGxvZ2dpbmcgdGhlc2U/XG5cdH1cbn1cblxuLyoqXG4gKiBMb2FkIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybnMgdGhlIHByZXZpb3VzbHkgcGVyc2lzdGVkIGRlYnVnIG1vZGVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gbG9hZCgpIHtcblx0bGV0IHI7XG5cdHRyeSB7XG5cdFx0ciA9IGV4cG9ydHMuc3RvcmFnZS5nZXRJdGVtKCdkZWJ1ZycpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdC8vIFN3YWxsb3dcblx0XHQvLyBYWFggKEBRaXgtKSBzaG91bGQgd2UgYmUgbG9nZ2luZyB0aGVzZT9cblx0fVxuXG5cdC8vIElmIGRlYnVnIGlzbid0IHNldCBpbiBMUywgYW5kIHdlJ3JlIGluIEVsZWN0cm9uLCB0cnkgdG8gbG9hZCAkREVCVUdcblx0aWYgKCFyICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAnZW52JyBpbiBwcm9jZXNzKSB7XG5cdFx0ciA9IHByb2Nlc3MuZW52LkRFQlVHO1xuXHR9XG5cblx0cmV0dXJuIHI7XG59XG5cbi8qKlxuICogTG9jYWxzdG9yYWdlIGF0dGVtcHRzIHRvIHJldHVybiB0aGUgbG9jYWxzdG9yYWdlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2FmYXJpIHRocm93c1xuICogd2hlbiBhIHVzZXIgZGlzYWJsZXMgY29va2llcy9sb2NhbHN0b3JhZ2VcbiAqIGFuZCB5b3UgYXR0ZW1wdCB0byBhY2Nlc3MgaXQuXG4gKlxuICogQHJldHVybiB7TG9jYWxTdG9yYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9jYWxzdG9yYWdlKCkge1xuXHR0cnkge1xuXHRcdC8vIFRWTUxLaXQgKEFwcGxlIFRWIEpTIFJ1bnRpbWUpIGRvZXMgbm90IGhhdmUgYSB3aW5kb3cgb2JqZWN0LCBqdXN0IGxvY2FsU3RvcmFnZSBpbiB0aGUgZ2xvYmFsIGNvbnRleHRcblx0XHQvLyBUaGUgQnJvd3NlciBhbHNvIGhhcyBsb2NhbFN0b3JhZ2UgaW4gdGhlIGdsb2JhbCBjb250ZXh0LlxuXHRcdHJldHVybiBsb2NhbFN0b3JhZ2U7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gU3dhbGxvd1xuXHRcdC8vIFhYWCAoQFFpeC0pIHNob3VsZCB3ZSBiZSBsb2dnaW5nIHRoZXNlP1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9jb21tb24nKShleHBvcnRzKTtcblxuY29uc3Qge2Zvcm1hdHRlcnN9ID0gbW9kdWxlLmV4cG9ydHM7XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uICh2KSB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnJvci5tZXNzYWdlO1xuXHR9XG59O1xuIiwiXG4vKipcbiAqIFRoaXMgaXMgdGhlIGNvbW1vbiBsb2dpYyBmb3IgYm90aCB0aGUgTm9kZS5qcyBhbmQgd2ViIGJyb3dzZXJcbiAqIGltcGxlbWVudGF0aW9ucyBvZiBgZGVidWcoKWAuXG4gKi9cblxuZnVuY3Rpb24gc2V0dXAoZW52KSB7XG5cdGNyZWF0ZURlYnVnLmRlYnVnID0gY3JlYXRlRGVidWc7XG5cdGNyZWF0ZURlYnVnLmRlZmF1bHQgPSBjcmVhdGVEZWJ1Zztcblx0Y3JlYXRlRGVidWcuY29lcmNlID0gY29lcmNlO1xuXHRjcmVhdGVEZWJ1Zy5kaXNhYmxlID0gZGlzYWJsZTtcblx0Y3JlYXRlRGVidWcuZW5hYmxlID0gZW5hYmxlO1xuXHRjcmVhdGVEZWJ1Zy5lbmFibGVkID0gZW5hYmxlZDtcblx0Y3JlYXRlRGVidWcuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuXHRjcmVhdGVEZWJ1Zy5kZXN0cm95ID0gZGVzdHJveTtcblxuXHRPYmplY3Qua2V5cyhlbnYpLmZvckVhY2goa2V5ID0+IHtcblx0XHRjcmVhdGVEZWJ1Z1trZXldID0gZW52W2tleV07XG5cdH0pO1xuXG5cdC8qKlxuXHQqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuXHQqL1xuXG5cdGNyZWF0ZURlYnVnLm5hbWVzID0gW107XG5cdGNyZWF0ZURlYnVnLnNraXBzID0gW107XG5cblx0LyoqXG5cdCogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuXHQqXG5cdCogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXIgb3IgdXBwZXItY2FzZSBsZXR0ZXIsIGkuZS4gXCJuXCIgYW5kIFwiTlwiLlxuXHQqL1xuXHRjcmVhdGVEZWJ1Zy5mb3JtYXR0ZXJzID0ge307XG5cblx0LyoqXG5cdCogU2VsZWN0cyBhIGNvbG9yIGZvciBhIGRlYnVnIG5hbWVzcGFjZVxuXHQqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgVGhlIG5hbWVzcGFjZSBzdHJpbmcgZm9yIHRoZSBkZWJ1ZyBpbnN0YW5jZSB0byBiZSBjb2xvcmVkXG5cdCogQHJldHVybiB7TnVtYmVyfFN0cmluZ30gQW4gQU5TSSBjb2xvciBjb2RlIGZvciB0aGUgZ2l2ZW4gbmFtZXNwYWNlXG5cdCogQGFwaSBwcml2YXRlXG5cdCovXG5cdGZ1bmN0aW9uIHNlbGVjdENvbG9yKG5hbWVzcGFjZSkge1xuXHRcdGxldCBoYXNoID0gMDtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXNwYWNlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBuYW1lc3BhY2UuY2hhckNvZGVBdChpKTtcblx0XHRcdGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNyZWF0ZURlYnVnLmNvbG9yc1tNYXRoLmFicyhoYXNoKSAlIGNyZWF0ZURlYnVnLmNvbG9ycy5sZW5ndGhdO1xuXHR9XG5cdGNyZWF0ZURlYnVnLnNlbGVjdENvbG9yID0gc2VsZWN0Q29sb3I7XG5cblx0LyoqXG5cdCogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG5cdCpcblx0KiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG5cdCogQHJldHVybiB7RnVuY3Rpb259XG5cdCogQGFwaSBwdWJsaWNcblx0Ki9cblx0ZnVuY3Rpb24gY3JlYXRlRGVidWcobmFtZXNwYWNlKSB7XG5cdFx0bGV0IHByZXZUaW1lO1xuXHRcdGxldCBlbmFibGVPdmVycmlkZSA9IG51bGw7XG5cdFx0bGV0IG5hbWVzcGFjZXNDYWNoZTtcblx0XHRsZXQgZW5hYmxlZENhY2hlO1xuXG5cdFx0ZnVuY3Rpb24gZGVidWcoLi4uYXJncykge1xuXHRcdFx0Ly8gRGlzYWJsZWQ/XG5cdFx0XHRpZiAoIWRlYnVnLmVuYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBzZWxmID0gZGVidWc7XG5cblx0XHRcdC8vIFNldCBgZGlmZmAgdGltZXN0YW1wXG5cdFx0XHRjb25zdCBjdXJyID0gTnVtYmVyKG5ldyBEYXRlKCkpO1xuXHRcdFx0Y29uc3QgbXMgPSBjdXJyIC0gKHByZXZUaW1lIHx8IGN1cnIpO1xuXHRcdFx0c2VsZi5kaWZmID0gbXM7XG5cdFx0XHRzZWxmLnByZXYgPSBwcmV2VGltZTtcblx0XHRcdHNlbGYuY3VyciA9IGN1cnI7XG5cdFx0XHRwcmV2VGltZSA9IGN1cnI7XG5cblx0XHRcdGFyZ3NbMF0gPSBjcmVhdGVEZWJ1Zy5jb2VyY2UoYXJnc1swXSk7XG5cblx0XHRcdGlmICh0eXBlb2YgYXJnc1swXSAhPT0gJ3N0cmluZycpIHtcblx0XHRcdFx0Ly8gQW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cblx0XHRcdFx0YXJncy51bnNoaWZ0KCclTycpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuXHRcdFx0bGV0IGluZGV4ID0gMDtcblx0XHRcdGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EtekEtWiVdKS9nLCAobWF0Y2gsIGZvcm1hdCkgPT4ge1xuXHRcdFx0XHQvLyBJZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG5cdFx0XHRcdGlmIChtYXRjaCA9PT0gJyUlJykge1xuXHRcdFx0XHRcdHJldHVybiAnJSc7XG5cdFx0XHRcdH1cblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdFx0Y29uc3QgZm9ybWF0dGVyID0gY3JlYXRlRGVidWcuZm9ybWF0dGVyc1tmb3JtYXRdO1xuXHRcdFx0XHRpZiAodHlwZW9mIGZvcm1hdHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGNvbnN0IHZhbCA9IGFyZ3NbaW5kZXhdO1xuXHRcdFx0XHRcdG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuXHRcdFx0XHRcdC8vIE5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcblx0XHRcdFx0XHRhcmdzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHRcdFx0aW5kZXgtLTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbWF0Y2g7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gQXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcblx0XHRcdGNyZWF0ZURlYnVnLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuXHRcdFx0Y29uc3QgbG9nRm4gPSBzZWxmLmxvZyB8fCBjcmVhdGVEZWJ1Zy5sb2c7XG5cdFx0XHRsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcblx0XHR9XG5cblx0XHRkZWJ1Zy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG5cdFx0ZGVidWcudXNlQ29sb3JzID0gY3JlYXRlRGVidWcudXNlQ29sb3JzKCk7XG5cdFx0ZGVidWcuY29sb3IgPSBjcmVhdGVEZWJ1Zy5zZWxlY3RDb2xvcihuYW1lc3BhY2UpO1xuXHRcdGRlYnVnLmV4dGVuZCA9IGV4dGVuZDtcblx0XHRkZWJ1Zy5kZXN0cm95ID0gY3JlYXRlRGVidWcuZGVzdHJveTsgLy8gWFhYIFRlbXBvcmFyeS4gV2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IG1ham9yIHJlbGVhc2UuXG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVidWcsICdlbmFibGVkJywge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG5cdFx0XHRnZXQ6ICgpID0+IHtcblx0XHRcdFx0aWYgKGVuYWJsZU92ZXJyaWRlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVuYWJsZU92ZXJyaWRlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChuYW1lc3BhY2VzQ2FjaGUgIT09IGNyZWF0ZURlYnVnLm5hbWVzcGFjZXMpIHtcblx0XHRcdFx0XHRuYW1lc3BhY2VzQ2FjaGUgPSBjcmVhdGVEZWJ1Zy5uYW1lc3BhY2VzO1xuXHRcdFx0XHRcdGVuYWJsZWRDYWNoZSA9IGNyZWF0ZURlYnVnLmVuYWJsZWQobmFtZXNwYWNlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBlbmFibGVkQ2FjaGU7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiB2ID0+IHtcblx0XHRcdFx0ZW5hYmxlT3ZlcnJpZGUgPSB2O1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gRW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcblx0XHRpZiAodHlwZW9mIGNyZWF0ZURlYnVnLmluaXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNyZWF0ZURlYnVnLmluaXQoZGVidWcpO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWJ1Zztcblx0fVxuXG5cdGZ1bmN0aW9uIGV4dGVuZChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdGNvbnN0IG5ld0RlYnVnID0gY3JlYXRlRGVidWcodGhpcy5uYW1lc3BhY2UgKyAodHlwZW9mIGRlbGltaXRlciA9PT0gJ3VuZGVmaW5lZCcgPyAnOicgOiBkZWxpbWl0ZXIpICsgbmFtZXNwYWNlKTtcblx0XHRuZXdEZWJ1Zy5sb2cgPSB0aGlzLmxvZztcblx0XHRyZXR1cm4gbmV3RGVidWc7XG5cdH1cblxuXHQvKipcblx0KiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lc3BhY2VzLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG5cdCogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cblx0KlxuXHQqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG5cdCogQGFwaSBwdWJsaWNcblx0Ki9cblx0ZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcblx0XHRjcmVhdGVEZWJ1Zy5zYXZlKG5hbWVzcGFjZXMpO1xuXHRcdGNyZWF0ZURlYnVnLm5hbWVzcGFjZXMgPSBuYW1lc3BhY2VzO1xuXG5cdFx0Y3JlYXRlRGVidWcubmFtZXMgPSBbXTtcblx0XHRjcmVhdGVEZWJ1Zy5za2lwcyA9IFtdO1xuXG5cdFx0Y29uc3Qgc3BsaXQgPSAodHlwZW9mIG5hbWVzcGFjZXMgPT09ICdzdHJpbmcnID8gbmFtZXNwYWNlcyA6ICcnKVxuXHRcdFx0LnRyaW0oKVxuXHRcdFx0LnJlcGxhY2UoJyAnLCAnLCcpXG5cdFx0XHQuc3BsaXQoJywnKVxuXHRcdFx0LmZpbHRlcihCb29sZWFuKTtcblxuXHRcdGZvciAoY29uc3QgbnMgb2Ygc3BsaXQpIHtcblx0XHRcdGlmIChuc1swXSA9PT0gJy0nKSB7XG5cdFx0XHRcdGNyZWF0ZURlYnVnLnNraXBzLnB1c2gobnMuc2xpY2UoMSkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3JlYXRlRGVidWcubmFtZXMucHVzaChucyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gc3RyaW5nIG1hdGNoZXMgYSBuYW1lc3BhY2UgdGVtcGxhdGUsIGhvbm9yaW5nXG5cdCAqIGFzdGVyaXNrcyBhcyB3aWxkY2FyZHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzZWFyY2hcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRlbXBsYXRlXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59XG5cdCAqL1xuXHRmdW5jdGlvbiBtYXRjaGVzVGVtcGxhdGUoc2VhcmNoLCB0ZW1wbGF0ZSkge1xuXHRcdGxldCBzZWFyY2hJbmRleCA9IDA7XG5cdFx0bGV0IHRlbXBsYXRlSW5kZXggPSAwO1xuXHRcdGxldCBzdGFySW5kZXggPSAtMTtcblx0XHRsZXQgbWF0Y2hJbmRleCA9IDA7XG5cblx0XHR3aGlsZSAoc2VhcmNoSW5kZXggPCBzZWFyY2gubGVuZ3RoKSB7XG5cdFx0XHRpZiAodGVtcGxhdGVJbmRleCA8IHRlbXBsYXRlLmxlbmd0aCAmJiAodGVtcGxhdGVbdGVtcGxhdGVJbmRleF0gPT09IHNlYXJjaFtzZWFyY2hJbmRleF0gfHwgdGVtcGxhdGVbdGVtcGxhdGVJbmRleF0gPT09ICcqJykpIHtcblx0XHRcdFx0Ly8gTWF0Y2ggY2hhcmFjdGVyIG9yIHByb2NlZWQgd2l0aCB3aWxkY2FyZFxuXHRcdFx0XHRpZiAodGVtcGxhdGVbdGVtcGxhdGVJbmRleF0gPT09ICcqJykge1xuXHRcdFx0XHRcdHN0YXJJbmRleCA9IHRlbXBsYXRlSW5kZXg7XG5cdFx0XHRcdFx0bWF0Y2hJbmRleCA9IHNlYXJjaEluZGV4O1xuXHRcdFx0XHRcdHRlbXBsYXRlSW5kZXgrKzsgLy8gU2tpcCB0aGUgJyonXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VhcmNoSW5kZXgrKztcblx0XHRcdFx0XHR0ZW1wbGF0ZUluZGV4Kys7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoc3RhckluZGV4ICE9PSAtMSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5lZ2F0ZWQtY29uZGl0aW9uXG5cdFx0XHRcdC8vIEJhY2t0cmFjayB0byB0aGUgbGFzdCAnKicgYW5kIHRyeSB0byBtYXRjaCBtb3JlIGNoYXJhY3RlcnNcblx0XHRcdFx0dGVtcGxhdGVJbmRleCA9IHN0YXJJbmRleCArIDE7XG5cdFx0XHRcdG1hdGNoSW5kZXgrKztcblx0XHRcdFx0c2VhcmNoSW5kZXggPSBtYXRjaEluZGV4O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBObyBtYXRjaFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSB0cmFpbGluZyAnKicgaW4gdGVtcGxhdGVcblx0XHR3aGlsZSAodGVtcGxhdGVJbmRleCA8IHRlbXBsYXRlLmxlbmd0aCAmJiB0ZW1wbGF0ZVt0ZW1wbGF0ZUluZGV4XSA9PT0gJyonKSB7XG5cdFx0XHR0ZW1wbGF0ZUluZGV4Kys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRlbXBsYXRlSW5kZXggPT09IHRlbXBsYXRlLmxlbmd0aDtcblx0fVxuXG5cdC8qKlxuXHQqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuXHQqXG5cdCogQHJldHVybiB7U3RyaW5nfSBuYW1lc3BhY2VzXG5cdCogQGFwaSBwdWJsaWNcblx0Ki9cblx0ZnVuY3Rpb24gZGlzYWJsZSgpIHtcblx0XHRjb25zdCBuYW1lc3BhY2VzID0gW1xuXHRcdFx0Li4uY3JlYXRlRGVidWcubmFtZXMsXG5cdFx0XHQuLi5jcmVhdGVEZWJ1Zy5za2lwcy5tYXAobmFtZXNwYWNlID0+ICctJyArIG5hbWVzcGFjZSlcblx0XHRdLmpvaW4oJywnKTtcblx0XHRjcmVhdGVEZWJ1Zy5lbmFibGUoJycpO1xuXHRcdHJldHVybiBuYW1lc3BhY2VzO1xuXHR9XG5cblx0LyoqXG5cdCogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuXHQqXG5cdCogQHBhcmFtIHtTdHJpbmd9IG5hbWVcblx0KiBAcmV0dXJuIHtCb29sZWFufVxuXHQqIEBhcGkgcHVibGljXG5cdCovXG5cdGZ1bmN0aW9uIGVuYWJsZWQobmFtZSkge1xuXHRcdGZvciAoY29uc3Qgc2tpcCBvZiBjcmVhdGVEZWJ1Zy5za2lwcykge1xuXHRcdFx0aWYgKG1hdGNoZXNUZW1wbGF0ZShuYW1lLCBza2lwKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBucyBvZiBjcmVhdGVEZWJ1Zy5uYW1lcykge1xuXHRcdFx0aWYgKG1hdGNoZXNUZW1wbGF0ZShuYW1lLCBucykpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCogQ29lcmNlIGB2YWxgLlxuXHQqXG5cdCogQHBhcmFtIHtNaXhlZH0gdmFsXG5cdCogQHJldHVybiB7TWl4ZWR9XG5cdCogQGFwaSBwcml2YXRlXG5cdCovXG5cdGZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcblx0XHRpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG5cdFx0fVxuXHRcdHJldHVybiB2YWw7XG5cdH1cblxuXHQvKipcblx0KiBYWFggRE8gTk9UIFVTRS4gVGhpcyBpcyBhIHRlbXBvcmFyeSBzdHViIGZ1bmN0aW9uLlxuXHQqIFhYWCBJdCBXSUxMIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgbWFqb3IgcmVsZWFzZS5cblx0Ki9cblx0ZnVuY3Rpb24gZGVzdHJveSgpIHtcblx0XHRjb25zb2xlLndhcm4oJ0luc3RhbmNlIG1ldGhvZCBgZGVidWcuZGVzdHJveSgpYCBpcyBkZXByZWNhdGVkIGFuZCBubyBsb25nZXIgZG9lcyBhbnl0aGluZy4gSXQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IG1ham9yIHZlcnNpb24gb2YgYGRlYnVnYC4nKTtcblx0fVxuXG5cdGNyZWF0ZURlYnVnLmVuYWJsZShjcmVhdGVEZWJ1Zy5sb2FkKCkpO1xuXG5cdHJldHVybiBjcmVhdGVEZWJ1Zztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXR1cDtcbiIsIi8qKlxuICogSGVscGVycy5cbiAqL1xuXG52YXIgcyA9IDEwMDA7XG52YXIgbSA9IHMgKiA2MDtcbnZhciBoID0gbSAqIDYwO1xudmFyIGQgPSBoICogMjQ7XG52YXIgdyA9IGQgKiA3O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnICYmIHZhbC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHBhcnNlKHZhbCk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZhbClcbiAgKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoID0gL14oLT8oPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHdlZWtzP3x3fHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKFxuICAgIHN0clxuICApO1xuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gIHZhciB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKCk7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3llYXJzJzpcbiAgICBjYXNlICd5ZWFyJzpcbiAgICBjYXNlICd5cnMnOlxuICAgIGNhc2UgJ3lyJzpcbiAgICBjYXNlICd5JzpcbiAgICAgIHJldHVybiBuICogeTtcbiAgICBjYXNlICd3ZWVrcyc6XG4gICAgY2FzZSAnd2Vlayc6XG4gICAgY2FzZSAndyc6XG4gICAgICByZXR1cm4gbiAqIHc7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICB2YXIgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gIGlmIChtc0FicyA+PSBkKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJztcbiAgfVxuICBpZiAobXNBYnMgPj0gaCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gaCkgKyAnaCc7XG4gIH1cbiAgaWYgKG1zQWJzID49IG0pIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nO1xuICB9XG4gIGlmIChtc0FicyA+PSBzKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJztcbiAgfVxuICByZXR1cm4gbXMgKyAnbXMnO1xufVxuXG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICB2YXIgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gIGlmIChtc0FicyA+PSBkKSB7XG4gICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGQsICdkYXknKTtcbiAgfVxuICBpZiAobXNBYnMgPj0gaCkge1xuICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBoLCAnaG91cicpO1xuICB9XG4gIGlmIChtc0FicyA+PSBtKSB7XG4gICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIG0sICdtaW51dGUnKTtcbiAgfVxuICBpZiAobXNBYnMgPj0gcykge1xuICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBzLCAnc2Vjb25kJyk7XG4gIH1cbiAgcmV0dXJuIG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBtc0FicywgbiwgbmFtZSkge1xuICB2YXIgaXNQbHVyYWwgPSBtc0FicyA+PSBuICogMS41O1xuICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG4pICsgJyAnICsgbmFtZSArIChpc1BsdXJhbCA/ICdzJyA6ICcnKTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuaW1wb3J0IHsgQ29uc3RydWN0aW9uLCBjb252ZXJ0Q29uc3RydWN0aW9uVjJUb1YzLCB9IGZyb20gXCIuL2NvbnN0cnVjdGlvbnMuanNcIjtcbmltcG9ydCB7IE1hdGNoUGFydCwgTWF0Y2hTZXQsIGNvbnZlcnRNYXRjaFNldFYyVG9WMywgaXNNYXRjaFBhcnQsIH0gZnJvbSBcIi4vbWF0Y2hQYXJ0LmpzXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm1zIH0gZnJvbSBcIi4vdHJhbnNmb3Jtcy5qc1wiO1xuaW1wb3J0IHJlZ2lzdGVyRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgeyBjcmVhdGVNYXRjaFBhcnRzQ2FjaGUsIGdldE1hdGNoUGFydHNDYWNoZVN0YXRzLCB9IGZyb20gXCIuL2NvbnN0cnVjdGlvbk1hdGNoLmpzXCI7XG5jb25zdCBkZWJ1Z0NvbnN0ID0gcmVnaXN0ZXJEZWJ1ZyhcInR5cGVhZ2VudDpjb25zdFwiKTtcbmNvbnN0IGRlYnVnQ29uc3RNYXRjaFN0YXQgPSByZWdpc3RlckRlYnVnKFwidHlwZWFnZW50OmNvbnN0Om1hdGNoOnN0YXRcIik7XG4vLyBBZ2VudCBDYWNoZSBkZWZpbmUgdGhlIG5hbWVzcGFjZSBwb2xpY3kuICBBdCB0aGUgY2FjaGUsIGl0IGp1c3QgY29tYmluZSB0aGUga2V5cyBpbnRvIGEgc3RyaW5nIGZvciBsb29rdXAuXG5mdW5jdGlvbiBnZXRDb25zdHJ1Y3Rpb25OYW1lc3BhY2UobmFtZXNwYWNlS2V5cykge1xuICAgIC8vIENvbWJpbmUgdGhlIG5hbWVzcGFjZSBrZXlzIGludG8gYSBzdHJpbmcgdXNpbmcgfCBhcyB0aGUgc2VwYXJhdG9yLiAgVXNlIHRvIGZpbHRlciBlYXNpbHkgd2hlblxuICAgIC8vIGR1cmluZyBtYXRjaCBmb3Igc2NoZW1hcyBhcmUgZGlzYWJsZWQgb3Igbm90IG9yIGhhc2ggbWlzbWF0Y2hlcy5cbiAgICByZXR1cm4gbmFtZXNwYWNlS2V5cy5qb2luKFwifFwiKTtcbn1cbmZ1bmN0aW9uIGdldE5hbWVzcGFjZUtleXMoY29uc3RydWN0aW9uTmFtZXNwYWNlKSB7XG4gICAgLy8gQ29udmVydCB0aGUgbmFtZXNwYWNlIGludG8gYW4gYXJyYXkgb2YgdHJhbnNsYXRvciBuYW1lcyBmb3IgZmlsdGVyaW5nLlxuICAgIHJldHVybiBjb25zdHJ1Y3Rpb25OYW1lc3BhY2Uuc3BsaXQoXCJ8XCIpO1xufVxuY29uc3QgY29uc3RydWN0aW9uQ2FjaGVKU09OVmVyc2lvbiA9IDM7XG5leHBvcnQgY2xhc3MgQ29uc3RydWN0aW9uQ2FjaGUge1xuICAgIGNvbnN0cnVjdG9yKGV4cGxhaW5lck5hbWUpIHtcbiAgICAgICAgdGhpcy5leHBsYWluZXJOYW1lID0gZXhwbGFpbmVyTmFtZTtcbiAgICAgICAgdGhpcy5tYXRjaFNldHNCeVVpZCA9IG5ldyBNYXAoKTtcbiAgICAgICAgLy8gQ29uc3RydWN0aW9uIGFuZCB0cmFuc2Zvcm1zIHVzZSBkaWZmZXJlbnQgbmFtZXNwYWNlcy5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rpb25OYW1lc3BhY2VzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybU5hbWVzcGFjZXMgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIGdldCBjb3VudCgpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBjb25zdHJ1Y3Rpb25OYW1lc3BhY2Ugb2YgdGhpcy5jb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBjb3VudCArPSBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UuY29uc3RydWN0aW9ucy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgICBnZXRGaWx0ZXJlZENvdW50KGZpbHRlcikge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lc3BhY2UsIGNvbnN0cnVjdGlvbk5hbWVzcGFjZSxdIG9mIHRoaXMuY29uc3RydWN0aW9uTmFtZXNwYWNlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBnZXROYW1lc3BhY2VLZXlzKG5hbWVzcGFjZSk7XG4gICAgICAgICAgICBpZiAoa2V5cy5ldmVyeSgoa2V5KSA9PiBmaWx0ZXIoa2V5KSkpIHtcbiAgICAgICAgICAgICAgICBjb3VudCArPSBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UuY29uc3RydWN0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgICBhZGRNYXRjaFNldChtYXRjaFNldCwgbWVyZ2VNYXRjaFNldCkge1xuICAgICAgICBjb25zdCBtZXJnZSA9IG1lcmdlTWF0Y2hTZXQgJiYgbWF0Y2hTZXQuY2FuQmVNZXJnZWQ7XG4gICAgICAgIGNvbnN0IHVpZCA9IG1lcmdlID8gbWF0Y2hTZXQubWVyZ2VkVWlkIDogbWF0Y2hTZXQudW5tZXJnZWRVaWQ7XG4gICAgICAgIGxldCBuZXdNYXRjaFNldCA9IHRoaXMubWF0Y2hTZXRzQnlVaWQuZ2V0KHVpZCk7XG4gICAgICAgIGlmIChuZXdNYXRjaFNldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBJZiBtZXJnZSwgdGhlbiBhZGQgdG8gdGhlIGV4aXN0aW5nIG1hdGNoIHNldC5cbiAgICAgICAgICAgIC8vIElmIG5vbi1tZXJnZSwgdGhlbiB0aGUgdWlkIHdpbGwgaGF2ZSBkZXRlcm1pbmUgdGhlIGVxdWl2YWxlbnQgbWF0Y2ggc2V0IHRvIHJldXNlXG4gICAgICAgICAgICBpZiAobmV3TWF0Y2hTZXQgIT09IG1hdGNoU2V0ICYmIG1lcmdlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtYXRjaCBvZiBtYXRjaFNldC5tYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1lcmdlIG1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgbmV3TWF0Y2hTZXQubWF0Y2hlcy5hZGQobWF0Y2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBtYXRjaCBzZXQgaXMgbW9kaWZpZWQsIGNsZWFyIHRoZSByZWdleHBcbiAgICAgICAgICAgICAgICBuZXdNYXRjaFNldC5jbGVhclJlZ2V4cCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbmV3TWF0Y2hTZXQgPSBtYXRjaFNldC5jbG9uZShtZXJnZSwgdGhpcy5tYXRjaFNldHNCeVVpZC5zaXplKTtcbiAgICAgICAgICAgIHRoaXMubWF0Y2hTZXRzQnlVaWQuc2V0KHVpZCwgbmV3TWF0Y2hTZXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdNYXRjaFNldDtcbiAgICB9XG4gICAgZW5zdXJlQ29uc3RydWN0aW9uTmFtZXNwYWNlKG5hbWVzcGFjZSkge1xuICAgICAgICBjb25zdCBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UgPSB0aGlzLmNvbnN0cnVjdGlvbk5hbWVzcGFjZXMuZ2V0KG5hbWVzcGFjZSk7XG4gICAgICAgIGlmIChjb25zdHJ1Y3Rpb25OYW1lc3BhY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdGlvbk5hbWVzcGFjZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdDYWNoZU5hbWVzcGFjZSA9IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdGlvbnM6IFtdLFxuICAgICAgICAgICAgdHJhbnNmb3JtczogbmV3IFRyYW5zZm9ybXMoKSxcbiAgICAgICAgICAgIG1heElkOiAwLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvbnN0cnVjdGlvbk5hbWVzcGFjZXMuc2V0KG5hbWVzcGFjZSwgbmV3Q2FjaGVOYW1lc3BhY2UpO1xuICAgICAgICByZXR1cm4gbmV3Q2FjaGVOYW1lc3BhY2U7XG4gICAgfVxuICAgIG1lcmdlVHJhbnNmb3JtTmFtZXNwYWNlcyh0cmFuc2Zvcm1OYW1lc3BhY2VzLCBjYWNoZUNvbmZsaWN0cykge1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lc3BhY2UsIHRyYW5zZm9ybXNdIG9mIHRyYW5zZm9ybU5hbWVzcGFjZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybU5hbWVzcGFjZSA9IHRoaXMudHJhbnNmb3JtTmFtZXNwYWNlcy5nZXQobmFtZXNwYWNlKTtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm1OYW1lc3BhY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtTmFtZXNwYWNlcy5zZXQobmFtZXNwYWNlLCB0cmFuc2Zvcm1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybU5hbWVzcGFjZS5tZXJnZSh0cmFuc2Zvcm1zLCBjYWNoZUNvbmZsaWN0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWRkQ29uc3RydWN0aW9uKG5hbWVzcGFjZUtleXMsIGNvbnN0cnVjdGlvbiwgbWVyZ2VNYXRjaFNldHMsIGNhY2hlQ29uZmxpY3RzKSB7XG4gICAgICAgIGNvbnN0IG1lcmdlZFBhcnRzID0gY29uc3RydWN0aW9uLnBhcnRzLm1hcCgocCkgPT4gaXNNYXRjaFBhcnQocClcbiAgICAgICAgICAgID8gbmV3IE1hdGNoUGFydCh0aGlzLmFkZE1hdGNoU2V0KHAubWF0Y2hTZXQsIG1lcmdlTWF0Y2hTZXRzKSwgcC5vcHRpb25hbCwgcC53aWxkY2FyZE1vZGUsIHAudHJhbnNmb3JtSW5mb3MpXG4gICAgICAgICAgICA6IHApO1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSBnZXRDb25zdHJ1Y3Rpb25OYW1lc3BhY2UobmFtZXNwYWNlS2V5cyk7XG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdGlvbk5hbWVzcGFjZSA9IHRoaXMuZW5zdXJlQ29uc3RydWN0aW9uTmFtZXNwYWNlKG5hbWVzcGFjZSk7XG4gICAgICAgIHRoaXMubWVyZ2VUcmFuc2Zvcm1OYW1lc3BhY2VzKGNvbnN0cnVjdGlvbi50cmFuc2Zvcm1OYW1lc3BhY2VzLCBjYWNoZUNvbmZsaWN0cyk7XG4gICAgICAgIC8vIERldGVjdCBpZiB0aGVyZSBhcmUgZXhpc3RpbmcgcnVsZXNcbiAgICAgICAgY29uc3QgZXhpc3RpbmdSdWxlcyA9IGNvbnN0cnVjdGlvbk5hbWVzcGFjZS5jb25zdHJ1Y3Rpb25zLmZpbHRlcigoYykgPT4gYy5pc1N1cGVyc2V0T2YobWVyZ2VkUGFydHMsIGNvbnN0cnVjdGlvbi5pbXBsaWNpdFBhcmFtZXRlcnMpKTtcbiAgICAgICAgaWYgKGV4aXN0aW5nUnVsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4geyBhZGRlZDogZmFsc2UsIGV4aXN0aW5nOiBleGlzdGluZ1J1bGVzIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHJ1bGUgYW5kIHJlbW92ZSBhbGwgdGhlIGV4aXN0aW5nIHJ1bGUgdGhhdCB0aGUgbmV3IHJ1bGUgaXMgYSBzdXBlcnNldCBvZlxuICAgICAgICAvLyBSRVZJRVc6IGRvIHdlIHdhbnQgdG8gc2hhcmUgdHJhbnNmb3JtcyBnbG9iYWxseT9cbiAgICAgICAgY29uc3QgbmV3Q29uc3RydWN0aW9uID0gbmV3IENvbnN0cnVjdGlvbihtZXJnZWRQYXJ0cywgdGhpcy50cmFuc2Zvcm1OYW1lc3BhY2VzLCBjb25zdHJ1Y3Rpb24uaW1wbGljaXRQYXJhbWV0ZXJzLCBjb25zdHJ1Y3Rpb24uaW1wbGljaXRBY3Rpb25OYW1lLCBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UubWF4SWQrKyk7XG4gICAgICAgIGNvbnN0IHJlbW92ZWRSdWxlcyA9IFtdO1xuICAgICAgICBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UuY29uc3RydWN0aW9ucyA9XG4gICAgICAgICAgICBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UuY29uc3RydWN0aW9ucy5maWx0ZXIoKGMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc1N1cGVyc2V0T2YgPSBuZXdDb25zdHJ1Y3Rpb24uaXNTdXBlcnNldE9mKGMucGFydHMsIGMuaW1wbGljaXRQYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNTdXBlcnNldE9mKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZWRSdWxlcy5wdXNoKGMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0cnVjdGlvbk5hbWVzcGFjZS5jb25zdHJ1Y3Rpb25zLnB1c2gobmV3Q29uc3RydWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFkZGVkOiB0cnVlLFxuICAgICAgICAgICAgZXhpc3Rpbmc6IHJlbW92ZWRSdWxlcyxcbiAgICAgICAgICAgIGNvbnN0cnVjdGlvbjogbmV3Q29uc3RydWN0aW9uLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmb3JjZVJlZ2V4cCgpIHtcbiAgICAgICAgdGhpcy5tYXRjaFNldHNCeVVpZC5mb3JFYWNoKChtYXRjaFNldCkgPT4gbWF0Y2hTZXQuZm9yY2VSZWdleHAoKSk7XG4gICAgfVxuICAgIGRlbGV0ZShuYW1lc3BhY2UsIGlkKSB7XG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdGlvbk5hbWVzcGFjZSA9IHRoaXMuY29uc3RydWN0aW9uTmFtZXNwYWNlcy5nZXQobmFtZXNwYWNlKTtcbiAgICAgICAgaWYgKGNvbnN0cnVjdGlvbk5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY291bnQgPSBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UuY29uc3RydWN0aW9ucy5sZW5ndGg7XG4gICAgICAgIGNvbnN0cnVjdGlvbk5hbWVzcGFjZS5jb25zdHJ1Y3Rpb25zID1cbiAgICAgICAgICAgIGNvbnN0cnVjdGlvbk5hbWVzcGFjZS5jb25zdHJ1Y3Rpb25zLmZpbHRlcigoYykgPT4gYy5pZCAhPT0gaWQpO1xuICAgICAgICAvLyBUT0RPOiBHQyBtYXRjaCBzZXRzXG4gICAgICAgIHJldHVybiBjb3VudCAtIGNvbnN0cnVjdGlvbk5hbWVzcGFjZS5jb25zdHJ1Y3Rpb25zLmxlbmd0aDtcbiAgICB9XG4gICAgZ2V0TWF0Y2hlcyhyZXF1ZXN0LCBtYXRjaENvbmZpZywgY29uc3RydWN0aW9uTmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rpb25OYW1lc3BhY2UuY29uc3RydWN0aW9ucy5mbGF0TWFwKChjb25zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3Rpb24ubWF0Y2gocmVxdWVzdCwgbWF0Y2hDb25maWcpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJ1bmUoZmlsdGVyKSB7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZXNwYWNlIG9mIHRoaXMuY29uc3RydWN0aW9uTmFtZXNwYWNlcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBnZXROYW1lc3BhY2VLZXlzKG5hbWVzcGFjZSk7XG4gICAgICAgICAgICBpZiAoIWtleXMuZXZlcnkoKGtleSkgPT4gZmlsdGVyKGtleSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLmRlbGV0ZShuYW1lc3BhY2UpO1xuICAgICAgICAgICAgICAgIGRlYnVnQ29uc3QoYFBydW5lOiAke25hbWVzcGFjZX0gZGVsZXRlZGApO1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgICBtYXRjaChyZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZUtleXMgPSBvcHRpb25zPy5uYW1lc3BhY2VLZXlzO1xuICAgICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICAgICBlbmFibGVXaWxkY2FyZDogb3B0aW9ucz8ud2lsZGNhcmQgPz8gdHJ1ZSwgLy8gZGVmYXVsdCB0byB0cnVlLlxuICAgICAgICAgICAgcmVqZWN0UmVmZXJlbmNlczogb3B0aW9ucz8ucmVqZWN0UmVmZXJlbmNlcyA/PyB0cnVlLCAvLyBkZWZhdWx0IHRvIHRydWUuXG4gICAgICAgICAgICBoaXN0b3J5OiBvcHRpb25zPy5oaXN0b3J5LFxuICAgICAgICAgICAgY29uZmxpY3RzOiBvcHRpb25zPy5jb25mbGljdHMsXG4gICAgICAgICAgICBtYXRjaFBhcnRzQ2FjaGU6IGNyZWF0ZU1hdGNoUGFydHNDYWNoZShyZXF1ZXN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gSWYgdGhlIHVzZVRyYW5zbGF0b3JzIGlzIHVuZGVmaW5lZCB1c2UgYWxsIHRoZSB0cmFuc2xhdG9yc1xuICAgICAgICAvLyBvdGhlcndpc2UgZmlsdGVyIHRoZSB0cmFuc2xhdG9ycyBiYXNlZCBvbiB0aGUgdXNlVHJhbnNsYXRvcnNcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IFtdO1xuICAgICAgICBjb25zdCBmaWx0ZXIgPSBuYW1lc3BhY2VLZXlzID8gbmV3IFNldChuYW1lc3BhY2VLZXlzKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgY29uc3RydWN0aW9uTmFtZXNwYWNlLF0gb2YgdGhpcy5jb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IGdldE5hbWVzcGFjZUtleXMobmFtZSk7XG4gICAgICAgICAgICBpZiAoa2V5cy5zb21lKChrZXkpID0+IGZpbHRlcj8uaGFzKGtleSkgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKC4uLnRoaXMuZ2V0TWF0Y2hlcyhyZXF1ZXN0LCBjb25maWcsIGNvbnN0cnVjdGlvbk5hbWVzcGFjZSkpO1xuICAgICAgICB9XG4gICAgICAgIGRlYnVnQ29uc3RNYXRjaFN0YXQoZ2V0TWF0Y2hQYXJ0c0NhY2hlU3RhdHMoY29uZmlnLm1hdGNoUGFydHNDYWNoZSkpO1xuICAgICAgICByZXR1cm4gbWF0Y2hlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAvLyBSRVZJRVc6IHRlbXBvcmFyeSBoZXVyaXN0aWNzIHRvIGdldCBiZXR0ZXIgcmVzdWx0IHdpdGggd2lsZGNhcmRzXG4gICAgICAgICAgICAvLyBQcmVmZXIgbm9uLXdpbGRjYXJkIG1hdGNoZXNcbiAgICAgICAgICAgIGlmIChhLndpbGRjYXJkQ2hhckNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGIud2lsZGNhcmRDaGFyQ291bnQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChiLndpbGRjYXJkQ2hhckNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByZWZlciBsZXNzIGltcGxpY2l0IHBhcmFtZXRlcnNcbiAgICAgICAgICAgIGlmIChhLmNvbnN0cnVjdGlvbi5pbXBsaWNpdFBhcmFtZXRlckNvdW50ICE9PVxuICAgICAgICAgICAgICAgIGIuY29uc3RydWN0aW9uLmltcGxpY2l0UGFyYW1ldGVyQ291bnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGEuY29uc3RydWN0aW9uLmltcGxpY2l0UGFyYW1ldGVyQ291bnQgLVxuICAgICAgICAgICAgICAgICAgICBiLmNvbnN0cnVjdGlvbi5pbXBsaWNpdFBhcmFtZXRlckNvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByZWZlciBtb3JlIG5vbi1vcHRpb25hbCBwYXJ0c1xuICAgICAgICAgICAgaWYgKGIubm9uT3B0aW9uYWxDb3VudCAhPT0gYS5ub25PcHRpb25hbENvdW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGIubm9uT3B0aW9uYWxDb3VudCAtIGEubm9uT3B0aW9uYWxDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByZWZlciBtb3JlIG1hdGNoZWQgcGFydHNcbiAgICAgICAgICAgIGlmIChiLm1hdGNoZWRDb3VudCAhPT0gYS5tYXRjaGVkQ291bnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYi5tYXRjaGVkQ291bnQgLSBhLm1hdGNoZWRDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByZWZlciBsZXNzIHdpbGRjYXJkIGNoYXJhY3RlcnNcbiAgICAgICAgICAgIHJldHVybiBhLndpbGRjYXJkQ2hhckNvdW50IC0gYi53aWxkY2FyZENoYXJDb3VudDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtYXRjaFNldHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoU2V0c0J5VWlkLnZhbHVlcygpO1xuICAgIH1cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2ZXJzaW9uOiBjb25zdHJ1Y3Rpb25DYWNoZUpTT05WZXJzaW9uLFxuICAgICAgICAgICAgZXhwbGFpbmVyTmFtZTogdGhpcy5leHBsYWluZXJOYW1lLFxuICAgICAgICAgICAgbWF0Y2hTZXRzOiBBcnJheS5mcm9tKHRoaXMubWF0Y2hTZXRzKSxcbiAgICAgICAgICAgIGNvbnN0cnVjdGlvbk5hbWVzcGFjZXM6IEFycmF5LmZyb20odGhpcy5jb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgY29uc3RydWN0aW9uTmFtZXNwYWNlXSkgPT4gKHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdGlvbnM6IGNvbnN0cnVjdGlvbk5hbWVzcGFjZS5jb25zdHJ1Y3Rpb25zLFxuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgdHJhbnNmb3JtTmFtZXNwYWNlczogQXJyYXkuZnJvbSh0aGlzLnRyYW5zZm9ybU5hbWVzcGFjZXMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB0cmFuc2Zvcm1zXSkgPT4gKHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybXMsXG4gICAgICAgICAgICB9KSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tSlNPTihvcmlnaW5hbEpTT04pIHtcbiAgICAgICAgY29uc3QganNvbiA9IGVuc3VyZVZlcnNpb24ob3JpZ2luYWxKU09OKTtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBuZXcgQ29uc3RydWN0aW9uQ2FjaGUoanNvbi5leHBsYWluZXJOYW1lKTtcbiAgICAgICAgLy8gTG9hZCB0aGUgbWF0Y2ggc2V0c1xuICAgICAgICBjb25zdCBhbGxNYXRjaFNldHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAoY29uc3QgbWF0Y2hTZXQgb2YganNvbi5tYXRjaFNldHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld01hdGNoU2V0ID0gbmV3IE1hdGNoU2V0KG1hdGNoU2V0Lm1hdGNoZXMsIG1hdGNoU2V0LmJhc2VuYW1lLCBtYXRjaFNldC5jYW5CZU1lcmdlZCwgbWF0Y2hTZXQubmFtZXNwYWNlLCBtYXRjaFNldC5pbmRleCk7XG4gICAgICAgICAgICBjb25zdCB1aWQgPSBtYXRjaFNldC5jYW5CZU1lcmdlZFxuICAgICAgICAgICAgICAgID8gbmV3TWF0Y2hTZXQubWVyZ2VkVWlkXG4gICAgICAgICAgICAgICAgOiBuZXdNYXRjaFNldC51bm1lcmdlZFVpZDtcbiAgICAgICAgICAgIHN0b3JlLm1hdGNoU2V0c0J5VWlkLnNldCh1aWQsIG5ld01hdGNoU2V0KTtcbiAgICAgICAgICAgIGFsbE1hdGNoU2V0cy5zZXQobmV3TWF0Y2hTZXQuZnVsbE5hbWUsIG5ld01hdGNoU2V0KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBsb2FkIHRoZSBjb25zdHJ1Y3Rpb25zIGFuZCB0cmFuc2Zvcm1zIGZvciBlYWNoIHRyYW5zbGF0b3JcbiAgICAgICAganNvbi5jb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLmZvckVhY2goKHsgbmFtZSwgY29uc3RydWN0aW9ucyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdDb25zdHJ1Y3Rpb25zID0gY29uc3RydWN0aW9ucy5tYXAoKGNvbnN0cnVjdGlvbiwgaW5kZXgpID0+IENvbnN0cnVjdGlvbi5mcm9tSlNPTihjb25zdHJ1Y3Rpb24sIGFsbE1hdGNoU2V0cywgc3RvcmUudHJhbnNmb3JtTmFtZXNwYWNlcywgaW5kZXgpKTtcbiAgICAgICAgICAgIHN0b3JlLmNvbnN0cnVjdGlvbk5hbWVzcGFjZXMuc2V0KG5hbWUsIHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rpb25zOiBuZXdDb25zdHJ1Y3Rpb25zLFxuICAgICAgICAgICAgICAgIG1heElkOiBuZXdDb25zdHJ1Y3Rpb25zLmxlbmd0aCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVidWdDb25zdChuZXdDb25zdHJ1Y3Rpb25zLmpvaW4oXCJcXG4gIFwiKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBqc29uLnRyYW5zZm9ybU5hbWVzcGFjZXMuZm9yRWFjaCgoeyBuYW1lLCB0cmFuc2Zvcm1zIH0pID0+IHtcbiAgICAgICAgICAgIHN0b3JlLnRyYW5zZm9ybU5hbWVzcGFjZXMuc2V0KG5hbWUsIFRyYW5zZm9ybXMuZnJvbUpTT04odHJhbnNmb3JtcykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN0b3JlO1xuICAgIH1cbiAgICAvLyBmb3Igdmlld2Vyc1xuICAgIGdldENvbnN0cnVjdGlvbk5hbWVzcGFjZShuYW1lc3BhY2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0aW9uTmFtZXNwYWNlcy5nZXQobmFtZXNwYWNlKTtcbiAgICB9XG4gICAgZ2V0Q29uc3RydWN0aW9uTmFtZXNwYWNlcygpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLmtleXMoKSk7XG4gICAgfVxuICAgIGdldFRyYW5zZm9ybU5hbWVzcGFjZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybU5hbWVzcGFjZXM7XG4gICAgfVxufVxuY29uc3QgY29uc3RydWN0aW9uQ2FjaGVKU09OVmVyc2lvbjIgPSAyO1xuZnVuY3Rpb24gZW5zdXJlVmVyc2lvbihqc29uKSB7XG4gICAgaWYgKGpzb24udmVyc2lvbiA9PT0gY29uc3RydWN0aW9uQ2FjaGVKU09OVmVyc2lvbikge1xuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG4gICAgaWYgKGpzb24udmVyc2lvbiAhPT0gY29uc3RydWN0aW9uQ2FjaGVKU09OVmVyc2lvbjIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCB2ZXJzaW9uIG9mIENvbnN0cnVjdGlvbkNhY2hlOiAke2pzb24udmVyc2lvbn1gKTtcbiAgICB9XG4gICAgLy8gQ29udmVydCBmcm9tIFYyIHRvIFYzXG4gICAgY29uc3QganNvblYyID0ganNvbjtcbiAgICBjb25zdCB7IG1hdGNoU2V0cywgbWF0Y2hTZXRUb1RyYW5zZm9ybUluZm8gfSA9IGNvbnZlcnRNYXRjaFNldFYyVG9WMyhqc29uVjIubWF0Y2hTZXRzKTtcbiAgICBjb25zdCBjb25zdHJ1Y3Rpb25OYW1lc3BhY2VzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgeyBuYW1lLCBjb25zdHJ1Y3Rpb25zIH0gb2YganNvblYyLnRyYW5zbGF0b3JzKSB7XG4gICAgICAgIGNvbnZlcnRDb25zdHJ1Y3Rpb25WMlRvVjMoY29uc3RydWN0aW9ucywgbWF0Y2hTZXRUb1RyYW5zZm9ybUluZm8pO1xuICAgICAgICAvLyB2MyBvbmx5IHVzZSB0aGUgdHJhbnNsYXRvciBuYW1lIGFzIHRoZSBuYW1lc3BhY2VzIGZvciBjb25zdHJ1Y3Rpb25zLlxuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSBuYW1lLnNwbGl0KFwiLlwiKVswXTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBjb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLmdldChuYW1lc3BhY2UpID8/IFtdO1xuICAgICAgICBleGlzdGluZy5wdXNoKC4uLmNvbnN0cnVjdGlvbnMpO1xuICAgICAgICBjb25zdHJ1Y3Rpb25OYW1lc3BhY2VzLnNldChuYW1lc3BhY2UsIGV4aXN0aW5nKTtcbiAgICB9XG4gICAgY29uc3QganNvblYzID0ge1xuICAgICAgICB2ZXJzaW9uOiBjb25zdHJ1Y3Rpb25DYWNoZUpTT05WZXJzaW9uLFxuICAgICAgICBleHBsYWluZXJOYW1lOiBqc29uVjIuZXhwbGFpbmVyTmFtZSxcbiAgICAgICAgbWF0Y2hTZXRzLFxuICAgICAgICBjb25zdHJ1Y3Rpb25OYW1lc3BhY2VzOiBBcnJheS5mcm9tKGNvbnN0cnVjdGlvbk5hbWVzcGFjZXMuZW50cmllcygpKS5tYXAoKFtuYW1lLCBjb25zdHJ1Y3Rpb25zXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBjb25zdHJ1Y3Rpb25zLFxuICAgICAgICB9KSksXG4gICAgICAgIHRyYW5zZm9ybU5hbWVzcGFjZXM6IGpzb25WMi50cmFuc2xhdG9ycy5tYXAoKHsgbmFtZSwgdHJhbnNmb3JtcyB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geyBuYW1lLCB0cmFuc2Zvcm1zIH07XG4gICAgICAgIH0pLFxuICAgIH07XG4gICAgcmV0dXJuIGpzb25WMztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0cnVjdGlvbkNhY2hlLmpzLm1hcCIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuaW1wb3J0IHsgZ2V0TGFuZ3VhZ2VUb29scyB9IGZyb20gXCIuLi91dGlscy9sYW5ndWFnZS5qc1wiO1xuaW1wb3J0IHsgaXNTcGFjZU9yUHVuY3R1YXRpb24sIGlzU3BhY2VPclB1bmN0dWF0aW9uUmFuZ2UsIGlzV29yZEJvdW5kYXJ5LCBzcGFjZUFuZFB1bmN0dWF0aW9uUmVnZXhTdHIsIH0gZnJvbSBcIi4uL3V0aWxzL3JlZ2V4cC5qc1wiO1xuaW1wb3J0IHsgbWF0Y2hlZFZhbHVlcywgfSBmcm9tIFwiLi9jb25zdHJ1Y3Rpb25WYWx1ZS5qc1wiO1xuY29uc3Qgd2lsZGNhcmRSZWdleCA9IG5ldyBSZWdFeHAoYF4ke3NwYWNlQW5kUHVuY3R1YXRpb25SZWdleFN0cn0qKFteXFxcXHNdLio/KSR7c3BhY2VBbmRQdW5jdHVhdGlvblJlZ2V4U3RyfSokYCk7XG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hQYXJ0cyhyZXF1ZXN0LCBwYXJ0cywgY29uZmlnLCBtYXRjaFZhbHVlVHJhbnNsYXRvcikge1xuICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgICBjYXB0dXJlOiBbXSxcbiAgICAgICAgbWF0Y2hlZFN0YXJ0OiBbXSxcbiAgICAgICAgbWF0Y2hlZEVuZDogW10sXG4gICAgICAgIG1hdGNoZWRDdXJyZW50OiAwLFxuICAgICAgICBwZW5kaW5nV2lsZGNhcmQ6IC0xLFxuICAgIH07XG4gICAgY29uc3Qgd2lsZGNhcmRRdWV1ZSA9IFtdO1xuICAgIGRvIHtcbiAgICAgICAgaWYgKGZpbmlzaE1hdGNoUGFydHMoc3RhdGUsIHJlcXVlc3QsIHBhcnRzLCBjb25maWcpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSBtYXRjaGVkVmFsdWVzKHBhcnRzLCBzdGF0ZS5jYXB0dXJlLCBjb25maWcsIG1hdGNoVmFsdWVUcmFuc2xhdG9yKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IHdoaWxlIChiYWNrdHJhY2soc3RhdGUsIHJlcXVlc3QsIHBhcnRzLCBjb25maWcsIHdpbGRjYXJkUXVldWUpKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gZmluZFBlbmRpbmdXaWxkY2FyZChyZXF1ZXN0LCBtYXRjaGVkQ3VycmVudCkge1xuICAgIGxldCBjdXJyZW50ID0gbWF0Y2hlZEN1cnJlbnQgKyAxOyAvLyB3aWxkY2FyZCBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGNoYXJhY3RlclxuICAgIHdoaWxlIChjdXJyZW50IDwgcmVxdWVzdC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGlzV29yZEJvdW5kYXJ5KHJlcXVlc3QsIGN1cnJlbnQpKSB7XG4gICAgICAgICAgICBjb25zdCB3aWxkY2FyZFJhbmdlID0gcmVxdWVzdC5zdWJzdHJpbmcobWF0Y2hlZEN1cnJlbnQsIGN1cnJlbnQpO1xuICAgICAgICAgICAgY29uc3Qgd2lsZGNhcmRNYXRjaCA9IHdpbGRjYXJkUmVnZXguZXhlYyh3aWxkY2FyZFJhbmdlKTtcbiAgICAgICAgICAgIGlmICh3aWxkY2FyZE1hdGNoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gbm90IHdvcmQgYm91bmRhcnkgb3Igbm8gdGV4dCBmb3IgdGhlIHdpbGRjYXJkXG4gICAgICAgIGN1cnJlbnQrKztcbiAgICB9XG4gICAgLy8gZmlyc3QgcG90ZW50aWFsIGVuZCBvZiB0aGUgd2lsZGNhcmRcbiAgICByZXR1cm4gY3VycmVudCAtIG1hdGNoZWRDdXJyZW50O1xufVxuY29uc3QgbGFuZ1Rvb2wgPSBnZXRMYW5ndWFnZVRvb2xzKFwiZW5cIik7XG5mdW5jdGlvbiBjYXB0dXJlTWF0Y2goc3RhdGUsIHBhcnQsIG0sIHJlamVjdFJlZmVyZW5jZSkge1xuICAgIGlmIChwYXJ0LmNhcHR1cmUpIHtcbiAgICAgICAgc3RhdGUuY2FwdHVyZS5wdXNoKG0udGV4dCk7XG4gICAgICAgIGlmIChyZWplY3RSZWZlcmVuY2UgJiYgbGFuZ1Rvb2w/LnBvc3NpYmxlUmVmZXJlbnRpYWxQaHJhc2UobS50ZXh0KSkge1xuICAgICAgICAgICAgLy8gVGhlIGNhcHR1cmVkIHRleHQgY2FuJ3QgYmUgYSByZWZlcmVudGlhbCBwaHJhc2UuXG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsc2UgYWZ0ZXIgYWRkaW5nIHRoZSB0ZXh0IHRvIGNhcHR1cmUgc28gdGhhdCBiYWNrdHJhY2sgd2lsbFxuICAgICAgICAgICAgLy8gdHJ5IGxvbmdlciB3aWxkY2FyZCBiZWZvcmUgdGhpcyBwYXJ0IG9yIHNob3J0ZXIgbWF0Y2ggZm9yIHRoaXMgcGFydC5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGNhcHR1cmVXaWxkY2FyZE1hdGNoKHN0YXRlLCB3aWxkY2FyZFRleHQsIHJlamVjdFJlZmVyZW5jZXMpIHtcbiAgICBpZiAocmVqZWN0UmVmZXJlbmNlcyAmJiBsYW5nVG9vbD8ucG9zc2libGVSZWZlcmVudGlhbFBocmFzZSh3aWxkY2FyZFRleHQpKSB7XG4gICAgICAgIC8vIFRoZSB3aWxkY2FyZCBjYW4ndCBiZSBhIHJlZmVyZW50aWFsIHBocmFzZS4gUmV0dXJuIGZhbHNlIGJlZm9yZSBhZGRpbmdcbiAgICAgICAgLy8gdGhlIHdpbGRjYXJkIHRleHQgdG8gY2FwdHVyZSB0byBzdG9wIGJhY2t0cmFjayBhbmQgdHJ5IGFub3RoZXIgc3RhdGVcbiAgICAgICAgLy8gZnJvbSB0aGUgd2lsZGNhcmQgcXVldWUgKHRoYXQgaXMgbm90IGF0IHRoaXMgcG9zaXRpb24pLlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRlLnBlbmRpbmdXaWxkY2FyZCA9IC0xO1xuICAgIHN0YXRlLmNhcHR1cmUucHVzaCh3aWxkY2FyZFRleHQpO1xuICAgIHN0YXRlLm1hdGNoZWRFbmQucHVzaCgtMSk7IC8vIFVzZSAtMSB0byBpbmRpY2F0ZSBhIHdpbGRjYXJkIG1hdGNoXG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBmaW5pc2hNYXRjaFBhcnRzKHN0YXRlLCByZXF1ZXN0LCBwYXJ0cywgY29uZmlnKSB7XG4gICAgd2hpbGUgKHN0YXRlLm1hdGNoZWRTdGFydC5sZW5ndGggPCBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgcGFydCA9IHBhcnRzW3N0YXRlLm1hdGNoZWRTdGFydC5sZW5ndGhdO1xuICAgICAgICBjb25zdCBtID0gbWF0Y2hSZWdFeHAoc3RhdGUsIHJlcXVlc3QsIHBhcnQucmVnRXhwLCBjb25maWcubWF0Y2hQYXJ0c0NhY2hlKTtcbiAgICAgICAgaWYgKG0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gTm8gbWF0Y2hcbiAgICAgICAgICAgIGlmIChwYXJ0Lm9wdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgLy8gU2tpcCB0aGUgb3B0aW9uYWwgcGFydFxuICAgICAgICAgICAgICAgIHN0YXRlLm1hdGNoZWRTdGFydC5wdXNoKC0xKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNYXRjaGVkXG4gICAgICAgIGlmIChzdGF0ZS5wZW5kaW5nV2lsZGNhcmQgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCB3aWxkY2FyZFRleHQgPSBtLndpbGRjYXJkO1xuICAgICAgICAgICAgY29uc3Qgd2lsZHBhcnQgPSBwYXJ0c1tzdGF0ZS5tYXRjaGVkU3RhcnQubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAoIWNhcHR1cmVXaWxkY2FyZE1hdGNoKHN0YXRlLCB3aWxkY2FyZFRleHQsIGNvbmZpZy5yZWplY3RSZWZlcmVuY2VzICYmXG4gICAgICAgICAgICAgICAgd2lsZHBhcnQud2lsZGNhcmRNb2RlICE9PSAyIC8qIFdpbGRjYXJkTW9kZS5DaGVja2VkICovKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRlLm1hdGNoZWRTdGFydC5wdXNoKG0uc3RhcnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUubWF0Y2hlZFN0YXJ0LnB1c2goc3RhdGUubWF0Y2hlZEN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hdGNoZWRFbmQgPSBtLnN0YXJ0ICsgbS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgc3RhdGUubWF0Y2hlZEVuZC5wdXNoKG1hdGNoZWRFbmQpO1xuICAgICAgICBzdGF0ZS5tYXRjaGVkQ3VycmVudCA9IG1hdGNoZWRFbmQ7XG4gICAgICAgIGlmICghY2FwdHVyZU1hdGNoKHN0YXRlLCBwYXJ0LCBtLCBjb25maWcucmVqZWN0UmVmZXJlbmNlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RhdGUucGVuZGluZ1dpbGRjYXJkID09PSAtMSkge1xuICAgICAgICAvLyBUaGUgdGFpbCBzaG91bGQgb25seSBiZSBzcGFjZSBvciBwdW5jdHVhdGlvblxuICAgICAgICByZXR1cm4gKHN0YXRlLm1hdGNoZWRDdXJyZW50ID09PSByZXF1ZXN0Lmxlbmd0aCB8fFxuICAgICAgICAgICAgaXNTcGFjZU9yUHVuY3R1YXRpb25SYW5nZShyZXF1ZXN0LCBzdGF0ZS5tYXRjaGVkQ3VycmVudCwgcmVxdWVzdC5sZW5ndGgpKTtcbiAgICB9XG4gICAgLy8gRW5kIHdpdGggd2lsZGNhcmRcbiAgICBjb25zdCB3aWxkY2FyZFJhbmdlID0gcmVxdWVzdC5zdWJzdHJpbmcoc3RhdGUubWF0Y2hlZEN1cnJlbnQpO1xuICAgIGNvbnN0IHdpbGRjYXJkTWF0Y2ggPSB3aWxkY2FyZFJlZ2V4LmV4ZWMod2lsZGNhcmRSYW5nZSk7XG4gICAgaWYgKHdpbGRjYXJkTWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSBpbiBjYXNlIHdlIG5lZWQgdG8gYmFja3RyYWNrIGJlY2F1c2UgdmFsdWUgdHJhbnNsYXRpb24gZmFpbGVkLlxuICAgICAgICBpZiAoIWNhcHR1cmVXaWxkY2FyZE1hdGNoKHN0YXRlLCB3aWxkY2FyZE1hdGNoWzFdLCBjb25maWcucmVqZWN0UmVmZXJlbmNlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5tYXRjaGVkQ3VycmVudCA9IHJlcXVlc3QubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gY2xvbmVNYXRjaFN0YXRlKHN0YXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2FwdHVyZTogWy4uLnN0YXRlLmNhcHR1cmVdLFxuICAgICAgICBtYXRjaGVkU3RhcnQ6IFsuLi5zdGF0ZS5tYXRjaGVkU3RhcnRdLFxuICAgICAgICBtYXRjaGVkRW5kOiBbLi4uc3RhdGUubWF0Y2hlZEVuZF0sXG4gICAgICAgIG1hdGNoZWRDdXJyZW50OiBzdGF0ZS5tYXRjaGVkQ3VycmVudCxcbiAgICAgICAgcGVuZGluZ1dpbGRjYXJkOiBzdGF0ZS5wZW5kaW5nV2lsZGNhcmQsXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJlc3VtZUZyb21XaWxkY2FyZFF1ZXVlKHN0YXRlLCByZXF1ZXN0LCB3aWxkY2FyZFF1ZXVlKSB7XG4gICAgLy8gYmFja3RyYWNrIHRvIGZyb20gdGhlIHdpbGRjYXJkIHF1ZXVlXG4gICAgY29uc3Qgd2lsZGNhcmRTdGF0ZSA9IHdpbGRjYXJkUXVldWUuc2hpZnQoKTtcbiAgICBpZiAod2lsZGNhcmRTdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIE5vIG1vcmUgdG8gYmFja3RyYWNrXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gUmVzdG9yZSB0aGUgc3RhdGUgYW5kIHNldCB1cCB0aGUgbmV4dCB3aWxkY2FyZC5cbiAgICBzdGF0ZS5tYXRjaGVkU3RhcnQgPSB3aWxkY2FyZFN0YXRlLm1hdGNoZWRTdGFydDtcbiAgICBzdGF0ZS5tYXRjaGVkRW5kID0gd2lsZGNhcmRTdGF0ZS5tYXRjaGVkRW5kO1xuICAgIHN0YXRlLm1hdGNoZWRDdXJyZW50ID0gd2lsZGNhcmRTdGF0ZS5tYXRjaGVkQ3VycmVudDtcbiAgICBzdGF0ZS5jYXB0dXJlID0gd2lsZGNhcmRTdGF0ZS5jYXB0dXJlO1xuICAgIHN0YXRlLnBlbmRpbmdXaWxkY2FyZCA9IGZpbmRQZW5kaW5nV2lsZGNhcmQocmVxdWVzdCwgc3RhdGUubWF0Y2hlZEN1cnJlbnQpO1xuICAgIHN0YXRlLm1hdGNoZWRTdGFydC5wdXNoKHN0YXRlLm1hdGNoZWRDdXJyZW50KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGJhY2t0cmFjayhzdGF0ZSwgcmVxdWVzdCwgcGFydHMsIGNvbmZpZywgd2lsZGNhcmRRdWV1ZSkge1xuICAgIGlmIChjb25maWcuZW5hYmxlV2lsZGNhcmQpIHtcbiAgICAgICAgLy8gaWYgdGhlIHBhcnQgd2UgZmFpbGVkIHRvIG1hdGNoIGNvdWxkIGJlIHdpbGRjYXJkLCBxdWV1ZSB1cCB0aGUgd2lsZGNhcmQgbWF0Y2ggZm9yIGxhdGVyXG4gICAgICAgIGNvbnN0IGZhaWxlZFBhcnQgPSBwYXJ0c1tzdGF0ZS5tYXRjaGVkU3RhcnQubGVuZ3RoXTtcbiAgICAgICAgaWYgKGZhaWxlZFBhcnQgJiYgZmFpbGVkUGFydC53aWxkY2FyZE1vZGUpIHtcbiAgICAgICAgICAgIC8vIERvIG5vdCBxdWV1ZSB1cCBjb25zZWN1dGl2ZSB3aWxkY2FyZC5cbiAgICAgICAgICAgIGlmIChzdGF0ZS5wZW5kaW5nV2lsZGNhcmQgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgd2lsZGNhcmRRdWV1ZS5wdXNoKGNsb25lTWF0Y2hTdGF0ZShzdGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEdvIHRocnUgdGhlIHByZXZpb3VzIG1hdGNoIHRvIGJhY2t0cmFjayB0byB0byByZXN1bWUgdGhlIHNlYXJjaC5cbiAgICAvLyAtIHdpbGRjYXJkIHRoYXQgY2FuIGJlIGxvbmdlclxuICAgIC8vIC0gc2hvcnRlciBtYXRjaFxuICAgIC8vIC0gc2tpcCBzcGFjZSBhbmQgcHVuY3R1YXRpb25cbiAgICAvLyAtIHNraXBwaW5nIG9wdGlvbmFsIHBhcnRcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCBiYWNrdHJhY2tTdGFydCA9IHN0YXRlLm1hdGNoZWRTdGFydC5wb3AoKTtcbiAgICAgICAgaWYgKGJhY2t0cmFja1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIE5vIG1vcmUgdG8gYmFja3RyYWNrLCByZXN1bWUgZnJvbSB3aWxkY2FyZCBxdWV1ZSBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgIHJldHVybiByZXN1bWVGcm9tV2lsZGNhcmRRdWV1ZShzdGF0ZSwgcmVxdWVzdCwgd2lsZGNhcmRRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJhY2t0cmFja1N0YXJ0ID09PSAtMSkge1xuICAgICAgICAgICAgLy8gdGhlIHBhcnQgd2FzIHNraXBwZWQgKG9wdGlvbmFsKSwgY29udGludWUgdG8gZmluZCB0aGUgcGFydCB0aGF0IHdhcyBub3Qgc2tpcHBlZFxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGFzdE1hdGNoZWRDdXJyZW50ID0gc3RhdGUubWF0Y2hlZEN1cnJlbnQ7XG4gICAgICAgIHN0YXRlLm1hdGNoZWRDdXJyZW50ID0gYmFja3RyYWNrU3RhcnQ7XG4gICAgICAgIGlmIChzdGF0ZS5wZW5kaW5nV2lsZGNhcmQgIT09IC0xKSB7XG4gICAgICAgICAgICAvLyBUaGlzIG1lYW4gd2UgY2FuJ3QgZmluZCB0aGUgbmV4dCBwYXJ0IGFmdGVyIHRoZSB3aWxkY2FyZFxuICAgICAgICAgICAgLy8gc2luY2Ugd2lsZGNhcmQgYXJlIG1hdGNoZWQgZnJvbSBjbG9uZWQgc3RhdGUsIG5vIG1vcmUgYmFja3RyYWNraW5nIGlzIG5lY2Vzc2FyeS5cbiAgICAgICAgICAgIC8vIHJlc3VtZSBmcm9tIHdpbGRjYXJkIHF1ZXVlIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VtZUZyb21XaWxkY2FyZFF1ZXVlKHN0YXRlLCByZXF1ZXN0LCB3aWxkY2FyZFF1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBiYWNrdHJhY2tQYXJ0ID0gcGFydHNbc3RhdGUubWF0Y2hlZFN0YXJ0Lmxlbmd0aF07XG4gICAgICAgIGlmIChiYWNrdHJhY2tQYXJ0LmNhcHR1cmUpIHtcbiAgICAgICAgICAgIHN0YXRlLmNhcHR1cmUucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFja3RyYWNrRW5kID0gc3RhdGUubWF0Y2hlZEVuZC5wb3AoKTtcbiAgICAgICAgaWYgKGJhY2t0cmFja0VuZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIC0xIGluZGljYXRlcyBhIHdpbGRjYXJkIG1hdGNoXG4gICAgICAgICAgICBpZiAobGFzdE1hdGNoZWRDdXJyZW50ID49IHJlcXVlc3QubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIC8vIHdpbGRjYXJkIGNhbid0IGJlIGxvbmdlclxuICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdpbGRjYXJkIGFyZSBtYXRjaGVkIGZyb20gY2xvbmVkIHN0YXRlLCBubyBtb3JlIGJhY2t0cmFja2luZyBpcyBuZWNlc3NhcnkuXG4gICAgICAgICAgICAgICAgLy8gcmVzdW1lIGZyb20gd2lsZGNhcmQgcXVldWUgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VtZUZyb21XaWxkY2FyZFF1ZXVlKHN0YXRlLCByZXF1ZXN0LCB3aWxkY2FyZFF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRyeSBmb3IgYSBsb25nZXIgd2lsZGNhcmRcbiAgICAgICAgICAgIHN0YXRlLnBlbmRpbmdXaWxkY2FyZCA9IGxhc3RNYXRjaGVkQ3VycmVudCAtIGJhY2t0cmFja1N0YXJ0ICsgMTtcbiAgICAgICAgICAgIHN0YXRlLm1hdGNoZWRTdGFydC5wdXNoKGJhY2t0cmFja1N0YXJ0KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSB0byBmaW5kIGEgc2hvcnRlciBtYXRjaCBvciBza2lwIHNwYWNlIGFuZCBwdW5jdHVhdGlvblxuICAgICAgICBjb25zdCBiYWNrdHJhY2tNYXRjaCA9IGJhY2t0cmFja1BhcnROZXh0TWF0Y2gocmVxdWVzdCwgYmFja3RyYWNrU3RhcnQsIGJhY2t0cmFja0VuZCwgYmFja3RyYWNrUGFydCwgY29uZmlnLm1hdGNoUGFydHNDYWNoZSk7XG4gICAgICAgIGlmIChiYWNrdHJhY2tNYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyByZWNvcmQgdGhlIGJhY2t0cmFjayBuZXh0IG1hdGNoIGFuZCBjb250aW51ZSB0aGUgc2VhcmNoXG4gICAgICAgICAgICBzdGF0ZS5tYXRjaGVkU3RhcnQucHVzaChiYWNrdHJhY2tNYXRjaC5zdGFydCk7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVkRW5kID0gYmFja3RyYWNrTWF0Y2guc3RhcnQgKyBiYWNrdHJhY2tNYXRjaC50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIHN0YXRlLm1hdGNoZWRFbmQucHVzaChtYXRjaGVkRW5kKTtcbiAgICAgICAgICAgIHN0YXRlLm1hdGNoZWRDdXJyZW50ID0gbWF0Y2hlZEVuZDtcbiAgICAgICAgICAgIGlmICghY2FwdHVyZU1hdGNoKHN0YXRlLCBiYWNrdHJhY2tQYXJ0LCBiYWNrdHJhY2tNYXRjaCwgY29uZmlnLnJlamVjdFJlZmVyZW5jZXMpKSB7XG4gICAgICAgICAgICAgICAgLy8gY29udGludWUgdG8gYmFja3RyYWNrLlxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2l2ZSB1cCBvbiB0aGUgY3VycmVudCBiYWNrdHJhY2tQYXJ0LCBxdWV1ZSB1cCB3aWxkY2FyZCBtYXRjaCBmb3IgbGF0ZXIgaWYgZW5hYmxlZC5cbiAgICAgICAgaWYgKGNvbmZpZy5lbmFibGVXaWxkY2FyZCAmJiBiYWNrdHJhY2tQYXJ0LndpbGRjYXJkTW9kZSkge1xuICAgICAgICAgICAgLy8gcXVldWUgdXAgd2lsZGNhcmQgbWF0Y2hcbiAgICAgICAgICAgIHdpbGRjYXJkUXVldWUucHVzaChjbG9uZU1hdGNoU3RhdGUoc3RhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBpZiBpdCBpcyBvcHRpb25hbCwgYmFja3RyYWNrIHRvIGJlZm9yZSB0aGUgb3B0aW9uYWwgYW5kIHJlc3VtZSB0aGUgc2VhcmNoXG4gICAgICAgIGlmIChiYWNrdHJhY2tQYXJ0Lm9wdGlvbmFsKSB7XG4gICAgICAgICAgICAvLyBSRVZJRVc6IHRoZSBjb25zdHJ1Y3RvciBlbmZvcmNlZCB0aGF0IHBhcnRzIGJlZm9yZSBhbmQgYWZ0ZXIgYSB3aWxkY2FyZCBjYW4ndCBiZSBvcHRpb25hbC5cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgd2UgbmVlZCB0byByZXN0b3IgcGVuZGluZ1dpbGRjYXJkIHN0YXRlIGhlcmUuXG4gICAgICAgICAgICBzdGF0ZS5tYXRjaGVkU3RhcnQucHVzaCgtMSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb250aW51ZSB0byBiYWNrdHJhY2sgaWYgaXQgaXMgbm90IG9wdGlvbmFsIGFuZCBubyBzaG9ydGVyIG1hdGNoXG4gICAgfVxufVxuZnVuY3Rpb24gYmFja3RyYWNrUGFydE5leHRNYXRjaChyZXF1ZXN0LCBsYXN0U3RhcnQsIGxhc3RFbmQsIHBhcnQsIG1hdGNoUGFydHNDYWNoZSkge1xuICAgIC8vIENoZWNrIGlmIHRoZSBwYXJ0IGhhcyBhIHNob3J0ZXIgbWF0Y2hcbiAgICBjb25zdCBiYWNrdHJhY2tTdHJpbmcgPSByZXF1ZXN0LnN1YnN0cmluZygwLCBsYXN0RW5kIC0gMSk7XG4gICAgY29uc3QgYmFja3RyYWNrTWF0Y2ggPSBtYXRjaFJlZ0V4cEF0KGJhY2t0cmFja1N0cmluZywgbGFzdFN0YXJ0LCBwYXJ0LnJlZ0V4cCwgbWF0Y2hQYXJ0c0NhY2hlKTtcbiAgICAvLyBJZiBubyBzaG9ydGVyIG1hdGNoIGFuZCBtYXRjaGVkIHBvc2l0aW9uIGlzIHNwYWNlIG9yIHB1bmN0dWF0aW9uLCB0cnkgdG8gbWF0Y2ggc2tpcHBpbmcgaXQuXG4gICAgcmV0dXJuIChiYWNrdHJhY2tNYXRjaCA/P1xuICAgICAgICAoaXNTcGFjZU9yUHVuY3R1YXRpb24ocmVxdWVzdCwgbGFzdFN0YXJ0KVxuICAgICAgICAgICAgPyBtYXRjaFJlZ0V4cFdpdGhvdXRXaWxkY2FyZChyZXF1ZXN0LCBsYXN0U3RhcnQgKyAxLCBwYXJ0LnJlZ0V4cCwgbWF0Y2hQYXJ0c0NhY2hlKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQpKTtcbn1cbmZ1bmN0aW9uIG1hdGNoUmVnRXhwV2l0aFdpbGRjYXJkKHJlcXVlc3QsIG1hdGNoZWRDdXJyZW50LCByZWdFeHAsIHBlbmRpbmdXaWxkY2FyZCwgbWF0Y2hQYXJ0c0NhY2hlKSB7XG4gICAgbGV0IHNlYXJjaFN0YXJ0ID0gbWF0Y2hlZEN1cnJlbnQgKyBwZW5kaW5nV2lsZGNhcmQ7XG4gICAgd2hpbGUgKHNlYXJjaFN0YXJ0IDwgcmVxdWVzdC5sZW5ndGgpIHtcbiAgICAgICAgLy8gU2tpcCB0byB0aGUgbmV4dCB3b3JkIGJvdW5kYXJ5XG4gICAgICAgIGlmICghaXNXb3JkQm91bmRhcnkocmVxdWVzdCwgc2VhcmNoU3RhcnQpKSB7XG4gICAgICAgICAgICBzZWFyY2hTdGFydCsrO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgaWYgd2UgY2FuIGZpbmQgYSBtYXRjaCB3aXRoIHJlZ0V4cCAoaW5jbHVkZSBzaG9ydGVyIG1hdGNoIGFuZCBzcGFjZSBza2lwcGluZylcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbWF0Y2hSZWdFeHBXaXRob3V0V2lsZGNhcmQocmVxdWVzdCwgc2VhcmNoU3RhcnQsIHJlZ0V4cCwgbWF0Y2hQYXJ0c0NhY2hlKTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzZWFyY2hTdGFydCsrO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm91bmQgYSBtYXRjaCwgZmlsbCBpbiB0aGUgd2lsZGNhcmRcbiAgICAgICAgY29uc3Qgd2lsZGNhcmRSYW5nZSA9IHJlcXVlc3Quc3Vic3RyaW5nKG1hdGNoZWRDdXJyZW50LCByZXN1bHQuc3RhcnQpO1xuICAgICAgICBjb25zdCB3aWxkY2FyZE1hdGNoID0gd2lsZGNhcmRSZWdleC5leGVjKHdpbGRjYXJkUmFuZ2UpO1xuICAgICAgICBpZiAod2lsZGNhcmRNYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW50ZXJuYWwgZXJyb3I6IHdpbGRjYXJkIHNob3VsZCBoYXZlIHRleHRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LndpbGRjYXJkID0gd2lsZGNhcmRNYXRjaFsxXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIG1hdGNoUmVnRXhwQXQocmVxdWVzdCwgc3RhcnQsIHJlZ0V4cCwgbWF0Y2hQYXJ0c0NhY2hlKSB7XG4gICAgbGV0IGN1cnJlbnRSYW5nZSA9IHJlcXVlc3Q7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHN0aWNreVJlZ0V4cEV4ZWNXaXRoQ2FjaGUocmVnRXhwLCBjdXJyZW50UmFuZ2UsIHN0YXJ0LCBtYXRjaFBhcnRzQ2FjaGUpO1xuICAgICAgICBpZiAodGV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gTm8gc21hbGxlciBtYXRjaCBmb3VuZCBhdCB0aGUgaW5kZXhcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0Y2hlZEVuZCA9IHN0YXJ0ICsgdGV4dC5sZW5ndGg7XG4gICAgICAgIGlmIChpc1dvcmRCb3VuZGFyeShyZXF1ZXN0LCBtYXRjaGVkRW5kKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3RhcnQsIHRleHQgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2hlZEVuZCAtIHN0YXJ0ID09PSAxKSB7XG4gICAgICAgICAgICAvLyBDYW4ndCBnbyBzbWFsbGVyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRSYW5nZSA9IHJlcXVlc3Quc3Vic3RyaW5nKDAsIG1hdGNoZWRFbmQgLSAxKTtcbiAgICB9XG59XG5mdW5jdGlvbiBtYXRjaFJlZ0V4cFdpdGhvdXRXaWxkY2FyZChyZXF1ZXN0LCBtYXRjaGVkQ3VycmVudCwgcmVnRXhwLCBtYXRjaFBhcnRzQ2FjaGUpIHtcbiAgICBsZXQgaSA9IG1hdGNoZWRDdXJyZW50O1xuICAgIGRvIHtcbiAgICAgICAgY29uc3QgbWF0Y2hlZCA9IG1hdGNoUmVnRXhwQXQocmVxdWVzdCwgaSwgcmVnRXhwLCBtYXRjaFBhcnRzQ2FjaGUpO1xuICAgICAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1NwYWNlT3JQdW5jdHVhdGlvbihyZXF1ZXN0LCBpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgfSB3aGlsZSAoaSA8IHJlcXVlc3QubGVuZ3RoKTtcbn1cbmZ1bmN0aW9uIG1hdGNoUmVnRXhwKHN0YXRlLCByZXF1ZXN0LCByZWdFeHAsIG1hdGNoUGFydHNDYWNoZSkge1xuICAgIGlmICghcmVnRXhwLnN0aWNreSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZWdFeHAgc2hvdWxkIGJlIHN0aWNreVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLnBlbmRpbmdXaWxkY2FyZCAhPT0gLTFcbiAgICAgICAgPyBtYXRjaFJlZ0V4cFdpdGhXaWxkY2FyZChyZXF1ZXN0LCBzdGF0ZS5tYXRjaGVkQ3VycmVudCwgcmVnRXhwLCBzdGF0ZS5wZW5kaW5nV2lsZGNhcmQsIG1hdGNoUGFydHNDYWNoZSlcbiAgICAgICAgOiBtYXRjaFJlZ0V4cFdpdGhvdXRXaWxkY2FyZChyZXF1ZXN0LCBzdGF0ZS5tYXRjaGVkQ3VycmVudCwgcmVnRXhwLCBtYXRjaFBhcnRzQ2FjaGUpO1xufVxuZnVuY3Rpb24gc3RpY2t5UmVnRXhwRXhlYyhyZWdFeHAsIHMsIHN0YXJ0KSB7XG4gICAgcmVnRXhwLmxhc3RJbmRleCA9IHN0YXJ0O1xuICAgIGNvbnN0IG1hdGNoZWQgPSByZWdFeHAuZXhlYyhzKTtcbiAgICBpZiAobWF0Y2hlZCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKG1hdGNoZWQuaW5kZXggIT09IHN0YXJ0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludGVybmFsIGVycm9yOiBzdGlja3kgcmVnZXggc2hvdWxkIG1hdGNoIGF0IGluZGV4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlZFswXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXRjaFBhcnRzQ2FjaGUoY2FjaGVkU3RyaW5nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2FjaGVkU3RyaW5nLFxuICAgICAgICBjYWNoZTogbmV3IE1hcCgpLFxuICAgICAgICBjYWNoZVdpdGhFbmQ6IG5ldyBNYXAoKSxcbiAgICAgICAgdG90YWxUaW1lOiAwLFxuICAgICAgICBoaXQ6IDAsXG4gICAgICAgIG1pc3M6IDAsXG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXRjaFBhcnRzQ2FjaGVTdGF0cyhtYXRjaFBhcnRzQ2FjaGUpIHtcbiAgICBjb25zdCB0b3RhbCA9IG1hdGNoUGFydHNDYWNoZS5oaXQgKyBtYXRjaFBhcnRzQ2FjaGUubWlzcztcbiAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xuICAgIG1lc3NhZ2VzLnB1c2goYCAgVGltZTogJHttYXRjaFBhcnRzQ2FjaGUudG90YWxUaW1lfWApO1xuICAgIG1lc3NhZ2VzLnB1c2goYCAgIEhpdDogJHttYXRjaFBhcnRzQ2FjaGUuaGl0fSAoJHsoKG1hdGNoUGFydHNDYWNoZS5oaXQgLyB0b3RhbCkgKiAxMDApLnRvRml4ZWQoMil9JSlgKTtcbiAgICBtZXNzYWdlcy5wdXNoKGAgIE1pc3M6ICR7bWF0Y2hQYXJ0c0NhY2hlLm1pc3N9ICgkeygobWF0Y2hQYXJ0c0NhY2hlLm1pc3MgLyB0b3RhbCkgKiAxMDApLnRvRml4ZWQoMil9JSlgKTtcbiAgICBtZXNzYWdlcy5wdXNoKGBSZWdleHA6ICR7bWF0Y2hQYXJ0c0NhY2hlLmNhY2hlLnNpemV9YCk7XG4gICAgcmV0dXJuIG1lc3NhZ2VzLmpvaW4oXCJcXG5cIik7XG59XG5mdW5jdGlvbiBnZXRSZXN1bHRDYWNoZShtYXRjaFBhcnRzQ2FjaGUsIHJlZ0V4cCwgcywgc3RhcnQpIHtcbiAgICBsZXQgY2FjaGU7XG4gICAgaWYgKG1hdGNoUGFydHNDYWNoZS5jYWNoZWRTdHJpbmcgPT09IHMpIHtcbiAgICAgICAgY2FjaGUgPSBtYXRjaFBhcnRzQ2FjaGUuY2FjaGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoIW1hdGNoUGFydHNDYWNoZS5jYWNoZWRTdHJpbmcuc3RhcnRzV2l0aChzKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnRlcm5hbCBlcnJvcjogY2FjaGUgc2hvdWxkIGJlIHByZWZpeFxcbiR7bWF0Y2hQYXJ0c0NhY2hlLmNhY2hlZFN0cmluZ31cXG4ke3N9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGVuZ3RoID0gcy5sZW5ndGggLSBzdGFydDtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdDYWNoZSA9IG1hdGNoUGFydHNDYWNoZS5jYWNoZVdpdGhFbmQuZ2V0KGxlbmd0aCk7XG4gICAgICAgIGlmIChleGlzdGluZ0NhY2hlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNhY2hlID0gZXhpc3RpbmdDYWNoZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgbWF0Y2hQYXJ0c0NhY2hlLmNhY2hlV2l0aEVuZC5zZXQobGVuZ3RoLCBjYWNoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzdWx0Q2FjaGUgPSBjYWNoZS5nZXQocmVnRXhwKTtcbiAgICBpZiAocmVzdWx0Q2FjaGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0Q2FjaGU7XG4gICAgfVxuICAgIGNvbnN0IG5ld1Jlc3VsdENhY2hlID0gW107XG4gICAgY2FjaGUuc2V0KHJlZ0V4cCwgbmV3UmVzdWx0Q2FjaGUpO1xuICAgIHJldHVybiBuZXdSZXN1bHRDYWNoZTtcbn1cbmZ1bmN0aW9uIHN0aWNreVJlZ0V4cEV4ZWNXaXRoQ2FjaGUocmVnRXhwLCBzLCBzdGFydCwgbWF0Y2hQYXJ0c0NhY2hlKSB7XG4gICAgaWYgKG1hdGNoUGFydHNDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBzdGlja3lSZWdFeHBFeGVjKHJlZ0V4cCwgcywgc3RhcnQpO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHRDYWNoZSA9IGdldFJlc3VsdENhY2hlKG1hdGNoUGFydHNDYWNoZSwgcmVnRXhwLCBzLCBzdGFydCk7XG4gICAgaWYgKHJlc3VsdENhY2hlW3N0YXJ0XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1hdGNoUGFydHNDYWNoZS5oaXQrKztcbiAgICAgICAgcmV0dXJuIHJlc3VsdENhY2hlW3N0YXJ0XTtcbiAgICB9XG4gICAgbWF0Y2hQYXJ0c0NhY2hlLm1pc3MrKztcbiAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCByZXN1bHQgPSBzdGlja3lSZWdFeHBFeGVjKHJlZ0V4cCwgcywgc3RhcnQpO1xuICAgIG1hdGNoUGFydHNDYWNoZS50b3RhbFRpbWUgKz0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWU7XG4gICAgcmVzdWx0Q2FjaGVbc3RhcnRdID0gcmVzdWx0O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25zdHJ1Y3Rpb25NYXRjaC5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbmltcG9ydCB7IHNldE9iamVjdFByb3BlcnR5IH0gZnJvbSBcImNvbW1vbi11dGlsc1wiO1xuaW1wb3J0IHsgaXNNYXRjaFBhcnQsIHRvVHJhbnNmb3JtSW5mb0tleSB9IGZyb20gXCIuL21hdGNoUGFydC5qc1wiO1xuaW1wb3J0IHsgaXNQYXJzZVBhcnQgfSBmcm9tIFwiLi9wYXJzZVBhcnQuanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBtYXRjaGVkVmFsdWVzKHBhcnRzLCBtYXRjaGVkLCBjb25maWcsIG1hdGNoVmFsdWVUcmFuc2xhdG9yKSB7XG4gICAgY29uc3QgbWF0Y2hlZFBhcnRzID0gcGFydHMuZmlsdGVyKChlKSA9PiBlLmNhcHR1cmUpO1xuICAgIGlmIChtYXRjaGVkUGFydHMubGVuZ3RoICE9PSBtYXRjaGVkLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnRlcm5hbCBlcnJvcjogbnVtYmVyIG9mIG1hdGNoZWQgcGFydHMgZG9lc24ndCBlcXVhbCBtYXRjaCBncm91cHNcIik7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgIGNvbnN0IGNvbmZsaWN0VmFsdWVzID0gY29uZmlnLmNvbmZsaWN0cyA/IFtdIDogdW5kZWZpbmVkO1xuICAgIGxldCBtYXRjaGVkQ291bnQgPSAwO1xuICAgIGxldCB3aWxkY2FyZENoYXJDb3VudCA9IDA7XG4gICAgY29uc3Qgd2lsZGNhcmROYW1lcyA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBtYXRjaGVkVHJhbnNmb3JtVGV4dCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hdGNoZWRQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwYXJ0ID0gbWF0Y2hlZFBhcnRzW2ldO1xuICAgICAgICBjb25zdCBtYXRjaCA9IG1hdGNoZWRbaV07XG4gICAgICAgIGlmIChpc01hdGNoUGFydChwYXJ0KSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpbmZvIG9mIHBhcnQudHJhbnNmb3JtSW5mb3MpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3JtYXQgb2Yga2V5IGRvZXNuJ3QgbWF0dGVyLCBpdCBpcyBvbmx5IHRvIGVuc3VyZSB1bmlxdWVuZXNzXG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gdG9UcmFuc2Zvcm1JbmZvS2V5KGluZm8pO1xuICAgICAgICAgICAgICAgIGxldCBlbnRyeSA9IG1hdGNoZWRUcmFuc2Zvcm1UZXh0LmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LnRleHQucHVzaChtYXRjaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeSA9IHsgdHJhbnNmb3JtSW5mbzogaW5mbywgdGV4dDogW21hdGNoXSB9O1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkVHJhbnNmb3JtVGV4dC5zZXQoa2V5LCBlbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcuZW5hYmxlV2lsZGNhcmQgJiYgcGFydC53aWxkY2FyZE1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbGRjYXJkTmFtZXMuYWRkKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYXJzZVBhcnQocGFydCkpIHtcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKFtcbiAgICAgICAgICAgICAgICBwYXJ0LnByb3BlcnR5TmFtZSxcbiAgICAgICAgICAgICAgICBtYXRjaFZhbHVlVHJhbnNsYXRvci5wYXJzZShwYXJ0LCBtYXRjaCksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIG1hdGNoZWRDb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW50ZXJuYWwgZXJyb3I6IHVua25vd24gcGFydCB0eXBlXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgW2tleSwgbWF0Y2hlc10gb2YgbWF0Y2hlZFRyYW5zZm9ybVRleHQuZW50cmllcygpKSB7XG4gICAgICAgIC8vIFNlZSBpZiB0aGVyZSBhcmUga25vd24gZW50aXRpZXNcbiAgICAgICAgY29uc3QgdmFsdWUgPSBtYXRjaFZhbHVlVHJhbnNsYXRvci50cmFuc2Zvcm0obWF0Y2hlcy50cmFuc2Zvcm1JbmZvLCBtYXRjaGVzLnRleHQsIGNvbmZpZy5oaXN0b3J5KTtcbiAgICAgICAgY29uc3QgeyB0cmFuc2Zvcm1OYW1lLCBhY3Rpb25JbmRleCB9ID0gbWF0Y2hlcy50cmFuc2Zvcm1JbmZvO1xuICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWUgPSBgJHthY3Rpb25JbmRleCAhPT0gdW5kZWZpbmVkID8gYCR7YWN0aW9uSW5kZXh9LmAgOiBcIlwifSR7dHJhbnNmb3JtTmFtZX1gO1xuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWVzLnB1c2goW3Byb3BlcnR5TmFtZSwgdmFsdWVdKTtcbiAgICAgICAgICAgIG1hdGNoZWRDb3VudCsrO1xuICAgICAgICAgICAgaWYgKGNvbmZsaWN0VmFsdWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gbWF0Y2hWYWx1ZVRyYW5zbGF0b3IudHJhbnNmb3JtQ29uZmxpY3RzPy4obWF0Y2hlcy50cmFuc2Zvcm1JbmZvLCBtYXRjaGVzLnRleHQpO1xuICAgICAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmxpY3RWYWx1ZXMucHVzaChbcHJvcGVydHlOYW1lLCB2XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHdpbGRjYXJkXG4gICAgICAgIGlmICh3aWxkY2FyZE5hbWVzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAvLyBXaWxkY2FyZCBtYXRjaFxuICAgICAgICAgICAgaWYgKG1hdGNoZXMudGV4dC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogRG9uJ3Qgc3VwcG9ydCBtdWx0aXBsZSBzdWJwaHJhc2Ugd2lsZGNhcmQgbWF0Y2ggZm9yIG5vdy5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBtYXRjaGVzLnRleHQuam9pbihcIiBcIik7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaChbcHJvcGVydHlOYW1lLCBtYXRjaF0pO1xuICAgICAgICAgICAgd2lsZGNhcmRDaGFyQ291bnQgKz0gbWF0Y2gubGVuZ3RoO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogT25seSBkZWFsIHdpdGggZXhhY3QgbWF0Y2ggZm9yIG5vd1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIGNvbmZsaWN0VmFsdWVzLFxuICAgICAgICBtYXRjaGVkQ291bnQsXG4gICAgICAgIHdpbGRjYXJkQ2hhckNvdW50LFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQWN0aW9uUHJvcHModmFsdWVzLCBpbml0aWFsKSB7XG4gICAgY29uc3QgcmVzdWx0ID0geyBhY3Rpb25Qcm9wczogc3RydWN0dXJlZENsb25lKGluaXRpYWwpIH07XG4gICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIHZhbHVlcykge1xuICAgICAgICBzZXRPYmplY3RQcm9wZXJ0eShyZXN1bHQsIFwiYWN0aW9uUHJvcHNcIiwgbmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBjb25zdCBhY3Rpb25Qcm9wcyA9IHJlc3VsdC5hY3Rpb25Qcm9wcztcbiAgICAvLyB2YWxpZGF0ZSBmdWxsQWN0aW9uTmFtZVxuICAgIGlmIChBcnJheS5pc0FycmF5KGFjdGlvblByb3BzKSkge1xuICAgICAgICBhY3Rpb25Qcm9wcy5mb3JFYWNoKChhY3Rpb25Qcm9wKSA9PiB7XG4gICAgICAgICAgICBpZiAoYWN0aW9uUHJvcC5mdWxsQWN0aW9uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW50ZXJuYWwgZXJyb3I6IGZ1bGxBY3Rpb25OYW1lIG1pc3NpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGFjdGlvblByb3BzLmZ1bGxBY3Rpb25OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludGVybmFsIGVycm9yOiBmdWxsQWN0aW9uTmFtZSBtaXNzaW5nXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhY3Rpb25Qcm9wcztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0cnVjdGlvblZhbHVlLmpzLm1hcCIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuaW1wb3J0IHsgUmVxdWVzdEFjdGlvbiwgZnJvbUpzb25BY3Rpb25zLCB9IGZyb20gXCIuLi9leHBsYW5hdGlvbi9yZXF1ZXN0QWN0aW9uLmpzXCI7XG5pbXBvcnQgeyBtYXRjaFBhcnRzIH0gZnJvbSBcIi4vY29uc3RydWN0aW9uTWF0Y2guanNcIjtcbmltcG9ydCB7IGNyZWF0ZVBhcnNlUGFydEZyb21KU09OLCB9IGZyb20gXCIuL3BhcnNlUGFydC5qc1wiO1xuaW1wb3J0IHsgTWF0Y2hQYXJ0LCB9IGZyb20gXCIuL21hdGNoUGFydC5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlQWN0aW9uUHJvcHMsIG1hdGNoZWRWYWx1ZXMsIH0gZnJvbSBcIi4vY29uc3RydWN0aW9uVmFsdWUuanNcIjtcbmZ1bmN0aW9uIGdldERlZmF1bHRUcmFuc2xhdG9yKHRyYW5zZm9ybU5hbWVzcGFjZXMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2Zvcm0odHJhbnNmb3JtSW5mbywgbWF0Y2hlZFRleHQsIGhpc3RvcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZWRUZXh0S2V5ID0gbWF0Y2hlZFRleHQuam9pbihcInxcIik7XG4gICAgICAgICAgICBjb25zdCB7IG5hbWVzcGFjZSwgdHJhbnNmb3JtTmFtZSB9ID0gdHJhbnNmb3JtSW5mbztcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1OYW1lc3BhY2VzXG4gICAgICAgICAgICAgICAgLmdldChuYW1lc3BhY2UpXG4gICAgICAgICAgICAgICAgPy5nZXQodHJhbnNmb3JtTmFtZSwgbWF0Y2hlZFRleHRLZXksIGhpc3RvcnkpO1xuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm1Db25mbGljdHModHJhbnNmb3JtSW5mbywgbWF0Y2hlZFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZWRUZXh0S2V5ID0gbWF0Y2hlZFRleHQuam9pbihcInxcIik7XG4gICAgICAgICAgICBjb25zdCB7IG5hbWVzcGFjZSwgdHJhbnNmb3JtTmFtZSB9ID0gdHJhbnNmb3JtSW5mbztcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1OYW1lc3BhY2VzXG4gICAgICAgICAgICAgICAgLmdldChuYW1lc3BhY2UpXG4gICAgICAgICAgICAgICAgPy5nZXRDb25mbGljdHModHJhbnNmb3JtTmFtZSwgbWF0Y2hlZFRleHRLZXkpO1xuICAgICAgICB9LFxuICAgICAgICBwYXJzZShwYXJzZVBhcnQsIG1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VQYXJ0LmNvbnZlcnRUb1ZhbHVlKG1hdGNoKTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuZXhwb3J0IGNsYXNzIENvbnN0cnVjdGlvbiB7XG4gICAgc3RhdGljIGNyZWF0ZShwYXJ0cywgdHJhbnNmb3JtTmFtZXNwYWNlcywgaW1wbGljaXRQYXJhbWV0ZXJzLCBpbXBsaWNpdEFjdGlvbk5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rpb24ocGFydHMsIHRyYW5zZm9ybU5hbWVzcGFjZXMsIGltcGxpY2l0UGFyYW1ldGVycywgaW1wbGljaXRBY3Rpb25OYW1lLCAtMSk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHBhcnRzLCB0cmFuc2Zvcm1OYW1lc3BhY2VzLCBpbXBsaWNpdFBhcmFtZXRlcnMsIGltcGxpY2l0QWN0aW9uTmFtZSwgaWQpIHtcbiAgICAgICAgdGhpcy5wYXJ0cyA9IHBhcnRzO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybU5hbWVzcGFjZXMgPSB0cmFuc2Zvcm1OYW1lc3BhY2VzO1xuICAgICAgICB0aGlzLmltcGxpY2l0UGFyYW1ldGVycyA9IGltcGxpY2l0UGFyYW1ldGVycztcbiAgICAgICAgdGhpcy5pbXBsaWNpdEFjdGlvbk5hbWUgPSBpbXBsaWNpdEFjdGlvbk5hbWU7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgaWYgKHBhcnRzLmV2ZXJ5KChwKSA9PiBwLm9wdGlvbmFsKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uc3RydWN0aW9uIG11c3QgaGF2ZSBvbmUgbm9uLW9wdGlvbmFsIHBhcnRcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGltcGxpY2l0UGFyYW1ldGVyQ291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltcGxpY2l0UGFyYW1ldGVycyA/IHRoaXMuaW1wbGljaXRQYXJhbWV0ZXJzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIG1hdGNoKHJlcXVlc3QsIGNvbmZpZykge1xuICAgICAgICBjb25zdCBtYXRjaGVkVmFsdWVzID0gbWF0Y2hQYXJ0cyhyZXF1ZXN0LCB0aGlzLnBhcnRzLCBjb25maWcsIGdldERlZmF1bHRUcmFuc2xhdG9yKHRoaXMudHJhbnNmb3JtTmFtZXNwYWNlcykpO1xuICAgICAgICBpZiAobWF0Y2hlZFZhbHVlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb2xsZWN0SW1wbGljaXRQcm9wZXJ0aWVzKG1hdGNoZWRWYWx1ZXMudmFsdWVzKTtcbiAgICAgICAgY29uc3QgYWN0aW9uUHJvcHMgPSBjcmVhdGVBY3Rpb25Qcm9wcyhtYXRjaGVkVmFsdWVzLnZhbHVlcyk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0aW9uOiB0aGlzLFxuICAgICAgICAgICAgICAgIG1hdGNoOiBuZXcgUmVxdWVzdEFjdGlvbihyZXF1ZXN0LCBmcm9tSnNvbkFjdGlvbnMoYWN0aW9uUHJvcHMpLCBjb25maWcuaGlzdG9yeSksXG4gICAgICAgICAgICAgICAgY29uZmxpY3RWYWx1ZXM6IG1hdGNoZWRWYWx1ZXMuY29uZmxpY3RWYWx1ZXMsXG4gICAgICAgICAgICAgICAgbWF0Y2hlZENvdW50OiBtYXRjaGVkVmFsdWVzLm1hdGNoZWRDb3VudCxcbiAgICAgICAgICAgICAgICB3aWxkY2FyZENoYXJDb3VudDogbWF0Y2hlZFZhbHVlcy53aWxkY2FyZENoYXJDb3VudCxcbiAgICAgICAgICAgICAgICBub25PcHRpb25hbENvdW50OiB0aGlzLnBhcnRzLmZpbHRlcigocCkgPT4gIXAub3B0aW9uYWwpLmxlbmd0aCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG4gICAgfVxuICAgIGdldE1hdGNoZWRWYWx1ZXMobWF0Y2hlZCwgY29uZmlnLCBtYXRjaFZhbHVlVHJhbnNsYXRvcikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBtYXRjaGVkVmFsdWVzKHRoaXMucGFydHMsIG1hdGNoZWQsIGNvbmZpZywgbWF0Y2hWYWx1ZVRyYW5zbGF0b3IpO1xuICAgICAgICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb2xsZWN0SW1wbGljaXRQcm9wZXJ0aWVzKHJlc3VsdC52YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBjb2xsZWN0SW1wbGljaXRQcm9wZXJ0aWVzKHZhbHVlcykge1xuICAgICAgICBpZiAodGhpcy5pbXBsaWNpdFBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaW1wbGljaXQgb2YgdGhpcy5pbXBsaWNpdFBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaChbaW1wbGljaXQucGFyYW1OYW1lLCBpbXBsaWNpdC5wYXJhbVZhbHVlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9TdHJpbmcodmVyYm9zZSA9IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLnBhcnRzLm1hcCgocCkgPT4gcC50b1N0cmluZyh2ZXJib3NlKSkuam9pbihcIlwiKX0ke3RoaXMuaW1wbGljaXRQYXJhbWV0ZXJDb3VudCAhPT0gMFxuICAgICAgICAgICAgPyBgWyR7dGhpcy5pbXBsaWNpdFBhcmFtZXRlcnNcbiAgICAgICAgICAgICAgICA/Lm1hcCgocCkgPT4gYCR7cC5wYXJhbU5hbWV9PSR7cC5wYXJhbVZhbHVlfWApXG4gICAgICAgICAgICAgICAgLmpvaW4oXCJdW1wiKX1dYFxuICAgICAgICAgICAgOiBcIlwifSR7dGhpcy5pbXBsaWNpdEFjdGlvbk5hbWVcbiAgICAgICAgICAgID8gYFthY3Rpb25OYW1lPSR7dGhpcy5pbXBsaWNpdEFjdGlvbk5hbWV9XWBcbiAgICAgICAgICAgIDogXCJcIn1gO1xuICAgIH1cbiAgICBpc1N1cGVyc2V0T2Yob3RoZXJzLCBpbXBsaWNpdFBhcmFtZXRlcnMpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIG90aGVycykge1xuICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICB3aGlsZSAoaW5kZXggPCB0aGlzLnBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChlLmVxdWFscyh0aGlzLnBhcnRzW2luZGV4XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRzW2luZGV4XS5vcHRpb25hbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGN1cnIgPSBpbmRleDsgY3VyciA8IHRoaXMucGFydHMubGVuZ3RoOyBjdXJyKyspIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0c1tjdXJyXS5vcHRpb25hbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBpbXBsaWNpdFBhcmFtZXRlcnNcbiAgICAgICAgY29uc3Qgb3RoZXJMZW5ndGggPSBpbXBsaWNpdFBhcmFtZXRlcnMgPyBpbXBsaWNpdFBhcmFtZXRlcnMubGVuZ3RoIDogMDtcbiAgICAgICAgY29uc3QgdGhpc0xlbmd0aCA9IHRoaXMuaW1wbGljaXRQYXJhbWV0ZXJzXG4gICAgICAgICAgICA/IHRoaXMuaW1wbGljaXRQYXJhbWV0ZXJzLmxlbmd0aFxuICAgICAgICAgICAgOiAwO1xuICAgICAgICBpZiAodGhpc0xlbmd0aCAhPT0gb3RoZXJMZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpc0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3RoZXJTb3J0ZWQgPSBpbXBsaWNpdFBhcmFtZXRlcnMuc29ydCgoYSwgYikgPT4gYS5wYXJhbU5hbWUubG9jYWxlQ29tcGFyZShiLnBhcmFtTmFtZSkpO1xuICAgICAgICBjb25zdCB0aGlzU29ydGVkID0gdGhpcy5pbXBsaWNpdFBhcmFtZXRlcnMuc29ydCgoYSwgYikgPT4gYS5wYXJhbU5hbWUubG9jYWxlQ29tcGFyZShiLnBhcmFtTmFtZSkpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKG90aGVyU29ydGVkW2ldLnBhcmFtTmFtZSAhPT0gdGhpc1NvcnRlZFtpXS5wYXJhbU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3RoZXJTb3J0ZWRbaV0ucGFyYW1WYWx1ZSAhPT0gdGhpc1NvcnRlZFtpXS5wYXJhbVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbUpTT04oY29uc3RydWN0aW9uLCBhbGxNYXRjaFNldHMsIHRyYW5zZm9ybU5hbWVzcGFjZXMsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0aW9uKGNvbnN0cnVjdGlvbi5wYXJ0cy5tYXAoKHBhcnQpID0+IHtcbiAgICAgICAgICAgIGlmIChpc1BhcnNlUGFydEpTT04ocGFydCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUGFyc2VQYXJ0RnJvbUpTT04ocGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtYXRjaFNldCA9IGFsbE1hdGNoU2V0cy5nZXQocGFydC5tYXRjaFNldCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hTZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgTWF0Y2hTZXQgJHtwYXJ0Lm1hdGNoU2V0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXRjaFBhcnQobWF0Y2hTZXQsIHBhcnQub3B0aW9uYWwgPz8gZmFsc2UsIHBhcnQud2lsZGNhcmRNb2RlID8/IDAgLyogV2lsZGNhcmRNb2RlLkRpc2FibGVkICovLCBwYXJ0LnRyYW5zZm9ybUluZm9zKTtcbiAgICAgICAgfSksIHRyYW5zZm9ybU5hbWVzcGFjZXMsIGNvbnN0cnVjdGlvbi5pbXBsaWNpdFBhcmFtZXRlcnMsIGNvbnN0cnVjdGlvbi5pbXBsaWNpdEFjdGlvbk5hbWUsIGluZGV4KTtcbiAgICB9XG4gICAgdG9KU09OKCkge1xuICAgICAgICAvLyBOT1RFOiB0cmFuc2Zvcm0gbmVlZHMgdG8gYmUgc2F2ZWQgc2VwYXJhdGVseSwgYXMgdGhleSBhcmUgY3VycmVudGx5IGdsb2JhbCB3aGVuIHRoZSBjb25zdHJ1Y3Rpb24gaXMgaW4gYSBjYWNoZS5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhcnRzOiB0aGlzLnBhcnRzLFxuICAgICAgICAgICAgaW1wbGljaXRQYXJhbWV0ZXJzOiB0aGlzLmltcGxpY2l0UGFyYW1ldGVycz8ubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICA6IHRoaXMuaW1wbGljaXRQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgaW1wbGljaXRBY3Rpb25OYW1lOiB0aGlzLmltcGxpY2l0QWN0aW9uTmFtZSxcbiAgICAgICAgfTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc1BhcnNlUGFydEpTT04ocGFydCkge1xuICAgIHJldHVybiBwYXJ0LnBhcnNlck5hbWUgIT09IHVuZGVmaW5lZDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0Q29uc3RydWN0aW9uVjJUb1YzKGNvbnN0cnVjdGlvbnMsIG1hdGNoU2V0VG9UcmFuc2Zvcm1JbmZvKSB7XG4gICAgZm9yIChjb25zdCBjb25zdHJ1Y3Rpb24gb2YgY29uc3RydWN0aW9ucykge1xuICAgICAgICBjb25zdHJ1Y3Rpb24ucGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzUGFyc2VQYXJ0SlNPTihwYXJ0KSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlUGFydCBpcyBub3Qgc3VwcG9ydGVkIGluIFYyXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtSW5mb3MgPSBtYXRjaFNldFRvVHJhbnNmb3JtSW5mby5nZXQocGFydC5tYXRjaFNldCk7XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtSW5mb3MpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LnRyYW5zZm9ybUluZm9zID0gdHJhbnNmb3JtSW5mb3M7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0cnVjdGlvbnMuanMubWFwIiwiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5pbXBvcnQgeyBlc2NhcGVNYXRjaCB9IGZyb20gXCIuLi91dGlscy9yZWdleHAuanNcIjtcbmV4cG9ydCBmdW5jdGlvbiB0b1RyYW5zZm9ybUluZm9LZXkodHJhbnNmb3JtSW5mbykge1xuICAgIHJldHVybiBgJHt0cmFuc2Zvcm1JbmZvLm5hbWVzcGFjZX06OiR7dHJhbnNmb3JtSW5mby5hY3Rpb25JbmRleCA/IGAke3RyYW5zZm9ybUluZm8uYWN0aW9uSW5kZXh9Ln1gIDogXCJcIn0ke3RyYW5zZm9ybUluZm8udHJhbnNmb3JtTmFtZX1gO1xufVxuZnVuY3Rpb24gdG9UcmFuc2Zvcm1JbmZvc0tleSh0cmFuc2Zvcm1JbmZvcykge1xuICAgIHJldHVybiB0cmFuc2Zvcm1JbmZvcz8ubWFwKHRvVHJhbnNmb3JtSW5mb0tleSkuc29ydCgpLmpvaW4oXCIsXCIpO1xufVxuZnVuY3Rpb24gZ2V0TWF0Y2hTZXROYW1lc3BhY2UodHJhbnNmb3JtSW5mb3MpIHtcbiAgICAvLyBTaW5jZSB0aGUgbWF0Y2hzZXQgbmVlZHMgdG8gZ3JvdyBhbG9uZyB3aXRoIHRoZSBhdmFpbGFibGUgdHJhbnNmb3JtLCB3ZSBuZWVkIHRvIHVzZSB0aGUgc2FtZVxuICAgIC8vIG5hbWVzcGFjZSBzY2hlbWEsIHdoaWNoIGlzIHRoZSB0cmFuc2Zvcm0gbmFtZXNwYWNlIGRldGVybWluZWQgd2hlbiB0aGUgY29uc3RydWN0aW9uIGlzIGNyZWF0ZWQuXG4gICAgLy8gQ3VycmVudGx5IHRoZSB0cmFuc2Zvcm0gbmFtZXNwYWNlIGlzIDx0cmFuc2xhdG9yTmFtZT4gb3IgPHRyYW5zbGF0b3JOYW1lPi48YWN0aW9uTmFtZT4gZGVwZW5kaW5nIG9uIHRoZSBTY2hlbWFDb25maWdcbiAgICAvLyBTZWUgYGdldE5hbWVzcGFjZUZvckNhY2hlYCBpbiBzY2hlbWFDb25maWcudHNcbiAgICAvLyBGbGF0dGVuaW5nIHRoZSBwYWlyIHVzaW5nIDo6IGFzIHRoZSBzZXBhcmF0b3IsIGFuZCBzb3J0IHRoZW0gc28gdGhhdCBpdCBpcyBzdGFibGUgZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25cbiAgICByZXR1cm4gdHJhbnNmb3JtSW5mb3NcbiAgICAgICAgPy5tYXAoKHQpID0+IGAke3QubmFtZXNwYWNlfTo6JHt0LnRyYW5zZm9ybU5hbWV9YClcbiAgICAgICAgLnNvcnQoKSAvLyBzb3J0IGl0IHNvIHRoYXQgaXQgaXMgc3RhYmxlXG4gICAgICAgIC5qb2luKFwiLFwiKTtcbn1cbi8qKlxuICogTWF0Y2hTZXRcbiAqXG4gKiBNZXJnZSBwb2xpY3k6XG4gKiAtIElmIGNhbkJlTWVyZ2VkIGlzIGZhbHNlLCBpdCB3aWxsIG5ldmVyIGJlIHN1YnN0aXR1dGVkIHdpdGggb3RoZXIgbWF0Y2hzZXQgdW5sZXNzIGl0IGlzIGFuIGV4YWN0IG1hdGNoLlxuICogLSBJZiBjYW5CZU1lcmdlZCBpcyB0cnVlLCBpdCB3aWxsIGJlIG1lcmdlZCB3aXRoIG90aGVyIG1hdGNoIHNldCB3aXRoIHRoZSBzYW1lIG5hbWUgQU5EIHRyYW5zZm9ybUluZm8gaWYgYW55XG4gKlxuICogU2VlIG1lcmdlZFVpZCBhbmQgdW5tZXJnZWRVaWQgZm9yIHRoZSBsb29rIHVwIGtleSBmb3IgdGhlbVxuICpcbiAqIEFkZGl0aW9uYWxseSwgbWVyZ2UgY2FuIGJlIGVuYWJsZWQvZGlzYWJsZWQgdmlhIGEgZmxhZyB3aGVuIGNvbnN0cnVjdGlvbiBpcyBhZGRlZCB0byB0aGUgY2FjaGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRjaFNldCB7XG4gICAgY29uc3RydWN0b3IobWF0Y2hlcywgbmFtZSwgLy8gbm90ZTogY2hhcmFjdGVycyBcIl9cIiwgXCIsXCIsIFwifFwiLCBcIjpcIiBhcmUgcmVzZXJ2ZWQgZm9yIGludGVybmFsIHVzZVxuICAgIGNhbkJlTWVyZ2VkLCBuYW1lc3BhY2UsIGluZGV4ID0gLTEpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jYW5CZU1lcmdlZCA9IGNhbkJlTWVyZ2VkO1xuICAgICAgICB0aGlzLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgICAgICAvLyBDYXNlIGluc2Vuc2l0aXZlIG1hdGNoXG4gICAgICAgIC8vIFRPRE86IG5vbi1kaWFjcml0aWMgbWF0Y2hcbiAgICAgICAgdGhpcy5tYXRjaGVzID0gbmV3IFNldChBcnJheS5mcm9tKG1hdGNoZXMpLm1hcCgobSkgPT4gbS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgfVxuICAgIGdldCBmdWxsTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMubmFtZX0ke3RoaXMuaW5kZXggIT09IC0xID8gYF8ke3RoaXMuaW5kZXh9YCA6IFwiXCJ9YDtcbiAgICB9XG4gICAgZ2V0IG1lcmdlZFVpZCgpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMubmFtZX0ke3RoaXMubmFtZXNwYWNlID8gYCwke3RoaXMubmFtZXNwYWNlfWAgOiBcIlwifWA7XG4gICAgfVxuICAgIGdldCB1bm1lcmdlZFVpZCgpIHtcbiAgICAgICAgLy8gVXNlIHRoZSBzdGF0aWMgc2V0IG9mIG1hdGNoIHNldCBzdHJpbmdzIHRvIGVuc3VyZSBvbmx5IGV4YWN0IG1hdGNoIHdpbGwgYmUgcmV1c2VkXG4gICAgICAgIHJldHVybiBgJHt0aGlzLm1lcmdlZFVpZH0sJHt0aGlzLm1hdGNoU2V0U3RyaW5nfWA7XG4gICAgfVxuICAgIGdldCBtYXRjaFNldFN0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5tYXRjaGVzKS5zb3J0KCkuam9pbihcInxcIik7XG4gICAgfVxuICAgIGdldCByZWdleFBhcnQoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubWF0Y2hlcylcbiAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKSAvLyBNYXRjaCBsb25nZXN0IGZpcnN0XG4gICAgICAgICAgICAubWFwKChtKSA9PiBlc2NhcGVNYXRjaChtKSlcbiAgICAgICAgICAgIC5qb2luKFwifFwiKTtcbiAgICB9XG4gICAgZ2V0IHJlZ0V4cCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlZ0V4cCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWdFeHAgPSBuZXcgUmVnRXhwKGAoPzoke3RoaXMucmVnZXhQYXJ0fSlgLCBcIml1eVwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcmVnRXhwO1xuICAgIH1cbiAgICBmb3JjZVJlZ2V4cCgpIHtcbiAgICAgICAgY29uc3QgcmVnRXhwID0gdGhpcy5yZWdFeHA7XG4gICAgICAgIHJlZ0V4cC5leGVjKFwiXCIpO1xuICAgICAgICByZWdFeHAuZXhlYyhcIlwiKTtcbiAgICAgICAgcmVnRXhwLmV4ZWMoXCJcIik7XG4gICAgICAgIHJlZ0V4cC5leGVjKFwiXCIpO1xuICAgICAgICByZWdFeHAuZXhlYyhcIlwiKTtcbiAgICB9XG4gICAgY2xlYXJSZWdleHAoKSB7XG4gICAgICAgIHRoaXMuX3JlZ0V4cCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY2xvbmUoY2FuQmVNZXJnZWQsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0Y2hTZXQodGhpcy5tYXRjaGVzLCB0aGlzLm5hbWUsIGNhbkJlTWVyZ2VkLCB0aGlzLm5hbWVzcGFjZSwgaW5kZXgpO1xuICAgIH1cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtYXRjaGVzOiBBcnJheS5mcm9tKHRoaXMubWF0Y2hlcyksXG4gICAgICAgICAgICBiYXNlbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSxcbiAgICAgICAgICAgIGNhbkJlTWVyZ2VkOiB0aGlzLmNhbkJlTWVyZ2VkLFxuICAgICAgICAgICAgaW5kZXg6IHRoaXMuaW5kZXgsXG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE1hdGNoUGFydCB7XG4gICAgY29uc3RydWN0b3IobWF0Y2hTZXQsIG9wdGlvbmFsLCB3aWxkY2FyZE1vZGUsIHRyYW5zZm9ybUluZm9zKSB7XG4gICAgICAgIHRoaXMubWF0Y2hTZXQgPSBtYXRjaFNldDtcbiAgICAgICAgdGhpcy5vcHRpb25hbCA9IG9wdGlvbmFsO1xuICAgICAgICB0aGlzLndpbGRjYXJkTW9kZSA9IHdpbGRjYXJkTW9kZTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1JbmZvcyA9IHRyYW5zZm9ybUluZm9zO1xuICAgIH1cbiAgICBnZXQgY2FwdHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtSW5mb3MgIT09IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZ2V0IHJlZ0V4cCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hTZXQucmVnRXhwO1xuICAgIH1cbiAgICB0b1N0cmluZyh2ZXJib3NlID0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIChgPCR7dmVyYm9zZSA/IHRoaXMubWF0Y2hTZXQuZnVsbE5hbWUgOiB0aGlzLm1hdGNoU2V0Lm5hbWV9PmAgK1xuICAgICAgICAgICAgKHRoaXMub3B0aW9uYWwgPyBcIj9cIiA6IFwiXCIpKTtcbiAgICB9XG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF0Y2hTZXQ6IHRoaXMubWF0Y2hTZXQuZnVsbE5hbWUsXG4gICAgICAgICAgICBvcHRpb25hbDogdGhpcy5vcHRpb25hbCA/IHRydWUgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB3aWxkY2FyZE1vZGU6IHRoaXMud2lsZGNhcmRNb2RlICE9PSAwIC8qIFdpbGRjYXJkTW9kZS5EaXNhYmxlZCAqL1xuICAgICAgICAgICAgICAgID8gdGhpcy53aWxkY2FyZE1vZGVcbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRyYW5zZm9ybUluZm9zOiB0aGlzLnRyYW5zZm9ybUluZm9zLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBlcXVhbHMoZSkge1xuICAgICAgICByZXR1cm4gKGlzTWF0Y2hQYXJ0KGUpICYmXG4gICAgICAgICAgICBlLm1hdGNoU2V0ID09PSB0aGlzLm1hdGNoU2V0ICYmXG4gICAgICAgICAgICBlLm9wdGlvbmFsID09PSB0aGlzLm9wdGlvbmFsICYmXG4gICAgICAgICAgICBlLndpbGRjYXJkTW9kZSA9PT0gdGhpcy53aWxkY2FyZE1vZGUgJiZcbiAgICAgICAgICAgIHRvVHJhbnNmb3JtSW5mb3NLZXkoZS50cmFuc2Zvcm1JbmZvcykgPT09XG4gICAgICAgICAgICAgICAgdG9UcmFuc2Zvcm1JbmZvc0tleSh0aGlzLnRyYW5zZm9ybUluZm9zKSk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hdGNoUGFydChtYXRjaGVzLCBuYW1lLCBvcHRpb25zKSB7XG4gICAgY29uc3QgY2FuQmVNZXJnZWQgPSBvcHRpb25zPy5jYW5CZU1lcmdlZCA/PyB0cnVlO1xuICAgIGNvbnN0IG9wdGlvbmFsID0gb3B0aW9ucz8ub3B0aW9uYWwgPz8gZmFsc2U7XG4gICAgY29uc3Qgd2lsZGNhcmRNb2RlID0gb3B0aW9ucz8ud2lsZGNhcmRNb2RlID8/IDAgLyogV2lsZGNhcmRNb2RlLkRpc2FibGVkICovO1xuICAgIGNvbnN0IHRyYW5zZm9ybUluZm9zID0gb3B0aW9ucz8udHJhbnNmb3JtSW5mb3M7XG4gICAgLy8gRXJyb3IgY2hlY2tpbmdcbiAgICBpZiAod2lsZGNhcmRNb2RlICYmIHRyYW5zZm9ybUluZm9zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2lsZGNhcmQgcGFydCBtdXN0IGJlIGNhcHR1cmVkXCIpO1xuICAgIH1cbiAgICBpZiAob3B0aW9uYWwgJiYgdHJhbnNmb3JtSW5mb3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcHRpb25hbCBwYXJ0IGNhbm5vdCBiZSBjYXB0dXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKG1hdGNoZXMuc29tZSgobSkgPT4gbSA9PT0gXCJcIikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW1wdHkgbWF0Y2ggaXMgbm90IGFsbG93ZWRcIik7XG4gICAgfVxuICAgIC8vIEFkZCBhbGwgdGhlIHRyYW5zZm9ybSBuYW1lc3BhY2UgYW5kIHRyYW5zZm9ybU5hbWUgdG8gdGhlIG1hdGNoIG5hbWVzcGFjZVxuICAgIC8vIHNvIHRoYXQgbWF0Y2hlcyB3aWxsIGhhdmUgY29ycmVzcG9uZGluZyBlbnRyeSBpbiB0aGUgdHJhbnNmb3Jtc1xuICAgIGNvbnN0IG1hdGNoU2V0TmFtZXNwYWNlID0gZ2V0TWF0Y2hTZXROYW1lc3BhY2UodHJhbnNmb3JtSW5mb3MpO1xuICAgIGNvbnN0IG1hdGNoU2V0ID0gbmV3IE1hdGNoU2V0KG1hdGNoZXMsIG5hbWUsIGNhbkJlTWVyZ2VkLCBtYXRjaFNldE5hbWVzcGFjZSk7XG4gICAgcmV0dXJuIG5ldyBNYXRjaFBhcnQobWF0Y2hTZXQsIG9wdGlvbmFsLCB3aWxkY2FyZE1vZGUsIHRyYW5zZm9ybUluZm9zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc01hdGNoUGFydChwYXJ0KSB7XG4gICAgcmV0dXJuIHBhcnQuaGFzT3duUHJvcGVydHkoXCJtYXRjaFNldFwiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0TWF0Y2hTZXRWMlRvVjMobWF0Y2hTZXRzVjIpIHtcbiAgICBjb25zdCBtYXRjaFNldHMgPSBbXTtcbiAgICBjb25zdCBtYXRjaFNldFRvVHJhbnNmb3JtSW5mbyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IG1hdGNoU2V0IG9mIG1hdGNoU2V0c1YyKSB7XG4gICAgICAgIGxldCBuYW1lc3BhY2U7XG4gICAgICAgIGNvbnN0IG9sZFRyYW5zZm9ybUluZm8gPSBtYXRjaFNldC50cmFuc2Zvcm1JbmZvO1xuICAgICAgICBpZiAob2xkVHJhbnNmb3JtSW5mbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1JbmZvID0gb2xkVHJhbnNmb3JtSW5mby50cmFuc2Zvcm1OYW1lcy5tYXAoKHRyYW5zZm9ybU5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IG9sZFRyYW5zZm9ybUluZm8udHJhbnNsYXRvck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybU5hbWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hTZXROYW1lID0gYCR7bWF0Y2hTZXQuYmFzZW5hbWV9JHttYXRjaFNldC5pbmRleCAhPT0gLTEgPyBgXyR7bWF0Y2hTZXQuaW5kZXh9YCA6IFwiXCJ9YDtcbiAgICAgICAgICAgIG1hdGNoU2V0VG9UcmFuc2Zvcm1JbmZvLnNldChtYXRjaFNldE5hbWUsIHRyYW5zZm9ybUluZm8pO1xuICAgICAgICAgICAgbmFtZXNwYWNlID0gZ2V0TWF0Y2hTZXROYW1lc3BhY2UodHJhbnNmb3JtSW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgbWF0Y2hTZXRzLnB1c2goe1xuICAgICAgICAgICAgbWF0Y2hlczogbWF0Y2hTZXQubWF0Y2hlcyxcbiAgICAgICAgICAgIGJhc2VuYW1lOiBtYXRjaFNldC5iYXNlbmFtZSxcbiAgICAgICAgICAgIG5hbWVzcGFjZSxcbiAgICAgICAgICAgIGNhbkJlTWVyZ2VkOiBtYXRjaFNldC5jYW5CZU1lcmdlZCxcbiAgICAgICAgICAgIGluZGV4OiBtYXRjaFNldC5pbmRleCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7IG1hdGNoU2V0cywgbWF0Y2hTZXRUb1RyYW5zZm9ybUluZm8gfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hdGNoUGFydC5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbmltcG9ydCB7IGlzTWF0Y2hQYXJ0IH0gZnJvbSBcIi4vbWF0Y2hQYXJ0LmpzXCI7XG5pbXBvcnQgeyBnZXRQcm9wZXJ0eVBhcnNlciB9IGZyb20gXCIuL3Byb3BlcnR5UGFyc2VyLmpzXCI7XG5leHBvcnQgY2xhc3MgUGFyc2VQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eU5hbWUsIHBhcnNlcikge1xuICAgICAgICB0aGlzLnByb3BlcnR5TmFtZSA9IHByb3BlcnR5TmFtZTtcbiAgICAgICAgdGhpcy5wYXJzZXIgPSBwYXJzZXI7XG4gICAgfVxuICAgIGdldCB3aWxkY2FyZE1vZGUoKSB7XG4gICAgICAgIHJldHVybiAwIC8qIFdpbGRjYXJkTW9kZS5EaXNhYmxlZCAqLztcbiAgICB9XG4gICAgZ2V0IGNhcHR1cmUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBnZXQgcmVnRXhwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZXIucmVnRXhwO1xuICAgIH1cbiAgICBnZXQgb3B0aW9uYWwoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29udmVydFRvVmFsdWUobWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VyLmNvbnZlcnRUb1ZhbHVlKG1hdGNoKTtcbiAgICB9XG4gICAgZXF1YWxzKGUpIHtcbiAgICAgICAgcmV0dXJuIChpc1BhcnNlUGFydChlKSAmJlxuICAgICAgICAgICAgZS5wcm9wZXJ0eU5hbWUgPT09IHRoaXMucHJvcGVydHlOYW1lICYmXG4gICAgICAgICAgICBlLnBhcnNlciA9PT0gdGhpcy5wYXJzZXIpO1xuICAgIH1cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcm9wZXJ0eU5hbWU6IHRoaXMucHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgcGFyc2VyTmFtZTogdGhpcy5wYXJzZXIubmFtZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdG9TdHJpbmcodmVyYm9zZSA9IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBgPFA6JHt0aGlzLnBhcnNlci5uYW1lfSR7dmVyYm9zZSA/IGA9JHt0aGlzLnByb3BlcnR5TmFtZX1gIDogXCJcIn0+YDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGFyc2VQYXJ0KHByb3BlcnR5TmFtZSwgcGFyc2VyKSB7XG4gICAgcmV0dXJuIG5ldyBQYXJzZVBhcnQocHJvcGVydHlOYW1lLCBwYXJzZXIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhcnNlUGFydEZyb21KU09OKGpzb24pIHtcbiAgICBjb25zdCBwYXJzZXIgPSBnZXRQcm9wZXJ0eVBhcnNlcihqc29uLnBhcnNlck5hbWUpO1xuICAgIGlmIChwYXJzZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZXNvbHZlIHByb3BlcnR5IHBhcnNlciAke2pzb24ucGFyc2VyTmFtZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVBhcnNlUGFydChqc29uLnByb3BlcnR5TmFtZSwgcGFyc2VyKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcnNlUGFydChwYXJ0KSB7XG4gICAgcmV0dXJuICFpc01hdGNoUGFydChwYXJ0KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnNlUGFydC5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbmNvbnN0IHByb3BlcnR5UGFyc2VycyA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6IFwibnVtYmVyXCIsXG4gICAgICAgIHZhbHVlVHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgcmVnRXhwOiAvLT9cXGQrL3ksXG4gICAgICAgIGNvbnZlcnRUb1ZhbHVlOiAoc3RyKSA9PiBwYXJzZUludChzdHIpLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInBlcmNlbnRhZ2VcIixcbiAgICAgICAgdmFsdWVUeXBlOiBcIm51bWJlclwiLFxuICAgICAgICByZWdFeHA6IC8tP1xcZCslL3ksXG4gICAgICAgIGNvbnZlcnRUb1ZhbHVlOiAoc3RyKSA9PiBwYXJzZUludChzdHIpLFxuICAgIH0sXG5dO1xuY29uc3QgcHJvcGVydHlQYXJzZXJNYXAgPSBuZXcgTWFwKHByb3BlcnR5UGFyc2Vycy5tYXAoKHApID0+IFtwLm5hbWUsIHBdKSk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcGVydHlQYXJzZXIobmFtZSkge1xuICAgIHJldHVybiBwcm9wZXJ0eVBhcnNlck1hcC5nZXQobmFtZSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm9wZXJ0eVBhcnNlci5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbmltcG9ydCB7IGVxdWFsTm9ybWFsaXplZFBhcmFtVmFsdWUsIG5vcm1hbGl6ZVBhcmFtU3RyaW5nLCBub3JtYWxpemVQYXJhbVZhbHVlLCB9IGZyb20gXCIuLi9leHBsYW5hdGlvbi9yZXF1ZXN0QWN0aW9uLmpzXCI7XG5pbXBvcnQgcmVnaXN0ZXJEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcbmNvbnN0IGRlYnVnQ29uc3RDb25mbGljdCA9IHJlZ2lzdGVyRGVidWcoXCJ0eXBlYWdlbnQ6Y29uc3Q6Y29uZmxpY3RcIik7XG5mdW5jdGlvbiBpc1RyYW5zZm9ybUVudGl0eVJlY29yZChyZWNvcmQpIHtcbiAgICByZXR1cm4gcmVjb3JkLmVudGl0eVR5cGVzICE9PSB1bmRlZmluZWQ7XG59XG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtcyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIHBhcmFtTmFtZSAtPiAodGV4dCAtPiB2YWx1ZSlcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1zID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBhZGQocGFyYW1OYW1lLCB0ZXh0LCB2YWx1ZSwgb3JpZ2luYWwpIHtcbiAgICAgICAgbGV0IG1hcCA9IHRoaXMudHJhbnNmb3Jtcy5nZXQocGFyYW1OYW1lKTtcbiAgICAgICAgaWYgKG1hcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybXMuc2V0KHBhcmFtTmFtZSwgbWFwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYXNlIGluc2Vuc2l0aXZlL25vbi1kaWFjcml0aWMgbWF0Y2hcbiAgICAgICAgLy8gVXNlIHRoZSBjb3VudCBvdCBoZXVyaXN0aWMgdG8gcHJlZmVyIHZhbHVlcyBvcmlnaW5hbCB0byB1c2VyIHJlcXVlc3RcbiAgICAgICAgLy8gYW5kIG5vdCBmcm9tIGEgc3lub255bSBvciBhbHRlcm5hdGl2ZSBzdWdnZXN0ZWQgYnkgR1BUXG4gICAgICAgIHRoaXMuYWRkVHJhbnNmb3JtUmVjb3JkKG1hcCwgbm9ybWFsaXplUGFyYW1TdHJpbmcodGV4dCksIHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgY291bnQ6IG9yaWdpbmFsID8gMSA6IDAsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhZGRFbnRpdHkocGFyYW1OYW1lLCB0ZXh0LCBlbnRpdHlUeXBlcykge1xuICAgICAgICBsZXQgbWFwID0gdGhpcy50cmFuc2Zvcm1zLmdldChwYXJhbU5hbWUpO1xuICAgICAgICBpZiAobWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3Jtcy5zZXQocGFyYW1OYW1lLCBtYXApO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhc2UgaW5zZW5zaXRpdmUvbm9uLWRpYWNyaXRpYyBtYXRjaFxuICAgICAgICB0aGlzLmFkZFRyYW5zZm9ybVJlY29yZChtYXAsIG5vcm1hbGl6ZVBhcmFtU3RyaW5nKHRleHQpLCB7XG4gICAgICAgICAgICBlbnRpdHlUeXBlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFkZFRyYW5zZm9ybVJlY29yZChtYXAsIHRleHQsIHZhbHVlLCBjbG9uZSwgY2FjaGVDb25mbGljdHMpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdWYWx1ZSA9IG1hcC5nZXQodGV4dCk7XG4gICAgICAgIC8vIFJFVklFVzogaG93IGRvIHdlIGRlYWwgd2l0aCBjb25mbGljdCB0cmFuc2Zvcm1zP1xuICAgICAgICBpZiAoZXhpc3RpbmdWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNUcmFuc2Zvcm1FbnRpdHlSZWNvcmQoZXhpc3RpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBIZXVyaXN0aWMgdG8gcHJlZmVyIGVudGl0eSB0eXBlIG92ZXIgdmFsdWVcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzVHJhbnNmb3JtRW50aXR5UmVjb3JkKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmIChjYWNoZUNvbmZsaWN0cykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub3JtQ29uZmxpY3RWYWx1ZSA9IG5vcm1hbGl6ZVBhcmFtVmFsdWUodmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub3JtRXhpc3RpbmdWYWx1ZSA9IG5vcm1hbGl6ZVBhcmFtVmFsdWUoZXhpc3RpbmdWYWx1ZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3JtQ29uZmxpY3RWYWx1ZSA9PT0gbm9ybUV4aXN0aW5nVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nVmFsdWUuY291bnQgKz0gdmFsdWUuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGNvbmZsaWN0IGlmIGl0IGlzIGVuYWJsZWQuXG4gICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZ0NvbmZsaWN0Q291bnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1ZhbHVlLmNvbmZsaWN0cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBjb25mbGljdCBtYXAgd2l0aCB0aGUgZXhpc3RpbmcgdmFsdWUuXG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1ZhbHVlLmNvbmZsaWN0cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nQ29uZmxpY3RDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0NvbnN0Q29uZmxpY3QodGV4dCwgZXhpc3RpbmdWYWx1ZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ0NvbmZsaWN0Q291bnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nVmFsdWUuY29uZmxpY3RzLmdldChub3JtQ29uZmxpY3RWYWx1ZSkgPz8gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGNvbmZsaWN0IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1Z0NvbnN0Q29uZmxpY3QuZW5hYmxlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdDb25mbGljdENvdW50ID09PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhZXhpc3RpbmdWYWx1ZS5jb25mbGljdHMuaGFzKG5vcm1Db25mbGljdFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdDb25zdENvbmZsaWN0KHRleHQsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ0NvbmZsaWN0Q291bnQgKz0gdmFsdWUuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN3aXRjaCB0aGUgdmFsdWUgaW4gdXNlIGlmIHRoZSBjb3VudCBpcyBoaWdoZXJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nVmFsdWUuY291bnQgPD0gZXhpc3RpbmdDb25mbGljdENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1ZhbHVlLmNvbmZsaWN0cy5kZWxldGUobm9ybUNvbmZsaWN0VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdWYWx1ZS5jb25mbGljdHMuc2V0KG5vcm1FeGlzdGluZ1ZhbHVlLCBleGlzdGluZ1ZhbHVlLmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nVmFsdWUuY291bnQgPSBleGlzdGluZ0NvbmZsaWN0Q291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1ZhbHVlLnZhbHVlID0gdmFsdWUudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1ZhbHVlLmNvbmZsaWN0cy5zZXQobm9ybUNvbmZsaWN0VmFsdWUsIGV4aXN0aW5nQ29uZmxpY3RDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcXVhbE5vcm1hbGl6ZWRQYXJhbVZhbHVlKGV4aXN0aW5nVmFsdWUudmFsdWUsIHZhbHVlLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gbmVlZCB0byByZXBsYWNlIGlmIHRoZSB2YWx1ZSBpcyB0aGUgc2FtZS4gSnVzdCB1cGRhdGUgdGhlIGNvdW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvdW50ID4gZXhpc3RpbmdWYWx1ZS5jb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nVmFsdWUuY291bnQgPSB2YWx1ZS5jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1ZhbHVlLmNvbmZsaWN0cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBIZXVyaXN0aWMgdG8gcHJlZmVyIHZhbHVlcyBvcmlnaW5hbCB0byB1c2VyIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgLy8gYW5kIG5vdCBmcm9tIGEgc3lub255bSBvciBhbHRlcm5hdGl2ZSBzdWdnZXN0ZWQgYnkgR1BUXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzYW1lLCB3ZSBwcmVmZXIgdGhlIGxhdGVzdCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdWYWx1ZS5jb3VudCA8PSB2YWx1ZS5jb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdWYWx1ZS52YWx1ZSA9IHZhbHVlLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdWYWx1ZS5jb3VudCA9IHZhbHVlLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdWYWx1ZS5jb25mbGljdHMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0NvbnN0Q29uZmxpY3QodGV4dCwgZXhpc3RpbmdWYWx1ZS52YWx1ZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbWFwLnNldCh0ZXh0LCBjbG9uZSA/IHN0cnVjdHVyZWRDbG9uZSh2YWx1ZSkgOiB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbWVyZ2UodHJhbnNmb3JtcywgY2FjaGVDb25mbGljdHMpIHtcbiAgICAgICAgdHJhbnNmb3Jtcy50cmFuc2Zvcm1zLmZvckVhY2goKHRleHRUcmFuc2Zvcm0sIHBhcmFtTmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnRyYW5zZm9ybXMuZ2V0KHBhcmFtTmFtZSk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRleHRUcmFuc2Zvcm0uZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFRyYW5zZm9ybVJlY29yZChleGlzdGluZywga2V5LCB2YWx1ZSwgdHJ1ZSwgY2FjaGVDb25mbGljdHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1zLnNldChwYXJhbU5hbWUsIG5ldyBNYXAodGV4dFRyYW5zZm9ybSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0KHBhcmFtTmFtZSwgdGV4dCwgaGlzdG9yeSkge1xuICAgICAgICBjb25zdCB0ZXh0VHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm1zLmdldChwYXJhbU5hbWUpO1xuICAgICAgICBpZiAodGV4dFRyYW5zZm9ybSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIGVycm9yOiBubyB0cmFuc2Zvcm0gZm91bmQgZm9yICR7cGFyYW1OYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhc2UgaW5zZW5zaXRpdmUvbm9uLWRpYWNyaXRpYyBtYXRjaFxuICAgICAgICBjb25zdCByZWNvcmQgPSB0ZXh0VHJhbnNmb3JtLmdldChub3JtYWxpemVQYXJhbVN0cmluZyh0ZXh0KSk7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNUcmFuc2Zvcm1FbnRpdHlSZWNvcmQocmVjb3JkKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogQmV0dGVyIGhpc3RvcnkgbWF0Y2hpbmcgaGV1cmlzdGljLiBDdXJyZW50bHkgaXQgd2lsbCBqdXN0IHRoZSBmaXJzdCBvbmUgaW4gdGhlIGxpc3QuXG4gICAgICAgICAgICByZXR1cm4gaGlzdG9yeT8uZW50aXRpZXMuZmluZCgoZW50aXR5KSA9PiByZWNvcmQuZW50aXR5VHlwZXMuZXZlcnkoKGVudGl0eVR5cGUpID0+IGVudGl0eS50eXBlLmluY2x1ZGVzKGVudGl0eVR5cGUpKSk/Lm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlY29yZC52YWx1ZTtcbiAgICB9XG4gICAgZ2V0Q29uZmxpY3RzKHBhcmFtTmFtZSwgdGV4dCkge1xuICAgICAgICBjb25zdCB0ZXh0VHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm1zLmdldChwYXJhbU5hbWUpO1xuICAgICAgICBpZiAodGV4dFRyYW5zZm9ybSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIGVycm9yOiBubyB0cmFuc2Zvcm0gZm91bmQgZm9yICR7cGFyYW1OYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhc2UgaW5zZW5zaXRpdmUvbm9uLWRpYWNyaXRpYyBtYXRjaFxuICAgICAgICBjb25zdCByZWNvcmQgPSB0ZXh0VHJhbnNmb3JtLmdldChub3JtYWxpemVQYXJhbVN0cmluZyh0ZXh0KSk7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgaXNUcmFuc2Zvcm1FbnRpdHlSZWNvcmQocmVjb3JkKSB8fFxuICAgICAgICAgICAgcmVjb3JkLmNvbmZsaWN0cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHJlY29yZC5jb25mbGljdHMua2V5cygpKTtcbiAgICB9XG4gICAgdG9KU09OKCkge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1zSlNPTiA9IFtdO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybXMuZm9yRWFjaCgodHJhbnNmb3JtTWFwLCBuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW3RleHQsIHJlY29yZF0gb2YgdHJhbnNmb3JtTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc1RyYW5zZm9ybUVudGl0eVJlY29yZChyZWNvcmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybS5wdXNoKFt0ZXh0LCByZWNvcmRdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybS5wdXNoKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlY29yZC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogcmVjb3JkLmNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZsaWN0czogcmVjb3JkLmNvbmZsaWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IEFycmF5LmZyb20ocmVjb3JkLmNvbmZsaWN0cy5lbnRyaWVzKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhbnNmb3Jtc0pTT04ucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1zSlNPTjtcbiAgICB9XG4gICAgc3RhdGljIGZyb21KU09OKHRyYW5zZm9ybXNKU09OKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybXMgPSBuZXcgVHJhbnNmb3JtcygpO1xuICAgICAgICBmb3IgKGNvbnN0IHRyYW5zZm9ybSBvZiB0cmFuc2Zvcm1zSlNPTikge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtUmVjb3JkcyA9IHRyYW5zZm9ybS50cmFuc2Zvcm0ubWFwKChbdGV4dCwgcmVjb3JkXSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc1RyYW5zZm9ybUVudGl0eVJlY29yZChyZWNvcmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbdGV4dCwgcmVjb3JkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gTGVnYWN5IGZvcm1hdCBmb3IgY291bnQsIGNvbnZlcnQgdG8gbmV3IGZvcm1hdFxuICAgICAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gKHJlY29yZC5jb3VudCA/PyByZWNvcmQub3JpZ2luYWwpID8gMSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVSZWNvcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZWNvcmQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50LFxuICAgICAgICAgICAgICAgICAgICBjb25mbGljdHM6IHJlY29yZC5jb25mbGljdHNcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IE1hcChyZWNvcmQuY29uZmxpY3RzKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW3RleHQsIHZhbHVlUmVjb3JkXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJhbnNmb3Jtcy50cmFuc2Zvcm1zLnNldCh0cmFuc2Zvcm0ubmFtZSwgbmV3IE1hcCh0cmFuc2Zvcm1SZWNvcmRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybXM7XG4gICAgfVxuICAgIHRvU3RyaW5nKHByZWZpeCA9IFwiICBcIikge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1zID0gQXJyYXkuZnJvbSh0aGlzLnRyYW5zZm9ybXMuZW50cmllcygpKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAoY29uc3QgW3BhcmFtTmFtZSwgdHJhbnNmb3JtTWFwXSBvZiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChgJHtwcmVmaXh9JHtwYXJhbU5hbWV9OmApO1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdHJhbnNmb3JtTWFwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYCR7cHJlZml4fSAgJHtrZXl9IC0+ICR7aXNUcmFuc2Zvcm1FbnRpdHlSZWNvcmQodmFsdWUpID8gYChlbnRpdHkgdHlwZXM6ICR7dmFsdWUuZW50aXR5VHlwZXMuam9pbihcIiwgXCIpfSlgIDogdmFsdWUudmFsdWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKFwiXFxuXCIpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRyYW5zZm9ybXMuanMubWFwIiwiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1TdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHN0clxuICAgICAgICAubm9ybWFsaXplKFwiTkZEXCIpXG4gICAgICAgIC5yZXBsYWNlKC9cXHB7RGlhY3JpdGljfS9ndSwgXCJcIilcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1WYWx1ZSh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyBub3JtYWxpemVQYXJhbVN0cmluZyh2YWx1ZSkgOiB2YWx1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbE5vcm1hbGl6ZWRQYXJhbVZhbHVlKGEsIGIpIHtcbiAgICByZXR1cm4gYSA9PT0gYiB8fCBub3JtYWxpemVQYXJhbVZhbHVlKGEpID09PSBub3JtYWxpemVQYXJhbVZhbHVlKGIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsTm9ybWFsaXplZFBhcmFtT2JqZWN0KGEgPSB7fSwgYiA9IHt9KSB7XG4gICAgcmV0dXJuIChub3JtYWxpemVQYXJhbVN0cmluZyhKU09OLnN0cmluZ2lmeShhKSkgPT09XG4gICAgICAgIG5vcm1hbGl6ZVBhcmFtU3RyaW5nKEpTT04uc3RyaW5naWZ5KGIpKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXhlY3V0YWJsZUFjdGlvbih0cmFuc2xhdG9yTmFtZSwgYWN0aW9uTmFtZSwgcGFyYW1ldGVycywgcmVzdWx0RW50aXR5SWQpIHtcbiAgICBjb25zdCBhY3Rpb24gPSB7XG4gICAgICAgIHRyYW5zbGF0b3JOYW1lLFxuICAgICAgICBhY3Rpb25OYW1lLFxuICAgIH07XG4gICAgaWYgKHBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhY3Rpb24ucGFyYW1ldGVycyA9IHBhcmFtZXRlcnM7XG4gICAgfVxuICAgIGNvbnN0IGV4ZWN1dGFibGVBY3Rpb24gPSB7XG4gICAgICAgIGFjdGlvbixcbiAgICB9O1xuICAgIGlmIChyZXN1bHRFbnRpdHlJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGV4ZWN1dGFibGVBY3Rpb24ucmVzdWx0RW50aXR5SWQgPSByZXN1bHRFbnRpdHlJZDtcbiAgICB9XG4gICAgcmV0dXJuIGV4ZWN1dGFibGVBY3Rpb247XG59XG5jb25zdCBmb3JtYXQgPSBcIic8cmVxdWVzdD4gPT4gdHJhbnNsYXRvci5hY3Rpb24oPHBhcmFtZXRlcnM+KScgb3IgJzxyZXF1ZXN0PiA9PiBbIHRyYW5zbGF0b3IuYWN0aW9uMSg8cGFyYW1ldGVyczE+KSwgdHJhbnNsYXRvci5hY3Rpb24yKDxwYXJhbWV0ZXJzMj4pLCAuLi4gXSdcIjtcbmZ1bmN0aW9uIHBhcnNlRnVsbEFjdGlvbk5hbWVQYXJ0cyhmdWxsQWN0aW9uTmFtZSkge1xuICAgIGNvbnN0IHBhcnRzID0gZnVsbEFjdGlvbk5hbWUuc3BsaXQoXCIuXCIpO1xuICAgIGNvbnN0IHRyYW5zbGF0b3JOYW1lID0gcGFydHMuc2xpY2UoMCwgLTEpLmpvaW4oXCIuXCIpO1xuICAgIGNvbnN0IGFjdGlvbk5hbWUgPSBwYXJ0cy5hdCgtMSk7XG4gICAgcmV0dXJuIHsgdHJhbnNsYXRvck5hbWUsIGFjdGlvbk5hbWUgfTtcbn1cbmZ1bmN0aW9uIHBhcnNlQWN0aW9uKGFjdGlvbiwgaW5kZXggPSAtMSkge1xuICAgIGNvbnN0IGxlZnRQYXJhbiA9IGFjdGlvbi5pbmRleE9mKFwiKFwiKTtcbiAgICBpZiAobGVmdFBhcmFuID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7aW5kZXggIT09IC0xID8gYEFjdGlvbiAke2luZGV4fTogYCA6IFwiXCJ9TWlzc2luZyAnKCcuIElucHV0IG11c3QgYmUgaW4gdGhlIGZvcm0gb2YgJHtmb3JtYXR9YCk7XG4gICAgfVxuICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGFjdGlvbi5zdWJzdHJpbmcoMCwgbGVmdFBhcmFuKTtcbiAgICBjb25zdCB7IHRyYW5zbGF0b3JOYW1lLCBhY3Rpb25OYW1lIH0gPSBwYXJzZUZ1bGxBY3Rpb25OYW1lUGFydHMoZnVuY3Rpb25OYW1lKTtcbiAgICBpZiAoIWFjdGlvbk5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2luZGV4ICE9PSAtMSA/IGBBY3Rpb24gJHtpbmRleH06IGAgOiBcIlwifVVuYWJsZSB0byBwYXJzZSBhY3Rpb24gbmFtZSBmcm9tICcke2Z1bmN0aW9uTmFtZX0nLiBJbnB1dCBtdXN0IGJlIGluIHRoZSBmb3JtIG9mICR7Zm9ybWF0fWApO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uW2FjdGlvbi5sZW5ndGggLSAxXSAhPT0gXCIpXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2luZGV4ICE9PSAtMSA/IGBBY3Rpb24gJHtpbmRleH06IGAgOiBcIlwifU1pc3NpbmcgdGVybWluYXRpbmcgJyknLiBJbnB1dCBtdXN0IGJlIGluIHRoZSBmb3JtIG9mICR7Zm9ybWF0fWApO1xuICAgIH1cbiAgICBjb25zdCBwYXJhbVN0ciA9IGFjdGlvbi5zdWJzdHJpbmcobGVmdFBhcmFuICsgMSwgYWN0aW9uLmxlbmd0aCAtIDEpLnRyaW0oKTtcbiAgICBsZXQgcGFyYW1ldGVycztcbiAgICBpZiAocGFyYW1TdHIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMgPSBKU09OLnBhcnNlKHBhcmFtU3RyKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2luZGV4ICE9PSAtMSA/IGBBY3Rpb24gJHtpbmRleH06IGAgOiBcIlwifVVuYWJsZSB0byBwYXJzZSBwYXJhbWV0ZXJzIGFzIEpTT046ICcke3BhcmFtU3RyfVxcbiR7ZS5tZXNzYWdlfSdgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlRXhlY3V0YWJsZUFjdGlvbih0cmFuc2xhdG9yTmFtZSwgYWN0aW9uTmFtZSwgcGFyYW1ldGVycyk7XG59XG5mdW5jdGlvbiBwYXJzZUFjdGlvbnMoYWN0aW9uU3RyKSB7XG4gICAgaWYgKGFjdGlvblN0clthY3Rpb25TdHIubGVuZ3RoIC0gMV0gIT09IFwiXVwiKSB7XG4gICAgICAgIGBNaXNzaW5nIHRlcm1pbmF0aW5nICddJy4gSW5wdXQgbXVzdCBiZSBpbiB0aGUgZm9ybSBvZiAke2Zvcm1hdH1gO1xuICAgIH1cbiAgICBjb25zdCBhY3Rpb25zID0gW107XG4gICAgLy8gUmVtb3ZlIHRoZSBicmFja2V0c1xuICAgIGxldCBjdXJyID0gYWN0aW9uU3RyLnN1YnN0cmluZygxLCBhY3Rpb25TdHIubGVuZ3RoIC0gMSk7XG4gICAgLy8gVHJ5IGd1ZXNzaW5nIHRoZSBlbmQgb2YgdGhlIGFjdGlvbiBhbmQgdHJ5IHBhcnNpbmcgaXQuXG4gICAgbGV0IHJpZ2h0ID0gLTE7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgLy8gRmluZCB0aGUgbmV4dCBwb3NzaWJsZSBlbmQgb2YgdGhlIGFjdGlvblxuICAgICAgICByaWdodCA9IGN1cnIuaW5kZXhPZihcIn0pLFwiLCByaWdodCArIDEpO1xuICAgICAgICBpZiAocmlnaHQgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBFbmQgb2YgdGhlIGxpc3QsIHRyeSBwYXJzZSB0aGUgZXJyb3IsIGFuZCBpZiBpdCBmYWlscywgdGhlIGVycm9yIHByb3BhZ2F0ZXNcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChwYXJzZUFjdGlvbihjdXJyLCBhY3Rpb25zLmxlbmd0aCArIDEpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGN1cnIuc3Vic3RyaW5nKDAsIHJpZ2h0ICsgMik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gc2VlIGlmIHdlIGNhbiBwYXJzZSBhY3Rpb24uXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2gocGFyc2VBY3Rpb24oYWN0aW9uLCBhY3Rpb25zLmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIElmIG5vdCwgaXQgY291bGQgYmUgdGhhdCB0aGUgcGF0dGVybiBpcyBpbiBhIHF1b3RlLiBUcnkgdG8gZmluZCB0aGUgbmV4dCBwb3NzaWJsZSBlbmQgb2YgdGhlIGFjdGlvblxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY3VyciA9IGN1cnIuc3Vic3RyaW5nKHJpZ2h0ICsgMykudHJpbSgpO1xuICAgICAgICByaWdodCA9IC0xO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9ucztcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsQWN0aW9uTmFtZShhY3Rpb24pIHtcbiAgICByZXR1cm4gYCR7YWN0aW9uLmFjdGlvbi50cmFuc2xhdG9yTmFtZX0uJHthY3Rpb24uYWN0aW9uLmFjdGlvbk5hbWV9YDtcbn1cbmZ1bmN0aW9uIHBhcnNlRXhlY3V0YWJsZUFjdGlvbnNTdHJpbmcoYWN0aW9ucykge1xuICAgIHJldHVybiBhY3Rpb25zWzBdID09PSBcIltcIiA/IHBhcnNlQWN0aW9ucyhhY3Rpb25zKSA6IFtwYXJzZUFjdGlvbihhY3Rpb25zKV07XG59XG5mdW5jdGlvbiBleGVjdXRhYmxlQWN0aW9uVG9TdHJpbmcoYWN0aW9uKSB7XG4gICAgcmV0dXJuIGAke2dldEZ1bGxBY3Rpb25OYW1lKGFjdGlvbil9KCR7YWN0aW9uLmFjdGlvbi5wYXJhbWV0ZXJzID8gSlNPTi5zdHJpbmdpZnkoYWN0aW9uLmFjdGlvbi5wYXJhbWV0ZXJzKSA6IFwiXCJ9KWA7XG59XG5mdW5jdGlvbiBleGVjdXRhYmxlQWN0aW9uc1RvU3RyaW5nKGFjdGlvbnMpIHtcbiAgICByZXR1cm4gYWN0aW9ucy5sZW5ndGggIT09IDFcbiAgICAgICAgPyBgWyR7YWN0aW9ucy5tYXAoZXhlY3V0YWJsZUFjdGlvblRvU3RyaW5nKS5qb2luKFwiLFwiKX1dYFxuICAgICAgICA6IGV4ZWN1dGFibGVBY3Rpb25Ub1N0cmluZyhhY3Rpb25zWzBdKTtcbn1cbmZ1bmN0aW9uIGZyb21Kc29uQWN0aW9uKGFjdGlvbkpTT04pIHtcbiAgICBjb25zdCB7IHRyYW5zbGF0b3JOYW1lLCBhY3Rpb25OYW1lIH0gPSBwYXJzZUZ1bGxBY3Rpb25OYW1lUGFydHMoYWN0aW9uSlNPTi5mdWxsQWN0aW9uTmFtZSk7XG4gICAgcmV0dXJuIGNyZWF0ZUV4ZWN1dGFibGVBY3Rpb24odHJhbnNsYXRvck5hbWUsIGFjdGlvbk5hbWUsIGFjdGlvbkpTT04ucGFyYW1ldGVycywgYWN0aW9uSlNPTi5yZXN1bHRFbnRpdHlJZCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZnJvbUpzb25BY3Rpb25zKGFjdGlvbnMpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhY3Rpb25zKVxuICAgICAgICA/IGFjdGlvbnMubWFwKChhKSA9PiBmcm9tSnNvbkFjdGlvbihhKSlcbiAgICAgICAgOiBbZnJvbUpzb25BY3Rpb24oYWN0aW9ucyldO1xufVxuZnVuY3Rpb24gdG9Kc29uQWN0aW9uKGFjdGlvbikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHsgZnVsbEFjdGlvbk5hbWU6IGdldEZ1bGxBY3Rpb25OYW1lKGFjdGlvbikgfTtcbiAgICBpZiAoYWN0aW9uLmFjdGlvbi5wYXJhbWV0ZXJzKSB7XG4gICAgICAgIHJlc3VsdC5wYXJhbWV0ZXJzID0gYWN0aW9uLmFjdGlvbi5wYXJhbWV0ZXJzO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uLnJlc3VsdEVudGl0eUlkKSB7XG4gICAgICAgIHJlc3VsdC5yZXN1bHRFbnRpdHlJZCA9IGFjdGlvbi5yZXN1bHRFbnRpdHlJZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b0pzb25BY3Rpb25zKGFjdGlvbnMpIHtcbiAgICByZXR1cm4gYWN0aW9ucy5sZW5ndGggIT09IDFcbiAgICAgICAgPyBhY3Rpb25zLm1hcCh0b0pzb25BY3Rpb24pXG4gICAgICAgIDogdG9Kc29uQWN0aW9uKGFjdGlvbnNbMF0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvRXhlY3V0YWJsZUFjdGlvbnMoYWN0aW9ucykge1xuICAgIHJldHVybiBhY3Rpb25zLm1hcCgoYWN0aW9uKSA9PiAoeyBhY3Rpb24gfSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvRnVsbEFjdGlvbnMoYWN0aW9ucykge1xuICAgIHJldHVybiBhY3Rpb25zLm1hcCgoYSkgPT4gYS5hY3Rpb24pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uTmFtZXNGb3JBY3Rpb25zKGFjdGlvbnMpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFjdGlvbnMubWFwKChhKSA9PiBhLmFjdGlvbi50cmFuc2xhdG9yTmFtZSkpKS5zb3J0KCk7XG59XG5leHBvcnQgY2xhc3MgUmVxdWVzdEFjdGlvbiB7XG4gICAgY29uc3RydWN0b3IocmVxdWVzdCwgYWN0aW9ucywgaGlzdG9yeSkge1xuICAgICAgICB0aGlzLnJlcXVlc3QgPSByZXF1ZXN0O1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBhY3Rpb25zO1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBoaXN0b3J5O1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMucmVxdWVzdH0ke1JlcXVlc3RBY3Rpb24uU2VwYXJhdG9yfSR7ZXhlY3V0YWJsZUFjdGlvbnNUb1N0cmluZyh0aGlzLmFjdGlvbnMpfWA7XG4gICAgfVxuICAgIHRvUHJvbXB0U3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgcmVxdWVzdDogdGhpcy5yZXF1ZXN0LFxuICAgICAgICAgICAgYWN0aW9uczogdGhpcy5hY3Rpb25zLFxuICAgICAgICB9LCB1bmRlZmluZWQsIDIpO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVN0cmluZyhpbnB1dCkge1xuICAgICAgICAvLyBWZXJ5IHNpbXBsaXN0aWMgcGFyc2VyIGZvciByZXF1ZXN0L2FjdGlvbi5cbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IGlucHV0LnRyaW0oKTtcbiAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gdHJpbW1lZC5pbmRleE9mKFJlcXVlc3RBY3Rpb24uU2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKHNlcGFyYXRvciA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7UmVxdWVzdEFjdGlvbi5TZXBhcmF0b3J9JyBub3QgZm91bmQuIElucHV0IG11c3QgYmUgaW4gdGhlIGZvcm0gb2YgJHtmb3JtYXR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRyaW1tZWQuc3Vic3RyaW5nKDAsIHNlcGFyYXRvcikudHJpbSgpO1xuICAgICAgICBjb25zdCBhY3Rpb25zID0gdHJpbW1lZFxuICAgICAgICAgICAgLnN1YnN0cmluZyhzZXBhcmF0b3IgKyBSZXF1ZXN0QWN0aW9uLlNlcGFyYXRvci5sZW5ndGgpXG4gICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICByZXR1cm4gbmV3IFJlcXVlc3RBY3Rpb24ocmVxdWVzdCwgcGFyc2VFeGVjdXRhYmxlQWN0aW9uc1N0cmluZyhhY3Rpb25zKSk7XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUocmVxdWVzdCwgYWN0aW9ucywgaGlzdG9yeSkge1xuICAgICAgICByZXR1cm4gbmV3IFJlcXVlc3RBY3Rpb24ocmVxdWVzdCwgQXJyYXkuaXNBcnJheShhY3Rpb25zKSA/IGFjdGlvbnMgOiBbYWN0aW9uc10sIGhpc3RvcnkpO1xuICAgIH1cbn1cblJlcXVlc3RBY3Rpb24uU2VwYXJhdG9yID0gXCIgPT4gXCI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXF1ZXN0QWN0aW9uLmpzLm1hcCIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuLy8gRXhwb3J0IGZvciBjYWNoZSBleHBsb3JlciBmb3Igbm93XG5leHBvcnQgeyBDb25zdHJ1Y3Rpb24sIH0gZnJvbSBcIi4vY29uc3RydWN0aW9ucy9jb25zdHJ1Y3Rpb25zLmpzXCI7XG5leHBvcnQgeyBNYXRjaFNldCwgaXNNYXRjaFBhcnQgfSBmcm9tIFwiLi9jb25zdHJ1Y3Rpb25zL21hdGNoUGFydC5qc1wiO1xuZXhwb3J0IHsgQ29uc3RydWN0aW9uQ2FjaGUgfSBmcm9tIFwiLi9jb25zdHJ1Y3Rpb25zL2NvbnN0cnVjdGlvbkNhY2hlLmpzXCI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleEJyb3dzZXIuanMubWFwIiwiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5jb25zdCBzdWJqZWN0UHJvbm91bnMgPSBbXG4gICAgXCJpXCIsXG4gICAgXCJ5b3VcIixcbiAgICBcImhlXCIsXG4gICAgXCJzaGVcIixcbiAgICBcIml0XCIsXG4gICAgXCJ3ZVwiLFxuICAgIC8vIFwieW91XCIsICAvLyBkb3VibGVkIGFib3ZlXG4gICAgXCJ0aGV5XCIsXG4gICAgXCJ5b3UtYWxsXCIsXG4gICAgXCJ5J2FsbFwiLFxuICAgIFwidGhvdVwiLFxuICAgIFwieWVcIixcbiAgICBcInlvdXNlXCIsXG5dO1xuY29uc3Qgb2JqZWN0UHJvbm91bnMgPSBbXG4gICAgXCJtZVwiLFxuICAgIFwieW91XCIsXG4gICAgXCJoaW1cIixcbiAgICBcImhlclwiLFxuICAgIFwiaXRcIixcbiAgICBcInVzXCIsXG4gICAgLy8gXCJ5b3VcIiwgIC8vIGRvdWJsZWQgYWJvdmVcbiAgICBcInRoZW1cIixcbiAgICBcInlvdS1hbGxcIixcbiAgICBcInknYWxsXCIsXG4gICAgXCJ0aGVlXCIsXG4gICAgXCJ5ZVwiLFxuICAgIFwieW91c2VcIixcbl07XG5jb25zdCBwb3NzZXNzaXZlUHJvbm91bnMgPSBbXG4gICAgXCJtaW5lXCIsXG4gICAgXCJ5b3Vyc1wiLFxuICAgIFwiaGlzXCIsXG4gICAgXCJoZXJzXCIsXG4gICAgXCJpdHNcIixcbiAgICBcIm91cnNcIixcbiAgICBcInlvdXJzXCIsXG4gICAgXCJ0aGVpcnNcIixcbiAgICBcIm9uZSdzXCIsXG4gICAgXCJ0aGluZVwiLFxuICAgIFwieWVlcnNcIixcbiAgICBcInknYWxsJ3NcIixcbiAgICBcImVhY2ggb3RoZXInc1wiLFxuICAgIFwib25lIGFub3RoZXInc1wiLFxuXTtcbmNvbnN0IHJlZmxleGl2ZVByb25vdW5zID0gW1xuICAgIFwibXlzZWxmXCIsXG4gICAgXCJ5b3Vyc2VsZlwiLFxuICAgIFwiaGltc2VsZlwiLFxuICAgIFwiaGVyc2VsZlwiLFxuICAgIFwiaXRzZWxmXCIsXG4gICAgXCJvdXJzZWx2ZXNcIixcbiAgICBcInlvdXJzZWx2ZXNcIixcbiAgICBcInRoZW1zZWx2ZXNcIixcbiAgICBcIm9uZXNlbGZcIixcbiAgICBcInRoeXNlbGZcIixcbiAgICBcIndob3NlbGZcIixcbl07XG5jb25zdCBkZW1vc3RyYXRpdmVQcm9ub3VucyA9IFtcInRoaXNcIiwgXCJ0aGF0XCIsIFwidGhlc2VcIiwgXCJ0aG9zZVwiXTtcbmNvbnN0IGluZGVmaW5pdGVQcm9ub3VucyA9IFtcbiAgICBcImFsbFwiLFxuICAgIFwiYW5vdGhlclwiLFxuICAgIFwiYW55XCIsXG4gICAgXCJhbnlib2R5XCIsXG4gICAgXCJhbnlvbmVcIixcbiAgICBcImFueXRoaW5nXCIsXG4gICAgXCJhdWdodFwiLFxuICAgIFwiYm90aFwiLFxuICAgIFwiY2VydGFpblwiLFxuICAgIFwiZWFjaFwiLFxuICAgIFwiZWl0aGVyXCIsXG4gICAgXCJlbm91Z2hcIixcbiAgICBcImV2ZXJ5Ym9keVwiLFxuICAgIFwiZXZlcnlvbmVcIixcbiAgICBcImV2ZXJ5dGhpbmdcIixcbiAgICBcImZld1wiLFxuICAgIFwiZmV3ZXJcIixcbiAgICBcImZld2VzdFwiLFxuICAgIFwibGl0dGxlXCIsXG4gICAgXCJtYW55XCIsXG4gICAgXCJtb3JlXCIsXG4gICAgXCJtb3N0XCIsXG4gICAgXCJuZWl0aGVyXCIsXG4gICAgXCJubyBvbmVcIixcbiAgICBcIm5vYm9keVwiLFxuICAgIFwibm9uZVwiLFxuICAgIFwibm90aGluZ1wiLFxuICAgIFwib25lXCIsXG4gICAgXCJvdGhlclwiLFxuICAgIFwib3RoZXJzXCIsXG4gICAgXCJvd25cIixcbiAgICBcInBsZW50eVwiLFxuICAgIFwic2V2ZXJhbFwiLFxuICAgIFwic2FtZVwiLFxuICAgIFwic29tZVwiLFxuICAgIFwic29tZWJvZHlcIixcbiAgICBcInNvbWVvbmVcIixcbiAgICBcInNvbWV0aGluZ1wiLFxuICAgIFwic29tZXdoYXRcIixcbiAgICBcInN1Y2ggYW5kIHN1Y2hcIixcbiAgICBcInN1Y2hcIixcbiAgICBcInN1Y2hsaWtlXCIsXG5dO1xuY29uc3QgaW50ZXJyb2dhdGl2ZVByb25vdW5zID0gW1xuICAgIFwid2hhdFwiLFxuICAgIFwid2hhdGUnZXJcIixcbiAgICBcIndoYXRldmVyXCIsXG4gICAgXCJ3aGF0c29ldmVyXCIsXG4gICAgXCJ3aGljaFwiLFxuICAgIFwid2hpY2hldmVyXCIsXG4gICAgXCJ3aGljaHNvZXZlclwiLFxuICAgIFwid2hvXCIsXG4gICAgXCJ3aG9ldmVyXCIsXG4gICAgXCJ3aG9zb1wiLFxuICAgIFwid2hvc29ldmVyXCIsXG4gICAgXCJ3aG9tXCIsXG4gICAgXCJ3aG9tZXZlclwiLFxuICAgIFwid2hvbXNvZXZlclwiLFxuICAgIFwid2hvc2VcIixcbl07XG5jb25zdCByZWxhdGl2ZVByb251bnMgPSBbXCJhc1wiLCBcInRoYXRcIiwgLi4uaW50ZXJyb2dhdGl2ZVByb25vdW5zXTtcbmNvbnN0IHJlY2lwcm9jYWxQcm9ub3VucyA9IFtcImVhY2ggb3RoZXJcIiwgXCJvbmUgYW5vdGhlclwiXTtcbmNvbnN0IHBvc3Nlc3NpdmVBZGplY3RpdmVzID0gW1xuICAgIFwibXlcIixcbiAgICBcInlvdXJcIixcbiAgICBcImhpc1wiLFxuICAgIFwiaGVyXCIsXG4gICAgXCJpdHNcIixcbiAgICBcIm91clwiLFxuICAgIFwieW91clwiLFxuICAgIFwidGhlaXJcIixcbiAgICBcIm9uZSdzXCIsXG4gICAgXCJ5ZWVyXCIsXG4gICAgXCJ5J2FsbCdzXCIsXG4gICAgXCJlYWNoIG90aGVyJ3NcIixcbiAgICBcIm9uZSBhbm90aGVyJ3NcIixcbl07XG5jb25zdCBkZW1vc3RyYXRpdmVBZHZlcmJzID0gW1wiaGVyZVwiLCBcInRoZXJlXCJdO1xuY29uc3QgY29uanVuY3Rpb25zID0gW1xuICAgIFwiYWNjb3JkaW5nIGFzXCIsXG4gICAgXCJhbmRcIixcbiAgICBcImFmdGVyXCIsXG4gICAgXCJhbGJlaXRcIixcbiAgICBcImFsdGhvdWdoXCIsXG4gICAgXCJhcyBpZlwiLFxuICAgIFwiYXMgbG9uZyBhc1wiLFxuICAgIFwiYXMgdGhvdWdoXCIsXG4gICAgXCJhc1wiLFxuICAgIFwiYmVjYXVzZVwiLFxuICAgIFwiYmVmb3JlXCIsXG4gICAgXCJib3RoIGFuZFwiLFxuICAgIFwiYnV0IHRoYXRcIixcbiAgICBcImJ1dCB0aGVuIGFnYWluXCIsXG4gICAgXCJidXQgdGhlblwiLFxuICAgIFwiYnV0XCIsXG4gICAgXCJjb25zaWRlcmluZ1wiLFxuICAgIFwiY29zXCIsXG4gICAgXCJkaXJlY3RseVwiLFxuICAgIFwiZWl0aGVyIG9yXCIsXG4gICAgXCJlcmVcIixcbiAgICBcImV4Y2VwdFwiLFxuICAgIFwiZm9yXCIsXG4gICAgXCJmb3Jhc211Y2hhc1wiLFxuICAgIFwiaG93XCIsXG4gICAgXCJob3dldmVyXCIsXG4gICAgXCJpZlwiLFxuICAgIFwiaW1tZWRpYXRlbHlcIixcbiAgICBcImluIGFzIGZhciBhc1wiLFxuICAgIFwiaW5hc211Y2ggYXNcIixcbiAgICBcImluc29mYXIgYXNcIixcbiAgICBcImluc29tdWNoIHRoYXRcIixcbiAgICBcImluc29tdWNoYXNcIixcbiAgICBcImxlc3RcIixcbiAgICBcImxpa2VcIixcbiAgICBcIm5laXRoZXIgbm9yXCIsXG4gICAgXCJuZWl0aGVyXCIsXG4gICAgXCJub3JcIixcbiAgICBcIm5vdHdpdGhzdGFuZGluZ1wiLFxuICAgIFwibm93IHRoYXRcIixcbiAgICBcIm5vd1wiLFxuICAgIFwib25jZVwiLFxuICAgIFwib25seVwiLFxuICAgIFwib3JcIixcbiAgICBcInByb3ZpZGVkIHRoYXRcIixcbiAgICBcInByb3ZpZGVkXCIsXG4gICAgXCJwcm92aWRpbmcgdGhhdFwiLFxuICAgIFwicHJvdmlkaW5nXCIsXG4gICAgXCJzZWVpbmcgYXMgaG93XCIsXG4gICAgXCJzZWVpbmcgYXNcIixcbiAgICBcInNlZWluZyB0aGF0XCIsXG4gICAgXCJzZWVpbmdcIixcbiAgICBcInNpbmNlXCIsXG4gICAgXCJzb1wiLFxuICAgIFwic3VwcG9zZVwiLFxuICAgIFwic3VwcG9zaW5nXCIsXG4gICAgXCJ0aGFuXCIsXG4gICAgXCJ0aGF0XCIsXG4gICAgXCJ0aG91Z2hcIixcbiAgICBcInRpbGxcIixcbiAgICBcInVubGVzc1wiLFxuICAgIFwidW50aWxcIixcbiAgICBcIndoZW5cIixcbiAgICBcIndoZW5ldmVyXCIsXG4gICAgXCJ3aGVyZVwiLFxuICAgIFwid2hlcmVhc1wiLFxuICAgIFwid2hlcmVhdFwiLFxuICAgIFwid2hlcmVieVwiLFxuICAgIFwid2hlcmV2ZXJcIixcbiAgICBcIndoZXJlb2ZcIixcbiAgICBcIndoZXJlaW5cIixcbiAgICBcIndoZXJlb25cIixcbiAgICBcIndoZXJlc29ldmVyXCIsXG4gICAgXCJ3aGVyZXRvXCIsXG4gICAgXCJ3aGVyZXVwb25cIixcbiAgICBcIndoZXJldW50b1wiLFxuICAgIFwid2hldGhlclwiLFxuICAgIFwid2hpbGVcIixcbiAgICBcIndoaWxzdFwiLFxuICAgIFwid2h5XCIsXG4gICAgXCJ3aXRob3V0XCIsXG4gICAgXCJ5ZXRcIixcbl07XG5jb25zdCBwcmVwb3NpdGlvbnMgPSBbXG4gICAgXCJhYm9hcmRcIixcbiAgICBcImFib3V0XCIsXG4gICAgXCJhYm92ZVwiLFxuICAgIFwiYWNyb3NzXCIsXG4gICAgXCJhZnRlclwiLFxuICAgIFwiYWdhaW5zdFwiLFxuICAgIFwiYWxvbmdcIixcbiAgICBcImFtaWRcIixcbiAgICBcImFtaWRzdFwiLFxuICAgIFwiYW1vbmdcIixcbiAgICBcImFtb25nc3RcIixcbiAgICBcImFyb3VuZFwiLFxuICAgIFwiYXNcIixcbiAgICBcImF0XCIsXG4gICAgXCJiZWZvcmVcIixcbiAgICBcImJlaGluZFwiLFxuICAgIFwiYmVsb3dcIixcbiAgICBcImJlbmVhdGhcIixcbiAgICBcImJlc2lkZVwiLFxuICAgIFwiYmVzaWRlc1wiLFxuICAgIFwiYmV0d2VlblwiLFxuICAgIFwiYmV5b25kXCIsXG4gICAgXCJidXRcIixcbiAgICBcImJ5XCIsXG4gICAgXCJjaXJjYVwiLFxuICAgIFwiY29uY2VybmluZ1wiLFxuICAgIFwiY29uc2lkZXJpbmdcIixcbiAgICBcImRlc3BpdGVcIixcbiAgICBcImRvd25cIixcbiAgICBcImR1cmluZ1wiLFxuICAgIFwiZXJlXCIsXG4gICAgXCJleGNlcHRcIixcbiAgICBcImZvbGxvd2luZ1wiLFxuICAgIFwiZm9yXCIsXG4gICAgXCJmcm9tXCIsXG4gICAgXCJpblwiLFxuICAgIFwiaW5zaWRlXCIsXG4gICAgXCJpbnRvXCIsXG4gICAgXCJsZXNzXCIsXG4gICAgXCJsaWtlXCIsXG4gICAgXCJtaWRcIiwgLy8gYW1pZFxuICAgIFwibWlkc3RcIixcbiAgICBcIm1pbnVzXCIsXG4gICAgXCJuZWFyXCIsXG4gICAgXCJuZXh0XCIsXG4gICAgXCJuaWdoXCIsXG4gICAgXCJvZlwiLFxuICAgIFwib2ZmXCIsXG4gICAgXCJvblwiLFxuICAgIFwib250b1wiLFxuICAgIFwib3Bwb3NpdGVcIixcbiAgICBcIm91dFwiLFxuICAgIFwib3V0c2lkZVwiLFxuICAgIFwib3ZlclwiLFxuICAgIFwibyd2clwiLCAvLyBvdmVyXG4gICAgXCJwYWNlXCIsXG4gICAgXCJwYXN0XCIsXG4gICAgXCJwZXJcIixcbiAgICBcInBsdXNcIixcbiAgICBcInJlXCIsXG4gICAgXCJyZWdhcmRpbmdcIixcbiAgICBcInJvdW5kXCIsXG4gICAgXCJzYW5zXCIsXG4gICAgXCJzYXZlXCIsXG4gICAgXCJzaW5jZVwiLFxuICAgIFwidGhhblwiLFxuICAgIFwidGhyb3VnaFwiLFxuICAgIFwidGhyb3VnaG91dFwiLFxuICAgIFwidGhydVwiLFxuICAgIFwidGlsbFwiLFxuICAgIFwidG9cIixcbiAgICBcInRvd2FyZFwiLFxuICAgIFwidG93YXJkc1wiLFxuICAgIFwidW5kZXJcIixcbiAgICBcInVuZGVybmVhdGhcIixcbiAgICBcInVubGlrZVwiLFxuICAgIFwidW50aWxcIixcbiAgICBcInVwXCIsXG4gICAgXCJ1cG9uXCIsXG4gICAgXCJ2ZXJzdXNcIixcbiAgICBcInZpYVwiLFxuICAgIFwidmljZVwiLFxuICAgIFwidnNcIixcbiAgICBcIndoaWxlXCIsXG4gICAgXCJ3aXRoXCIsXG4gICAgXCJ3aXRoaW5cIixcbiAgICBcIndpdGhvdXRcIixcbiAgICBcIndvcnRoXCIsXG5dO1xuZnVuY3Rpb24gY29tYmluZVNldHMod29yZHMpIHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0KHdvcmRzLmZsYXQoKSk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oc2V0LnZhbHVlcygpKS5zb3J0KCk7XG59XG5mdW5jdGlvbiBleGFjdE1hdGNoKHdvcmRzKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oPzoke2NvbWJpbmVTZXRzKHdvcmRzKS5qb2luKFwifFwiKX0pJGAsIFwiaVwiKTtcbn1cbmZ1bmN0aW9uIHN1ZmZpeE1hdGNoKHdvcmRzLCBwcmVmaXgpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXFxcXGIke3ByZWZpeCA/IGAke3ByZWZpeH1cXFxcc2AgOiBcIlwifSg/OiR7Y29tYmluZVNldHMod29yZHMpLmpvaW4oXCJ8XCIpfSkkYCwgXCJpXCIpO1xufVxuZnVuY3Rpb24gcGFydE9mTWF0Y2god29yZHMpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXFxcXGIoPzoke2NvbWJpbmVTZXRzKHdvcmRzKS5qb2luKFwifFwiKX0pXFxcXGJgLCBcImlcIik7XG59XG5jb25zdCByZWZlcmVuY2VXb3JkcyA9IGV4YWN0TWF0Y2goW1xuICAgIG9iamVjdFByb25vdW5zLFxuICAgIHBvc3Nlc3NpdmVQcm9ub3VucyxcbiAgICByZWZsZXhpdmVQcm9ub3Vucyxcbl0pO1xuY29uc3QgcmVmZXJlbmNlT2ZTdWZmaXhlcyA9IHN1ZmZpeE1hdGNoKFtvYmplY3RQcm9ub3VucywgcG9zc2Vzc2l2ZVByb25vdW5zLCByZWZsZXhpdmVQcm9ub3Vuc10sIFwib2ZcIik7XG5jb25zdCByZWZlcmVuY2VQYXJ0cyA9IHBhcnRPZk1hdGNoKFtcbiAgICBkZW1vc3RyYXRpdmVQcm9ub3VucyxcbiAgICBpbmRlZmluaXRlUHJvbm91bnMsXG4gICAgaW50ZXJyb2dhdGl2ZVByb25vdW5zLFxuICAgIHJlbGF0aXZlUHJvbnVucyxcbiAgICByZWNpcHJvY2FsUHJvbm91bnMsXG4gICAgcG9zc2Vzc2l2ZUFkamVjdGl2ZXMsXG5dKTtcbmNvbnN0IHJlZmVyZW5jZVN1ZmZpeGVzID0gc3VmZml4TWF0Y2goW2RlbW9zdHJhdGl2ZUFkdmVyYnNdKTtcbmNvbnN0IGNsb3NlQ2xhc3MgPSBbXG4gICAgc3ViamVjdFByb25vdW5zLFxuICAgIG9iamVjdFByb25vdW5zLFxuICAgIHBvc3Nlc3NpdmVQcm9ub3VucyxcbiAgICByZWZsZXhpdmVQcm9ub3VucyxcbiAgICBkZW1vc3RyYXRpdmVQcm9ub3VucyxcbiAgICBpbmRlZmluaXRlUHJvbm91bnMsXG4gICAgaW50ZXJyb2dhdGl2ZVByb25vdW5zLFxuICAgIHJlbGF0aXZlUHJvbnVucyxcbiAgICByZWNpcHJvY2FsUHJvbm91bnMsXG4gICAgcG9zc2Vzc2l2ZUFkamVjdGl2ZXMsXG4gICAgZGVtb3N0cmF0aXZlQWR2ZXJicyxcbiAgICBwcmVwb3NpdGlvbnMsXG4gICAgY29uanVuY3Rpb25zLFxuXTtcbmNvbnN0IHBhcnRDbG9zZWRDbGFzcyA9IHBhcnRPZk1hdGNoKGNsb3NlQ2xhc3MpO1xuY29uc3QgZXhhY3RDbG9zZWRDbGFzcyA9IGV4YWN0TWF0Y2goY2xvc2VDbGFzcyk7XG4vLyBSRVZJRVc6IEhldXJpc3RpY3MgdG8gYWxsb3cgdGltZSByZWZlcmVuY2VzIGZyb20gbm93LlxuY29uc3QgcmVsYXRpdmVUb05vdyA9IC90aGlzICh3ZWVrfG1vbnRofHllYXJ8cXVhcnRlcnxzZWFzb258ZGF5fGhvdXJ8bWludXRlfHNlY29uZHxtb3JuaW5nfGFmdGVybm9vbikkL2k7XG5jb25zdCBsYW5ndWFnZVRvb2xzRW4gPSB7XG4gICAgcG9zc2libGVSZWZlcmVudGlhbFBocmFzZShwaHJhc2UpIHtcbiAgICAgICAgLy8gVE9ETzogaW5pdGlhbCBpbXBsZW1lbnRpb24uIENhbiBiZSBvdmVyYnJvYWQgYW5kIGluY29tcGxldGUuXG4gICAgICAgIHJldHVybiAoKHJlZmVyZW5jZVdvcmRzLnRlc3QocGhyYXNlKSB8fFxuICAgICAgICAgICAgcmVmZXJlbmNlU3VmZml4ZXMudGVzdChwaHJhc2UpIHx8XG4gICAgICAgICAgICByZWZlcmVuY2VPZlN1ZmZpeGVzLnRlc3QocGhyYXNlKSB8fFxuICAgICAgICAgICAgcmVmZXJlbmNlUGFydHMudGVzdChwaHJhc2UpKSAmJlxuICAgICAgICAgICAgIXJlbGF0aXZlVG9Ob3cudGVzdChwaHJhc2UpKTtcbiAgICB9LFxuICAgIGhhc0Nsb3NlZENsYXNzKHBocmFzZSwgZXhhY3QgPSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gKGV4YWN0ID8gZXhhY3RDbG9zZWRDbGFzcyA6IHBhcnRDbG9zZWRDbGFzcykudGVzdChwaHJhc2UpO1xuICAgIH0sXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldExhbmd1YWdlVG9vbHMobGFuZ3VhZ2UpIHtcbiAgICBpZiAobGFuZ3VhZ2UgIT09IFwiZW5cIikge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gbGFuZ3VhZ2VUb29sc0VuO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGFuZ3VhZ2UuanMubWFwIiwiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4vLyBSRVZJRVc6IFVzZSBcXHB7UH0/ICBXaWxsIG5lZWQgdG8gdHVybiBvbiB1bmljb2RlIGZsYWcuICBOZWVkIHRvIGFzc2VzcyBwZXJmIGltcGFjdC5cbmNvbnN0IHB1bmN0dWF0aW9ucyA9IFtcIixcIiwgXCIuXCIsIFwiP1wiLCBcIiFcIl07XG5leHBvcnQgY29uc3Qgc3BhY2VBbmRQdW5jdHVhdGlvblJlZ2V4U3RyID0gYFske3B1bmN0dWF0aW9ucy5qb2luKFwiXCIpfVxcXFxzXWA7XG5leHBvcnQgY29uc3Qgd29yZEJvdW5kYXJ5UmVnZXhTdHIgPSBcIig/Oig/PCFcXFxcdyl8KD8hXFxcXHcpKVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZU1hdGNoKG0pIHtcbiAgICAvLyBlc2NhcGUgYWxsIHJlZ2V4IHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgIHJldHVybiBtLnJlcGxhY2VBbGwoLyhbKClcXF1beyorLiReXFxcXHw/XSkvZywgXCJcXFxcJDFcIik7XG59XG5jb25zdCBzcGFjZUFuZFB1bmN0dWF0aW9uUmVnZXggPSBuZXcgUmVnRXhwKHNwYWNlQW5kUHVuY3R1YXRpb25SZWdleFN0ciwgXCJ5XCIpO1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3BhY2VPclB1bmN0dWF0aW9uKHMsIGluZGV4KSB7XG4gICAgc3BhY2VBbmRQdW5jdHVhdGlvblJlZ2V4Lmxhc3RJbmRleCA9IGluZGV4O1xuICAgIHJldHVybiBzcGFjZUFuZFB1bmN0dWF0aW9uUmVnZXgudGVzdChzKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1NwYWNlT3JQdW5jdHVhdGlvblJhbmdlKHMsIHN0YXJ0LCBlbmQpIHtcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICBpZiAoIWlzU3BhY2VPclB1bmN0dWF0aW9uKHMsIGkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5jb25zdCB3b3JkQm91bmRhcnlSZWdleCA9IC9cXHdcXFd8XFxXLi9pdXk7XG5leHBvcnQgZnVuY3Rpb24gaXNXb3JkQm91bmRhcnkocywgaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT09IDAgfHwgcy5sZW5ndGggPT0gaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHdvcmRCb3VuZGFyeVJlZ2V4Lmxhc3RJbmRleCA9IGluZGV4IC0gMTtcbiAgICByZXR1cm4gd29yZEJvdW5kYXJ5UmVnZXgudGVzdChzKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZ2V4cC5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbmV4cG9ydCB7IGdldE9iamVjdFByb3BlcnR5LCBzZXRPYmplY3RQcm9wZXJ0eSB9IGZyb20gXCIuL29iamVjdFByb3BlcnR5LmpzXCI7XG5leHBvcnQgeyBjcmVhdGVMaW1pdGVyIH0gZnJvbSBcIi4vbGltaXRlci5qc1wiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXhCcm93c2VyLmpzLm1hcCIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxpbWl0ZXIobGltaXQpIHtcbiAgICBsZXQgY3VycmVudCA9IDA7XG4gICAgbGV0IHJlc29sdmUgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHAgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFzeW5jIChjYWxsYmFjaykgPT4ge1xuICAgICAgICB3aGlsZSAoY3VycmVudCA+PSBsaW1pdCkge1xuICAgICAgICAgICAgaWYgKHAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHAgPSBuZXcgUHJvbWlzZSgocmVzKSA9PiAocmVzb2x2ZSA9IHJlcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgcDtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50Kys7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGN1cnJlbnQtLTtcbiAgICAgICAgICAgIGlmIChyZXNvbHZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBwID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpbWl0ZXIuanMubWFwIiwiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T2JqZWN0UHJvcGVydHkoZGF0YSwgb2JqZWN0TmFtZSwgbmFtZSkge1xuICAgIGlmIChuYW1lID09PSBcIlwiKSB7XG4gICAgICAgIHJldHVybiBkYXRhW29iamVjdE5hbWVdO1xuICAgIH1cbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gbmFtZS5zcGxpdChcIi5cIik7XG4gICAgbGV0IGxhc3ROYW1lID0gb2JqZWN0TmFtZTtcbiAgICBsZXQgY3VyciA9IGRhdGE7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHByb3BlcnRpZXMpIHtcbiAgICAgICAgLy8gUHJvdGVjdCBhZ2FpbnN0IHByb3RvdHlwZSBwb2xsdXRpb25cbiAgICAgICAgaWYgKG5hbWUgPT09IFwiX19wcm90b19fXCIgfHxcbiAgICAgICAgICAgIG5hbWUgPT09IFwiY29uc3RydWN0b3JcIiB8fFxuICAgICAgICAgICAgbmFtZSA9PT0gXCJwcm90b3R5cGVcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHByb3BlcnR5IG5hbWU6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXh0ID0gY3VycltsYXN0TmFtZV07XG4gICAgICAgIGlmIChuZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF5YmVJbmRleCA9IHBhcnNlSW50KG5hbWUpO1xuICAgICAgICBpZiAobWF5YmVJbmRleC50b1N0cmluZygpID09PSBuYW1lKSB7XG4gICAgICAgICAgICAvLyBBcnJheSBpbmRleFxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG5leHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3ROYW1lID0gbWF5YmVJbmRleDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbmV4dCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0TmFtZSA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgY3VyciA9IG5leHQ7XG4gICAgfVxuICAgIHJldHVybiBjdXJyW2xhc3ROYW1lXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRPYmplY3RQcm9wZXJ0eShkYXRhLCBvYmplY3ROYW1lLCBuYW1lLCB2YWx1ZSwgb3ZlcnJpZGUgPSBmYWxzZSkge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBuYW1lLnNwbGl0KFwiLlwiKTtcbiAgICBsZXQgbGFzdE5hbWUgPSBvYmplY3ROYW1lO1xuICAgIGxldCBjdXJyID0gZGF0YTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgcHJvcGVydGllcykge1xuICAgICAgICAvLyBQcm90ZWN0IGFnYWluc3QgcHJvdG90eXBlIHBvbGx1dGlvblxuICAgICAgICBpZiAobmFtZSA9PT0gXCJfX3Byb3RvX19cIiB8fFxuICAgICAgICAgICAgbmFtZSA9PT0gXCJjb25zdHJ1Y3RvclwiIHx8XG4gICAgICAgICAgICBuYW1lID09PSBcInByb3RvdHlwZVwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcHJvcGVydHkgbmFtZTogJHtuYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGxldCBuZXh0ID0gY3VycltsYXN0TmFtZV07XG4gICAgICAgIGNvbnN0IG1heWJlSW5kZXggPSBwYXJzZUludChuYW1lKTtcbiAgICAgICAgaWYgKG1heWJlSW5kZXgudG9TdHJpbmcoKSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgLy8gQXJyYXkgaW5kZXhcbiAgICAgICAgICAgIGlmIChuZXh0ID09PSB1bmRlZmluZWQgfHwgKG92ZXJyaWRlICYmICFBcnJheS5pc0FycmF5KG5leHQpKSkge1xuICAgICAgICAgICAgICAgIG5leHQgPSBbXTtcbiAgICAgICAgICAgICAgICBjdXJyW2xhc3ROYW1lXSA9IG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyID0gbmV4dDtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjdXJyKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW50ZXJuYWwgZXJyb3I6ICR7bGFzdE5hbWV9IGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdE5hbWUgPSBtYXliZUluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKG5leHQgPT09IHVuZGVmaW5lZCB8fCAob3ZlcnJpZGUgJiYgdHlwZW9mIG5leHQgIT09IFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHt9O1xuICAgICAgICAgICAgICAgIGN1cnJbbGFzdE5hbWVdID0gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnIgPSBuZXh0O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBlcnJvcjogJHtsYXN0TmFtZX0gaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdE5hbWUgPSBuYW1lO1xuICAgICAgICB9XG4gICAgfVxuICAgIGN1cnJbbGFzdE5hbWVdID0gdmFsdWU7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1vYmplY3RQcm9wZXJ0eS5qcy5tYXAiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1xuICAgIENvbnN0cnVjdGlvbkNhY2hlLFxuICAgIENvbnN0cnVjdGlvblBhcnQsXG4gICAgTWF0Y2hTZXQsXG4gICAgQ29uc3RydWN0aW9uLFxuICAgIGlzTWF0Y2hQYXJ0LFxufSBmcm9tIFwiYWdlbnQtY2FjaGVcIjtcblxuZnVuY3Rpb24gY3JlYXRlTWF0Y2hTZXRMaXN0R3JvdXAoZ3JvdXBOYW1lOiBzdHJpbmcsIG1hdGNoU2V0c0RpdjogRWxlbWVudCkge1xuICAgIGNvbnN0IGdyb3VwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgIC8vIFBsdXMgRGl2XG4gICAgY29uc3QgZ3JvdXBQbHVzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBncm91cFBsdXNEaXYuaW5uZXJUZXh0ID0gXCIrXCI7XG5cbiAgICBncm91cFBsdXNEaXYuc3R5bGUucGFkZGluZyA9IFwiMHB4XCI7XG4gICAgZ3JvdXBQbHVzRGl2LnN0eWxlLm1hcmdpbiA9IFwiNXB4XCI7XG4gICAgZ3JvdXBQbHVzRGl2LnN0eWxlLndpZHRoID0gXCIxNXB4XCI7XG4gICAgZ3JvdXBQbHVzRGl2LnN0eWxlLmhlaWdodCA9IFwiMTVweFwiO1xuICAgIGdyb3VwUGx1c0Rpdi5zdHlsZS50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuICAgIGdyb3VwUGx1c0Rpdi5zdHlsZS5ib3JkZXIgPSBcIjFweCBzb2xpZCBibGFja1wiO1xuXG4gICAgZ3JvdXBQbHVzRGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGlmIChncm91cERpdi5jb250YWlucyhncm91cEVsZW0pKSB7XG4gICAgICAgICAgICBncm91cERpdi5yZW1vdmVDaGlsZChncm91cEVsZW0pO1xuICAgICAgICAgICAgZ3JvdXBQbHVzRGl2LmlubmVyVGV4dCA9IFwiK1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3JvdXBEaXYuYXBwZW5kQ2hpbGQoZ3JvdXBFbGVtKTtcbiAgICAgICAgICAgIGdyb3VwUGx1c0Rpdi5pbm5lclRleHQgPSBcIi1cIjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTmFtZSBEaXZcbiAgICBjb25zdCBncm91cE5hbWVEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGdyb3VwTmFtZURpdi5pbm5lclRleHQgPSBncm91cE5hbWU7XG4gICAgZ3JvdXBOYW1lRGl2LnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuXG4gICAgZ3JvdXBEaXYuYXBwZW5kQ2hpbGQoZ3JvdXBQbHVzRGl2KTtcbiAgICBncm91cERpdi5hcHBlbmRDaGlsZChncm91cE5hbWVEaXYpO1xuXG4gICAgbWF0Y2hTZXRzRGl2LmFwcGVuZENoaWxkKGdyb3VwRGl2KTtcblxuICAgIC8vIEdyb3VwIERpdlxuICAgIGNvbnN0IGdyb3VwRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZ3JvdXBFbGVtLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICAgIGdyb3VwRWxlbS5zdHlsZS5sZWZ0ID0gXCIzMHB4XCI7XG5cbiAgICByZXR1cm4gZ3JvdXBFbGVtO1xufVxuXG5sZXQgY29uc3RydWN0aW9uVmlld3M6IHtcbiAgICBjb25zdHJ1Y3Rpb246IENvbnN0cnVjdGlvbjtcbiAgICBlbGVtOiBFbGVtZW50O1xuICAgIHBhcnRWaWV3czogeyBwYXJ0OiBDb25zdHJ1Y3Rpb25QYXJ0OyBlbGVtOiBFbGVtZW50IH1bXTtcbn1bXSA9IFtdO1xubGV0IHNlbGVjdGVkTWF0Y2hTZXRzOiBNYXRjaFNldFtdID0gW107XG5jb25zdCBtYXRjaFNldEVsZW1NYXAgPSBuZXcgTWFwPE1hdGNoU2V0LCBFbGVtZW50PigpO1xuZnVuY3Rpb24gdG9NYXRjaFNldEVsZW0obWF0Y2hTZXRzOiBNYXRjaFNldFtdKSB7XG4gICAgcmV0dXJuIG1hdGNoU2V0cy5tYXAoKG0pID0+IG1hdGNoU2V0RWxlbU1hcC5nZXQobSkhKTtcbn1cbmZ1bmN0aW9uIHNlbGVjdE1hdGNoU2V0cyhuZXdTZWxlY3RlZE1hdGNoU2V0czogTWF0Y2hTZXRbXSkge1xuICAgIHRvTWF0Y2hTZXRFbGVtKHNlbGVjdGVkTWF0Y2hTZXRzKS5mb3JFYWNoKChzKSA9PlxuICAgICAgICBzLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKSxcbiAgICApO1xuICAgIHRvTWF0Y2hTZXRFbGVtKG5ld1NlbGVjdGVkTWF0Y2hTZXRzKS5mb3JFYWNoKChzKSA9PlxuICAgICAgICBzLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKSxcbiAgICApO1xuICAgIHNlbGVjdGVkTWF0Y2hTZXRzID0gbmV3U2VsZWN0ZWRNYXRjaFNldHM7XG4gICAgY29uc3RydWN0aW9uVmlld3MuZm9yRWFjaCgoY29uc3RydWN0aW9uVmlldykgPT4ge1xuICAgICAgICBjb25zdCBzaG93ID1cbiAgICAgICAgICAgIHNlbGVjdGVkTWF0Y2hTZXRzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgc2VsZWN0ZWRNYXRjaFNldHMuZXZlcnkoKG0pID0+XG4gICAgICAgICAgICAgICAgY29uc3RydWN0aW9uVmlldy5wYXJ0Vmlld3Muc29tZShcbiAgICAgICAgICAgICAgICAgICAgKHBhcnRWaWV3KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgaXNNYXRjaFBhcnQocGFydFZpZXcucGFydCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRWaWV3LnBhcnQubWF0Y2hTZXQgPT09IG0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIGlmIChzaG93KSB7XG4gICAgICAgICAgICBjb25zdHJ1Y3Rpb25WaWV3LmVsZW0uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICAgIGNvbnN0cnVjdGlvblZpZXcucGFydFZpZXdzLmZvckVhY2goKHBhcnRWaWV3KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTWF0Y2hQYXJ0KHBhcnRWaWV3LnBhcnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE1hdGNoU2V0cy5pbmNsdWRlcyhwYXJ0Vmlldy5wYXJ0Lm1hdGNoU2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydFZpZXcuZWxlbS5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Vmlldy5lbGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3RydWN0aW9uVmlldy5lbGVtLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBzZWxlY3RlZE1hdGNoU2V0RGV0YWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgIFwic2VsZWN0ZWRNYXRjaFNldERldGFpbFwiLFxuICAgICkhO1xuICAgIHNlbGVjdGVkTWF0Y2hTZXREZXRhaWwuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBzZWxlY3RlZE1hdGNoU2V0cy5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoU2V0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgbWF0Y2hTZXREaXYuY2xhc3NMaXN0LmFkZChcIm1hdGNoc2V0ZGV0YWlsc1wiKTtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgzXCIpO1xuICAgICAgICBoZWFkZXIuaW5uZXJUZXh0ID0gbS5mdWxsTmFtZTtcbiAgICAgICAgbWF0Y2hTZXREaXYuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcblxuICAgICAgICBtLm1hdGNoZXMuZm9yRWFjaCgobWF0Y2gpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIG1hdGNoRGl2LmlubmVyVGV4dCA9IG1hdGNoO1xuICAgICAgICAgICAgbWF0Y2hTZXREaXYuYXBwZW5kQ2hpbGQobWF0Y2hEaXYpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VsZWN0ZWRNYXRjaFNldERldGFpbC5hcHBlbmRDaGlsZChtYXRjaFNldERpdik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hdGNoU2V0TGlzdFZpZXcoY2FjaGU6IENvbnN0cnVjdGlvbkNhY2hlKSB7XG4gICAgY29uc3QgbWF0Y2hTZXRzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXRjaHNldHNcIikhO1xuXG4gICAgY29uc3QgbWF0Y2hTZXRHcm91cHMgPSBuZXcgTWFwPHN0cmluZywgTWF0Y2hTZXRbXT4oKTtcbiAgICBmb3IgKGNvbnN0IG1hdGNoU2V0IG9mIGNhY2hlLm1hdGNoU2V0cykge1xuICAgICAgICBjb25zdCBncm91cCA9IG1hdGNoU2V0R3JvdXBzLmdldChtYXRjaFNldC5uYW1lKTtcbiAgICAgICAgaWYgKGdyb3VwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1hdGNoU2V0R3JvdXBzLnNldChtYXRjaFNldC5uYW1lLCBbbWF0Y2hTZXRdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdyb3VwLnB1c2gobWF0Y2hTZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGlzdCB0aGUgYWN0aW9uIGFuZCB0aGVuIHBhcmFtZXRlciBwYXJ0cyBmaXJzdC5cbiAgICBjb25zdCBzb3J0ZWRNYXRjaFNldEdyb3VwcyA9IEFycmF5LmZyb20obWF0Y2hTZXRHcm91cHMuZW50cmllcygpKS5zb3J0KFxuICAgICAgICAoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYW5hbWUgPSBhWzBdLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgIGNvbnN0IGJuYW1lID0gYlswXS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICBpZiAoYW5hbWUubGVuZ3RoICE9PSBibmFtZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm5hbWUubGVuZ3RoIC0gYW5hbWUubGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gYW5hbWVbMF0ubG9jYWxlQ29tcGFyZShibmFtZVswXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMgIT09IDBcbiAgICAgICAgICAgICAgICAgICAgPyBjXG4gICAgICAgICAgICAgICAgICAgIDogYW5hbWUubGVuZ3RoID09PSAxXG4gICAgICAgICAgICAgICAgICAgICAgPyAwXG4gICAgICAgICAgICAgICAgICAgICAgOiBhbmFtZVsxXS5sb2NhbGVDb21wYXJlKGJuYW1lWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICApO1xuICAgIHNvcnRlZE1hdGNoU2V0R3JvdXBzLmZvckVhY2goKFtuYW1lLCBtYXRjaFNldHNdKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoU2V0TGlzdEdyb3VwID1cbiAgICAgICAgICAgIG1hdGNoU2V0cy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgICAgICA/IG1hdGNoU2V0c0RpdlxuICAgICAgICAgICAgICAgIDogY3JlYXRlTWF0Y2hTZXRMaXN0R3JvdXAobmFtZSwgbWF0Y2hTZXRzRGl2KTtcbiAgICAgICAgbWF0Y2hTZXRzLm1hcCgobSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hTZXREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgbWF0Y2hTZXREaXYuY2xhc3NMaXN0LmFkZChcIm1hdGNoc2V0XCIpO1xuICAgICAgICAgICAgbWF0Y2hTZXREaXYuaW5uZXJUZXh0ID0gbS5mdWxsTmFtZTtcbiAgICAgICAgICAgIG1hdGNoU2V0RGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkTWF0Y2hTZXRzLmluY2x1ZGVzKG0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RNYXRjaFNldHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRNYXRjaFNldHMuZmlsdGVyKChzKSA9PiBzICE9PSBtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RNYXRjaFNldHMoWy4uLnNlbGVjdGVkTWF0Y2hTZXRzLCBtXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RNYXRjaFNldHMoW21dKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbWF0Y2hTZXRMaXN0R3JvdXAuYXBwZW5kQ2hpbGQobWF0Y2hTZXREaXYpO1xuXG4gICAgICAgICAgICBtYXRjaFNldEVsZW1NYXAuc2V0KG0sIG1hdGNoU2V0RGl2KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnN0cnVjdGlvblZpZXcoY2FjaGU6IENvbnN0cnVjdGlvbkNhY2hlLCBuYW1lc3BhY2U6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbnN0cnVjdGlvbnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnN0cnVjdGlvbnNcIikhO1xuICAgIGNvbnN0IGNvbnN0cnVjdGlvblRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRhYmxlXCIpO1xuICAgIGNvbnN0cnVjdGlvbnNEaXYucmVwbGFjZUNoaWxkcmVuKGNvbnN0cnVjdGlvblRhYmxlKTtcblxuICAgIGNvbnN0IGNvbnN0cnVjdGlvbk5hbWVzcGFjZSA9IGNhY2hlLmdldENvbnN0cnVjdGlvbk5hbWVzcGFjZShuYW1lc3BhY2UpO1xuICAgIGNvbnN0cnVjdGlvblZpZXdzID0gY29uc3RydWN0aW9uTmFtZXNwYWNlXG4gICAgICAgID8gY29uc3RydWN0aW9uTmFtZXNwYWNlLmNvbnN0cnVjdGlvbnMubWFwKChjb25zdHJ1Y3Rpb24sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnN0cnVjdGlvbkVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XG5cbiAgICAgICAgICAgICAgY29uc3QgY29uc3RydWN0aW9uSW5kZXhFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xuICAgICAgICAgICAgICBjb25zdHJ1Y3Rpb25JbmRleEVsZW0uaW5uZXJUZXh0ID0gaW5kZXgudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgY29uc3RydWN0aW9uRWxlbS5hcHBlbmRDaGlsZChjb25zdHJ1Y3Rpb25JbmRleEVsZW0pO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHBhcnRWaWV3cyA9IGNvbnN0cnVjdGlvbi5wYXJ0cy5tYXAoKHApID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xuICAgICAgICAgICAgICAgICAgY29uc3RydWN0aW9uRWxlbS5hcHBlbmRDaGlsZChwYXJ0RWxlbSk7XG4gICAgICAgICAgICAgICAgICBwYXJ0RWxlbS5pbm5lclRleHQgPSBgJHtwLnRvU3RyaW5nKCl9JHtcbiAgICAgICAgICAgICAgICAgICAgICBwLndpbGRjYXJkTW9kZSA/IFwiKHcpXCIgOiBcIlwiXG4gICAgICAgICAgICAgICAgICB9YDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7IHBhcnQ6IHAsIGVsZW06IHBhcnRFbGVtIH07XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBjb25zdHJ1Y3Rpb25FbGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZWxlY3RNYXRjaFNldHMoXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0aW9uLnBhcnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoaXNNYXRjaFBhcnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKHApID0+IHAubWF0Y2hTZXQpLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGNvbnN0cnVjdGlvblRhYmxlLmFwcGVuZENoaWxkKGNvbnN0cnVjdGlvbkVsZW0pO1xuICAgICAgICAgICAgICByZXR1cm4geyBjb25zdHJ1Y3Rpb24sIGVsZW06IGNvbnN0cnVjdGlvbkVsZW0sIHBhcnRWaWV3cyB9O1xuICAgICAgICAgIH0pXG4gICAgICAgIDogW107XG59XG5cbmZ1bmN0aW9uIGNsZWFyQ2FjaGVWaWV3KGxvYWRpbmc6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBjb25zdHJ1Y3Rpb25zRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zdHJ1Y3Rpb25zXCIpITtcbiAgICBjb25zdHJ1Y3Rpb25zRGl2LnJlcGxhY2VDaGlsZHJlbigpO1xuICAgIGNvbnN0IG1hdGNoU2V0c0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWF0Y2hzZXRzXCIpITtcbiAgICBtYXRjaFNldHNEaXYucmVwbGFjZUNoaWxkcmVuKCk7XG5cbiAgICBpZiAobG9hZGluZykge1xuICAgICAgICBjb25zdHJ1Y3Rpb25zRGl2LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJMb2FkaW5nIGNhY2hlLi4uXCIpLFxuICAgICAgICApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2FjaGVWaWV3KGNhY2hlOiBDb25zdHJ1Y3Rpb25DYWNoZSwgbmFtZXNwYWNlOiBzdHJpbmcpIHtcbiAgICBjcmVhdGVDb25zdHJ1Y3Rpb25WaWV3KGNhY2hlLCBuYW1lc3BhY2UpO1xuICAgIGNyZWF0ZU1hdGNoU2V0TGlzdFZpZXcoY2FjaGUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29uc3RydWN0aW9uQ2FjaGUoc2Vzc2lvbjogc3RyaW5nLCBjYWNoZU5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmZXRjaChgL3Nlc3Npb24vJHtzZXNzaW9ufS9jYWNoZS8ke2NhY2hlTmFtZX1gKTtcbiAgICBpZiAoY29udGVudC5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIHRvIGxvYWQgY29uc3RydWN0aW9uIGNhY2hlOiAke2NvbnRlbnQuc3RhdHVzVGV4dH1gLFxuICAgICAgICApO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZURhdGEgPSBhd2FpdCBjb250ZW50Lmpzb24oKTtcbiAgICByZXR1cm4gQ29uc3RydWN0aW9uQ2FjaGUuZnJvbUpTT04oY2FjaGVEYXRhKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ2FjaGVWaWV3KHVpOiBDYWNoZVNlbGVjdGlvblVJKSB7XG4gICAgY2xlYXJDYWNoZVZpZXcodHJ1ZSk7XG4gICAgaWYgKGN1cnJlbnRDYWNoZSkge1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSB1aS5uYW1lc3BhY2UudmFsdWU7XG4gICAgICAgIGNyZWF0ZUNhY2hlVmlldyhjdXJyZW50Q2FjaGUsIG5hbWVzcGFjZSk7XG4gICAgfVxufVxuXG4vLyBDYWNoZSBzZWxlY3Rpb25cbnR5cGUgQ2FjaGVFbnRyeSA9IHtcbiAgICBleHBsYWluZXI6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgY3VycmVudDogYm9vbGVhbjtcbn07XG5cbnR5cGUgQ2FjaGVTZWxlY3Rpb25VSSA9IHtcbiAgICBleHBsYWluZXI6IEhUTUxTZWxlY3RFbGVtZW50O1xuICAgIG5hbWU6IEhUTUxTZWxlY3RFbGVtZW50O1xuICAgIG5hbWVzcGFjZTogSFRNTFNlbGVjdEVsZW1lbnQ7XG59O1xuXG5sZXQgY3VycmVudFNlc3Npb246IHN0cmluZyB8IHVuZGVmaW5lZDtcbmxldCBjdXJyZW50Q2FjaGVOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5sZXQgY3VycmVudENhY2hlOiBDb25zdHJ1Y3Rpb25DYWNoZSB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gdXBkYXRlQ2FjaGVTZWxlY3Rpb24odWk6IENhY2hlU2VsZWN0aW9uVUksIGVudHJpZXM6IENhY2hlRW50cnlbXSkge1xuICAgIGNvbnN0IGZpbHRlcmVkID0gZW50cmllcy5maWx0ZXIoKGUpID0+IGUuZXhwbGFpbmVyID09PSB1aS5leHBsYWluZXIudmFsdWUpO1xuICAgIGxldCBjdXJyZW50SW5kZXggPSAwO1xuICAgIHVpLm5hbWUucmVwbGFjZUNoaWxkcmVuKFxuICAgICAgICAuLi5maWx0ZXJlZC5tYXAoKGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICAgICAgb3B0aW9uLnRleHQgPSBgJHtlLm5hbWV9ICR7ZS5jdXJyZW50ID8gXCIgKGN1cnJlbnQpXCIgOiBcIlwifWA7XG4gICAgICAgICAgICBvcHRpb24udmFsdWUgPSBlLm5hbWU7XG4gICAgICAgICAgICBpZiAoZS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uO1xuICAgICAgICB9KSxcbiAgICApO1xuICAgIHVpLm5hbWUuc2VsZWN0ZWRJbmRleCA9IGN1cnJlbnRJbmRleDtcblxuICAgIHVwZGF0ZVRyYW5zbGF0b3JTZWxlY3Rpb24odWkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVUcmFuc2xhdG9yU2VsZWN0aW9uKHVpOiBDYWNoZVNlbGVjdGlvblVJKSB7XG4gICAgY2xlYXJDYWNoZVZpZXcodHJ1ZSk7XG4gICAgY29uc3Qgc2Vzc2lvblNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICBcInNlc3Npb25zXCIsXG4gICAgKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgICBjb25zdCBzZXNzaW9uID0gc2Vzc2lvblNlbGVjdC52YWx1ZTtcbiAgICBjb25zdCBjYWNoZU5hbWUgPSB1aS5uYW1lLnZhbHVlO1xuICAgIGNvbnN0IGNhY2hlID0gYXdhaXQgbG9hZENvbnN0cnVjdGlvbkNhY2hlKHNlc3Npb24sIGNhY2hlTmFtZSk7XG4gICAgaWYgKFxuICAgICAgICBzZXNzaW9uID09PSBzZXNzaW9uU2VsZWN0LnZhbHVlICYmXG4gICAgICAgIGNhY2hlTmFtZSA9PT0gdWkubmFtZS52YWx1ZSAmJlxuICAgICAgICBjdXJyZW50U2Vzc2lvbiA9PT0gc2Vzc2lvbiAmJlxuICAgICAgICBjYWNoZU5hbWUgIT09IGN1cnJlbnRDYWNoZU5hbWVcbiAgICApIHtcbiAgICAgICAgY3VycmVudENhY2hlTmFtZSA9IGNhY2hlTmFtZTtcbiAgICAgICAgY3VycmVudENhY2hlID0gY2FjaGU7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZXMgPSBjYWNoZS5nZXRDb25zdHJ1Y3Rpb25OYW1lc3BhY2VzKCk7XG4gICAgICAgIHVpLm5hbWVzcGFjZS5yZXBsYWNlQ2hpbGRyZW4oXG4gICAgICAgICAgICAuLi5uYW1lc3BhY2VzLm1hcCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgICAgICAgICAgICAgb3B0aW9uLnRleHQgPSBlO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb247XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgICAgdXBkYXRlQ2FjaGVWaWV3KHVpKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhY2hlU2VsZWN0aW9uKGVudHJpZXM6IENhY2hlRW50cnlbXSkge1xuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjbGVhckNhY2hlU2VsZWN0aW9uKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV4cGxhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7XG4gICAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7XG4gICAgY29uc3QgbmFtZXNwYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcblxuICAgIGV4cGxhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgdXBkYXRlQ2FjaGVTZWxlY3Rpb24odWksIGVudHJpZXMpO1xuICAgIH0pO1xuICAgIG5hbWUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVRyYW5zbGF0b3JTZWxlY3Rpb24odWkpO1xuICAgIH0pO1xuICAgIG5hbWVzcGFjZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgdXBkYXRlQ2FjaGVWaWV3KHVpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNhY2hlc0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FjaGVTZWxlY3Rpb25cIikhO1xuICAgIGNhY2hlc0Rpdi5yZXBsYWNlQ2hpbGRyZW4oXG4gICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIEV4cGxhaW5lcjogXCIpLFxuICAgICAgICBleHBsYWluZXIsXG4gICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIENhY2hlOiBcIiksXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFRyYW5zbGF0b3I6IFwiKSxcbiAgICAgICAgbmFtZXNwYWNlLFxuICAgICk7XG5cbiAgICBjb25zdCB1aSA9IHsgZXhwbGFpbmVyLCBuYW1lLCBuYW1lc3BhY2UgfTtcblxuICAgIGV4cGxhaW5lci5yZXBsYWNlQ2hpbGRyZW4oXG4gICAgICAgIC4uLkFycmF5LmZyb20obmV3IFNldChlbnRyaWVzLm1hcCgoZSkgPT4gZS5leHBsYWluZXIpKS52YWx1ZXMoKSkubWFwKFxuICAgICAgICAgICAgKHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICAgICAgICAgIG9wdGlvbi50ZXh0ID0gdDtcbiAgICAgICAgICAgICAgICBvcHRpb24udmFsdWUgPSB0O1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICApLFxuICAgICk7XG5cbiAgICB1cGRhdGVDYWNoZVNlbGVjdGlvbih1aSwgZW50cmllcyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNlc3Npb25DYWNoZUluZm8oc2Vzc2lvbjogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2FjaGVzUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgL3Nlc3Npb24vJHtzZXNzaW9ufS9jYWNoZXNgKTtcbiAgICAgICAgcmV0dXJuIGNhY2hlc1Jlc3BvbnNlLmpzb24oKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJDYWNoZVNlbGVjdGlvbihsb2FkaW5nOiBib29sZWFuKSB7XG4gICAgY29uc3QgY2FjaGVzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWNoZVNlbGVjdGlvblwiKSE7XG4gICAgY2FjaGVzRGl2LnJlcGxhY2VDaGlsZHJlbigpO1xuICAgIGNhY2hlc0Rpdi5hcHBlbmRDaGlsZChcbiAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXG4gICAgICAgICAgICBsb2FkaW5nID8gXCJMb2FkaW5nIGNhY2hlIGZyb20gc2Vzc2lvbi4uLlwiIDogXCJObyBjYWNoZSBhdmFpbGFibGVcIixcbiAgICAgICAgKSxcbiAgICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0aWFsaXplVUkoKSB7XG4gICAgY29uc3Qgc2Vzc2lvblNlbGVjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICBcInNlc3Npb25zXCIsXG4gICAgKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgICBjb25zdCBzZXNzaW9uc1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvc2Vzc2lvbnNcIik7XG4gICAgY29uc3Qgc2Vzc2lvbnMgPSBhd2FpdCBzZXNzaW9uc1Jlc3BvbnNlLmpzb24oKTtcbiAgICBzZXNzaW9ucy5mb3JFYWNoKChzZXNzaW9uOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICAgICAgb3B0aW9uLnRleHQgPSBzZXNzaW9uO1xuICAgICAgICBzZXNzaW9uU2VsZWN0aW9uLmFkZChvcHRpb24pO1xuICAgIH0pO1xuXG4gICAgc2Vzc2lvblNlbGVjdGlvbi5zZWxlY3RlZEluZGV4ID0gc2Vzc2lvblNlbGVjdGlvbi5vcHRpb25zLmxlbmd0aCAtIDE7XG5cbiAgICBjb25zdCB1cGRhdGVDYWNoZVNlbGVjdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY2xlYXJDYWNoZVNlbGVjdGlvbih0cnVlKTtcbiAgICAgICAgY2xlYXJDYWNoZVZpZXcoZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSBzZXNzaW9uU2VsZWN0aW9uLnZhbHVlO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgZ2V0U2Vzc2lvbkNhY2hlSW5mbyhzZXNzaW9uKTtcbiAgICAgICAgaWYgKHNlc3Npb24gPT09IHNlc3Npb25TZWxlY3Rpb24udmFsdWUgJiYgY3VycmVudFNlc3Npb24gIT09IHNlc3Npb24pIHtcbiAgICAgICAgICAgIGN1cnJlbnRTZXNzaW9uID0gc2Vzc2lvbjtcbiAgICAgICAgICAgIGNyZWF0ZUNhY2hlU2VsZWN0aW9uKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzZXNzaW9uU2VsZWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdXBkYXRlQ2FjaGVTZWxlY3Rpb24pO1xuICAgIGF3YWl0IHVwZGF0ZUNhY2hlU2VsZWN0aW9uKCk7XG59XG5cbmluaXRpYWxpemVVSSgpLmNhdGNoKChlKSA9PiB7XG4gICAgY29uc3QgY2FjaGVFeHBsb3JlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKSE7XG4gICAgY2FjaGVFeHBsb3Jlci5pbm5lckhUTUwgPSBgRXJyb3IgcmVuZGVyaW5nIGNvbnN0cnVjdGlvbiBjYWNoZTogJHtlfWA7XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==