/*!
* json.js
* http://www.JSON.org/json2.js | http://www.JSON.org/js.html
*/
/*
http://www.JSON.org/json2.js
2008-07-15

Public Domain.

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

See http://www.JSON.org/js.html

This file creates a global JSON object containing two methods: stringify
and parse.

JSON.stringify(value, replacer, space)
value       any JavaScript value, usually an object or array.

replacer    an optional parameter that determines how object
values are stringified for objects. It can be a
function or an array.

space       an optional parameter that specifies the indentation
of nested structures. If it is omitted, the text will
be packed without extra whitespace. If it is a number,
it will specify the number of spaces to indent at each
level. If it is a string (such as '\t' or '&nbsp;'),
it contains the characters used to indent at each level.

This method produces a JSON text from a JavaScript value.

When an object value is found, if the object contains a toJSON
method, its toJSON method will be called and the result will be
stringified. A toJSON method does not serialize: it returns the
value represented by the name/value pair that should be serialized,
or undefined if nothing should be serialized. The toJSON method
will be passed the key associated with the value, and this will be
bound to the object holding the key.

For example, this would serialize Dates as ISO strings.

Date.prototype.toJSON = function (key) {
function f(n) {
// Format integers to have at least two digits.
return n < 10 ? '0' + n : n;
}

return this.getUTCFullYear()   + '-' +
f(this.getUTCMonth() + 1) + '-' +
f(this.getUTCDate())      + 'T' +
f(this.getUTCHours())     + ':' +
f(this.getUTCMinutes())   + ':' +
f(this.getUTCSeconds())   + 'Z';
};

You can provide an optional replacer method. It will be passed the
key and value of each member, with this bound to the containing
object. The value that is returned from your method will be
serialized. If your method returns undefined, then the member will
be excluded from the serialization.

If the replacer parameter is an array, then it will be used to
select the members to be serialized. It filters the results such
that only members with keys listed in the replacer array are
stringified.

Values that do not have JSON representations, such as undefined or
functions, will not be serialized. Such values in objects will be
dropped; in arrays they will be replaced with null. You can use
a replacer function to replace those with JSON values.
JSON.stringify(undefined) returns undefined.

The optional space parameter produces a stringification of the
value that is filled with line breaks and indentation to make it
easier to read.

If the space parameter is a non-empty string, then that string will
be used for indentation. If the space parameter is a number, then
the indentation will be that many spaces.

Example:

text = JSON.stringify(['e', {pluribus: 'unum'}]);
// text is '["e",{"pluribus":"unum"}]'


text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
// text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

text = JSON.stringify([new Date()], function (key, value) {
return this[key] instanceof Date ?
'Date(' + this[key] + ')' : value;
});
// text is '["Date(---current time---)"]'


JSON.parse(text, reviver)
This method parses a JSON text to produce an object or array.
It can throw a SyntaxError exception.

The optional reviver parameter is a function that can filter and
transform the results. It receives each of the keys and values,
and its return value is used instead of the original value.
If it returns what it received, then the structure is not modified.
If it returns undefined then the member is deleted.

Example:

// Parse the text. Values that look like ISO date strings will
// be converted to Date objects.

myData = JSON.parse(text, function (key, value) {
var a;
if (typeof value === 'string') {
a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
if (a) {
return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
+a[5], +a[6]));
}
}
return value;
});

myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
var d;
if (typeof value === 'string' &&
value.slice(0, 5) === 'Date(' &&
value.slice(-1) === ')') {
d = new Date(value.slice(5, -1));
if (d) {
return d;
}
}
return value;
});


This is a reference implementation. You are free to copy, modify, or
redistribute.

This code should be minified before deployment.
See http://javascript.crockford.com/jsmin.html

USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
NOT CONTROL.
*/

/*jslint evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", call,
charCodeAt, getUTCDate, getUTCFullYear, getUTCHours, getUTCMinutes,
getUTCMonth, getUTCSeconds, hasOwnProperty, join, lastIndex, length,
parse, propertyIsEnumerable, prototype, push, replace, slice, stringify,
test, toJSON, toString
*/

if (!this.JSON) {

    // Create a JSON object only if one does not already exist. We create the
    // object in a closure to avoid creating global variables.

    JSON = function () {

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear() + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate()) + 'T' +
                 f(this.getUTCHours()) + ':' +
                 f(this.getUTCMinutes()) + ':' +
                 f(this.getUTCSeconds()) + 'Z';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            escapeable.lastIndex = 0;
            return escapeable.test(string) ?
                '"' + string.replace(escapeable, function (a) {
                    var c = meta[a];
                    if (typeof c === 'string') {
                        return c;
                    }
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':

                    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':

                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                    // If the type is 'object', we might be dealing with an object or an array or
                    // null.

                case 'object':

                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

                    // Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

                    // If the object has a dontEnum length property, we'll treat it as an array.

                    if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

                        // The object is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.

                        v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                                partial.join(',\n' + gap) + '\n' +
                                    mind + ']' :
                              '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

                    // If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            k = rep[i];
                            if (typeof k === 'string') {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {

                        // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.

                    v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                            mind + '}' : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

        // Return the JSON object containing the stringify and parse methods.

        return {
            stringify: function (value, replacer, space) {

                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

                // If the space parameter is a number, make an indent string containing that
                // many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

                    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                         typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

                // Make a fake root object containing our value under the key of ''.
                // Return the result of stringifying the value.

                return str('', { '': value });
            },


            parse: function (text, reviver) {

                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


                // Parsing happens in four stages. In the first stage, we replace certain
                // Unicode characters with escape sequences. JavaScript handles many characters
                // incorrectly, either silently deleting them, or treating them as line endings.

                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' + ('0000' +
                                (+(a.charCodeAt(0))).toString(16)).slice(-4);
                    });
                }

                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with '()' and 'new'
                // because they can cause invocation, and '=' because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.

                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                // replace all simple value tokens with ']' characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or ']' or
                // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function' ?
                        walk({ '': j }, '') : j;
                }

                // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            }
        };
    } ();
}/*
jQuery.
Modified by ATDW.

DO NOT OVERRIDE THIS WITH THE LATEST JQUERY WITHOUT MERGING OUR CHANGES IN.
This is because not all of our changes have been contributed to the jQuery project (some of them are ATDW specific).

Mark ATDW modifications with a comment that includes the string "ATDW".
eg. // ATDW modification - only load if not already loaded

*/

/*!
* jQuery JavaScript Library v1.7.2
* http://jquery.com/
*
* Copyright 2011, John Resig
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* Includes Sizzle.js
* http://sizzlejs.com/
* Copyright 2011, The Dojo Foundation
* Released under the MIT, BSD, and GPL Licenses.
*
* This file has been modified by ATDW prior to minification.
*
* Date: Wed Mar 21 12:46:34 2012 -0700
*/
// ATDW modification - only load if not already loaded
if (window.jQuery === undefined || parseFloat(window.jQuery.fn.jquery) < 1.7) {
    (function(window, undefined) {

        // Use the correct document accordingly with window argument (sandbox)
        var document = window.document,
            navigator = window.navigator,
            location = window.location;
        var jQuery = (function() {

            // Define a local copy of jQuery
            var jQuery = function(selector, context) {
                // The jQuery object is actually just the init constructor 'enhanced'
                return new jQuery.fn.init(selector, context, rootjQuery);
            },
                // Map over jQuery in case of overwrite
                _jQuery = window.jQuery,
                // Map over the $ in case of overwrite
                _$ = window.$,
                // A central reference to the root jQuery(document)
                rootjQuery,
                // A simple way to check for HTML strings or ID strings
            // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
                quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/ ,
                // Check if a string has a non-whitespace character in it
                rnotwhite = /\S/ ,
                // Used for trimming whitespace
                trimLeft = /^\s+/ ,
                trimRight = /\s+$/ ,
                // Match a standalone tag
                rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/ ,
                // JSON RegExp
                rvalidchars = /^[\],:{}\s]*$/ ,
                rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g ,
                rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g ,
                rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g ,
                // Useragent RegExp
                rwebkit = /(webkit)[ \/]([\w.]+)/ ,
                ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/ ,
                rmsie = /(msie) ([\w.]+)/ ,
                rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/ ,
                // Matches dashed string for camelizing
                rdashAlpha = /-([a-z]|[0-9])/ig ,
                rmsPrefix = /^-ms-/ ,
                // Used by jQuery.camelCase as callback to replace()
                fcamelCase = function(all, letter) {
                    return (letter + "").toUpperCase();
                },
                // Keep a UserAgent string for use with jQuery.browser
                userAgent = navigator.userAgent,
                // For matching the engine and version of the browser
                browserMatch,
                // The deferred used on DOM ready
                readyList,
                // The ready event handler
                DOMContentLoaded,
                // Save a reference to some core methods
                toString = Object.prototype.toString,
                hasOwn = Object.prototype.hasOwnProperty,
                push = Array.prototype.push,
                slice = Array.prototype.slice,
                trim = String.prototype.trim,
                indexOf = Array.prototype.indexOf,
                // [[Class]] -> type pairs
                class2type = { };

            jQuery.fn = jQuery.prototype = {
                constructor: jQuery,
                init: function(selector, context, rootjQuery) {
                    var match, elem, ret, doc;

                    // Handle $(""), $(null), or $(undefined)
                    if (!selector) {
                        return this;
                    }

                    // Handle $(DOMElement)
                    if (selector.nodeType) {
                        this.context = this[0] = selector;
                        this.length = 1;
                        return this;
                    }

                    // The body element only exists once, optimize finding it
                    if (selector === "body" && !context && document.body) {
                        this.context = document;
                        this[0] = document.body;
                        this.selector = selector;
                        this.length = 1;
                        return this;
                    }

                    // Handle HTML strings
                    if (typeof selector === "string") {
                        // Are we dealing with HTML string or an ID?
                        if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                            // Assume that strings that start and end with <> are HTML and skip the regex check
                            match = [null, selector, null];

                        } else {
                            match = quickExpr.exec(selector);
                        }

                        // Verify a match, and that no context was specified for #id
                        if (match && (match[1] || !context)) {

                            // HANDLE: $(html) -> $(array)
                            if (match[1]) {
                                context = context instanceof jQuery ? context[0] : context;
                                doc = (context ? context.ownerDocument || context : document);

                                // If a single string is passed in and it's a single tag
                                // just do a createElement and skip the rest
                                ret = rsingleTag.exec(selector);

                                if (ret) {
                                    if (jQuery.isPlainObject(context)) {
                                        selector = [document.createElement(ret[1])];
                                        jQuery.fn.attr.call(selector, context, true);

                                    } else {
                                        selector = [doc.createElement(ret[1])];
                                    }

                                } else {
                                    ret = jQuery.buildFragment([match[1]], [doc]);
                                    selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
                                }

                                return jQuery.merge(this, selector);

                                // HANDLE: $("#id")
                            } else {
                                elem = document.getElementById(match[2]);

                                // Check parentNode to catch when Blackberry 4.6 returns
                                // nodes that are no longer in the document #6963
                                if (elem && elem.parentNode) {
                                    // Handle the case where IE and Opera return items
                                    // by name instead of ID
                                    if (elem.id !== match[2]) {
                                        return rootjQuery.find(selector);
                                    }

                                    // Otherwise, we inject the element directly into the jQuery object
                                    this.length = 1;
                                    this[0] = elem;
                                }

                                this.context = document;
                                this.selector = selector;
                                return this;
                            }

                            // HANDLE: $(expr, $(...))
                        } else if (!context || context.jquery) {
                            return (context || rootjQuery).find(selector);

                            // HANDLE: $(expr, context)
                            // (which is just equivalent to: $(context).find(expr)
                        } else {
                            return this.constructor(context).find(selector);
                        }

                        // HANDLE: $(function)
                        // Shortcut for document ready
                    } else if (jQuery.isFunction(selector)) {
                        return rootjQuery.ready(selector);
                    }

                    if (selector.selector !== undefined) {
                        this.selector = selector.selector;
                        this.context = selector.context;
                    }

                    return jQuery.makeArray(selector, this);
                },

                // Start with an empty selector
                selector: "",

                // The current version of jQuery being used
                jquery: "1.7.2",

                // The default length of a jQuery object is 0
                length: 0,

                // The number of elements contained in the matched element set
                size: function() {
                    return this.length;
                },

                toArray: function() {
                    return slice.call(this, 0);
                },

                // Get the Nth element in the matched element set OR
                // Get the whole matched element set as a clean array
                get: function(num) {
                    return num == null ?
                    // Return a 'clean' array
                        this.toArray() :
                    // Return just the object
                        (num < 0 ? this[this.length + num] : this[num]);
                },

                // Take an array of elements and push it onto the stack
                // (returning the new matched element set)
                pushStack: function(elems, name, selector) {
                    // Build a new jQuery matched element set
                    var ret = this.constructor();

                    if (jQuery.isArray(elems)) {
                        push.apply(ret, elems);

                    } else {
                        jQuery.merge(ret, elems);
                    }

                    // Add the old object onto the stack (as a reference)
                    ret.prevObject = this;

                    ret.context = this.context;

                    if (name === "find") {
                        ret.selector = this.selector + (this.selector ? " " : "") + selector;
                    } else if (name) {
                        ret.selector = this.selector + "." + name + "(" + selector + ")";
                    }

                    // Return the newly-formed element set
                    return ret;
                },

                // Execute a callback for every element in the matched set.
                // (You can seed the arguments with an array of args, but this is
                // only used internally.)
                each: function(callback, args) {
                    return jQuery.each(this, callback, args);
                },

                ready: function(fn) {
                    // Attach the listeners
                    jQuery.bindReady();

                    // Add the callback
                    readyList.add(fn);

                    return this;
                },

                eq: function(i) {
                    i = +i;
                    return i === -1 ?
                        this.slice(i) :
                        this.slice(i, i + 1);
                },

                first: function() {
                    return this.eq(0);
                },

                last: function() {
                    return this.eq(-1);
                },

                slice: function() {
                    return this.pushStack(slice.apply(this, arguments),
                        "slice", slice.call(arguments).join(","));
                },

                map: function(callback) {
                    return this.pushStack(jQuery.map(this, function(elem, i) {
                        return callback.call(elem, i, elem);
                    }));
                },

                end: function() {
                    return this.prevObject || this.constructor(null);
                },

                // For internal use only.
                // Behaves like an Array's method, not like a jQuery method.
                push: push,
                sort: [].sort,
                splice: [].splice
            };

            // Give the init function the jQuery prototype for later instantiation
            jQuery.fn.init.prototype = jQuery.fn;

            jQuery.extend = jQuery.fn.extend = function() {
                var options, name, src, copy, copyIsArray, clone,
                    target = arguments[0] || { },
                    i = 1,
                    length = arguments.length,
                    deep = false;

                // Handle a deep copy situation
                if (typeof target === "boolean") {
                    deep = target;
                    target = arguments[1] || { };
                    // skip the boolean and the target
                    i = 2;
                }

                // Handle case when target is a string or something (possible in deep copy)
                if (typeof target !== "object" && !jQuery.isFunction(target)) {
                    target = { };
                }

                // extend jQuery itself if only one argument is passed
                if (length === i) {
                    target = this;
                    --i;
                }

                for (; i < length; i++) {
                    // Only deal with non-null/undefined values
                    if ((options = arguments[i]) != null) {
                        // Extend the base object
                        for (name in options) {
                            src = target[name];
                            copy = options[name];

                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }

                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && jQuery.isArray(src) ? src : [];

                                } else {
                                    clone = src && jQuery.isPlainObject(src) ? src : { };
                                }

                                // Never move original objects, clone them
                                target[name] = jQuery.extend(deep, clone, copy);

                                // Don't bring in undefined values
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }

                // Return the modified object
                return target;
            };

            jQuery.extend({
                noConflict: function(deep) {
                    if (window.$ === jQuery) {
                        window.$ = _$;
                    }

                    if (deep && window.jQuery === jQuery) {
                        window.jQuery = _jQuery;
                    }

                    return jQuery;
                },

                // Is the DOM ready to be used? Set to true once it occurs.
                isReady: false,

                // A counter to track how many items to wait for before
                // the ready event fires. See #6781
                readyWait: 1,

                // Hold (or release) the ready event
                holdReady: function(hold) {
                    if (hold) {
                        jQuery.readyWait++;
                    } else {
                        jQuery.ready(true);
                    }
                },

                // Handle when the DOM is ready
                ready: function(wait) {
                    // Either a released hold or an DOMready/load event and not yet ready
                    if ((wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady)) {
                        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                        if (!document.body) {
                            return setTimeout(jQuery.ready, 1);
                        }

                        // Remember that the DOM is ready
                        jQuery.isReady = true;

                        // If a normal DOM Ready event fired, decrement, and wait if need be
                        if (wait !== true && --jQuery.readyWait > 0) {
                            return;
                        }

                        // If there are functions bound, to execute
                        readyList.fireWith(document, [jQuery]);

                        // Trigger any bound ready events
                        if (jQuery.fn.trigger) {
                            jQuery(document).trigger("ready").off("ready");
                        }
                    }
                },

                bindReady: function() {
                    if (readyList) {
                        return;
                    }

                    readyList = jQuery.Callbacks("once memory");

                    // Catch cases where $(document).ready() is called after the
                    // browser event has already occurred.
                    if (document.readyState === "complete") {
                        // Handle it asynchronously to allow scripts the opportunity to delay ready
                        return setTimeout(jQuery.ready, 1);
                    }

                    // Mozilla, Opera and webkit nightlies currently support this event
                    if (document.addEventListener) {
                        // Use the handy event callback
                        document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

                        // A fallback to window.onload, that will always work
                        window.addEventListener("load", jQuery.ready, false);

                        // If IE event model is used
                    } else if (document.attachEvent) {
                        // ensure firing before onload,
                        // maybe late but safe also for iframes
                        document.attachEvent("onreadystatechange", DOMContentLoaded);

                        // A fallback to window.onload, that will always work
                        window.attachEvent("onload", jQuery.ready);

                        // If IE and not a frame
                        // continually check to see if the document is ready
                        var toplevel = false;

                        try {
                            toplevel = window.frameElement == null;
                        } catch(e) {
                        }

                        if (document.documentElement.doScroll && toplevel) {
                            doScrollCheck();
                        }
                    }
                },

                // See test/unit/core.js for details concerning isFunction.
                // Since version 1.3, DOM methods and functions like alert
                // aren't supported. They return false on IE (#2968).
                isFunction: function(obj) {
                    return jQuery.type(obj) === "function";
                },

                isArray: Array.isArray || function(obj) {
                    return jQuery.type(obj) === "array";
                },

                isWindow: function(obj) {
                    return obj != null && obj == obj.window;
                },

                isNumeric: function(obj) {
                    return !isNaN(parseFloat(obj)) && isFinite(obj);
                },

                type: function(obj) {
                    return obj == null ?
                        String(obj) :
                        class2type[toString.call(obj)] || "object";
                },

                isPlainObject: function(obj) {
                    // Must be an Object.
                    // Because of IE, we also have to check the presence of the constructor property.
                    // Make sure that DOM nodes and window objects don't pass through, as well
                    if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
                        return false;
                    }

                    try {
                        // Not own constructor property must be Object
                        if (obj.constructor &&
                            !hasOwn.call(obj, "constructor") &&
                                !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                            return false;
                        }
                    } catch(e) {
                        // IE8,9 Will throw exceptions on certain host objects #9897
                        return false;
                    }

                    // Own properties are enumerated firstly, so to speed up,
                    // if last one is own, then all properties are own.

                    var key;
                    for (key in obj) {
                    }

                    return key === undefined || hasOwn.call(obj, key);
                },

                isEmptyObject: function(obj) {
                    for (var name in obj) {
                        return false;
                    }
                    return true;
                },

                error: function(msg) {
                    throw new Error(msg);
                },

                parseJSON: function(data) {
                    if (typeof data !== "string" || !data) {
                        return null;
                    }

                    // Make sure leading/trailing whitespace is removed (IE can't handle it)
                    data = jQuery.trim(data);

                    // Attempt to parse using the native JSON parser first
                    if (window.JSON && window.JSON.parse) {
                        return window.JSON.parse(data);
                    }

                    // Make sure the incoming data is actual JSON
                    // Logic borrowed from http://json.org/json2.js
                    if (rvalidchars.test(data.replace(rvalidescape, "@")
                            .replace(rvalidtokens, "]")
                            .replace(rvalidbraces, ""))) {

                        return (new Function("return " + data))();

                    }
                    jQuery.error("Invalid JSON: " + data);
                },

                // Cross-browser xml parsing
                parseXML: function(data) {
                    if (typeof data !== "string" || !data) {
                        return null;
                    }
                    var xml, tmp;
                    try {
                        if (window.DOMParser) { // Standard
                            tmp = new DOMParser();
                            xml = tmp.parseFromString(data, "text/xml");
                        } else { // IE
                            xml = new ActiveXObject("Microsoft.XMLDOM");
                            xml.async = "false";
                            xml.loadXML(data);
                        }
                    } catch(e) {
                        xml = undefined;
                    }
                    if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                        jQuery.error("Invalid XML: " + data);
                    }
                    return xml;
                },

                noop: function() {
                },

                // Evaluates a script in a global context
                // Workarounds based on findings by Jim Driscoll
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                globalEval: function(data) {
                    if (data && rnotwhite.test(data)) {
                        // We use execScript on Internet Explorer
                        // We use an anonymous function so that context is window
                        // rather than jQuery in Firefox
                        (window.execScript || function(data) {
                            window["eval"].call(window, data);
                        })(data);
                    }
                },

                // Convert dashed to camelCase; used by the css and data modules
                // Microsoft forgot to hump their vendor prefix (#9572)
                camelCase: function(string) {
                    return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
                },

                nodeName: function(elem, name) {
                    return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
                },

                // args is for internal usage only
                each: function(object, callback, args) {
                    var name, i = 0,
                        length = object.length,
                        isObj = length === undefined || jQuery.isFunction(object);

                    if (args) {
                        if (isObj) {
                            for (name in object) {
                                if (callback.apply(object[name], args) === false) {
                                    break;
                                }
                            }
                        } else {
                            for (; i < length;) {
                                if (callback.apply(object[i++], args) === false) {
                                    break;
                                }
                            }
                        }

                        // A special, fast, case for the most common use of each
                    } else {
                        if (isObj) {
                            for (name in object) {
                                if (callback.call(object[name], name, object[name]) === false) {
                                    break;
                                }
                            }
                        } else {
                            for (; i < length;) {
                                if (callback.call(object[i], i, object[i++]) === false) {
                                    break;
                                }
                            }
                        }
                    }

                    return object;
                },

                // Use native String.trim function wherever possible
                trim: trim ?
                    function(text) {
                        return text == null ?
                            "" :
                            trim.call(text);
                    } :
                // Otherwise use our own trimming functionality
                    function(text) {
                        return text == null ?
                            "" :
                            text.toString().replace(trimLeft, "").replace(trimRight, "");
                    },

                // results is for internal usage only
                makeArray: function(array, results) {
                    var ret = results || [];

                    if (array != null) {
                        // The window, strings (and functions) also have 'length'
                        // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
                        var type = jQuery.type(array);

                        if (array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow(array)) {
                            push.call(ret, array);
                        } else {
                            jQuery.merge(ret, array);
                        }
                    }

                    return ret;
                },

                inArray: function(elem, array, i) {
                    var len;

                    if (array) {
                        if (indexOf) {
                            return indexOf.call(array, elem, i);
                        }

                        len = array.length;
                        i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

                        for (; i < len; i++) {
                            // Skip accessing in sparse arrays
                            if (i in array && array[i] === elem) {
                                return i;
                            }
                        }
                    }

                    return -1;
                },

                merge: function(first, second) {
                    var i = first.length,
                        j = 0;

                    if (typeof second.length === "number") {
                        for (var l = second.length; j < l; j++) {
                            first[i++] = second[j];
                        }

                    } else {
                        while (second[j] !== undefined) {
                            first[i++] = second[j++];
                        }
                    }

                    first.length = i;

                    return first;
                },

                grep: function(elems, callback, inv) {
                    var ret = [], retVal;
                    inv = !!inv;

                    // Go through the array, only saving the items
                    // that pass the validator function
                    for (var i = 0, length = elems.length; i < length; i++) {
                        retVal = !!callback(elems[i], i);
                        if (inv !== retVal) {
                            ret.push(elems[i]);
                        }
                    }

                    return ret;
                },

                // arg is for internal usage only
                map: function(elems, callback, arg) {
                    var value, key, ret = [],
                        i = 0,
                        length = elems.length,
                        // jquery objects are treated as arrays
                        isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ((length > 0 && elems[0] && elems[length - 1]) || length === 0 || jQuery.isArray(elems));

                    // Go through the array, translating each of the items to their
                    if (isArray) {
                        for (; i < length; i++) {
                            value = callback(elems[i], i, arg);

                            if (value != null) {
                                ret[ret.length] = value;
                            }
                        }

                        // Go through every key on the object,
                    } else {
                        for (key in elems) {
                            value = callback(elems[key], key, arg);

                            if (value != null) {
                                ret[ret.length] = value;
                            }
                        }
                    }

                    // Flatten any nested arrays
                    return ret.concat.apply([], ret);
                },

                // A global GUID counter for objects
                guid: 1,

                // Bind a function to a context, optionally partially applying any
                // arguments.
                proxy: function(fn, context) {
                    if (typeof context === "string") {
                        var tmp = fn[context];
                        context = fn;
                        fn = tmp;
                    }

                    // Quick check to determine if target is callable, in the spec
                    // this throws a TypeError, but we will just return undefined.
                    if (!jQuery.isFunction(fn)) {
                        return undefined;
                    }

                    // Simulated bind
                    var args = slice.call(arguments, 2),
                        proxy = function() {
                            return fn.apply(context, args.concat(slice.call(arguments)));
                        };

                    // Set the guid of unique handler to the same of original handler, so it can be removed
                    proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

                    return proxy;
                },

                // Mutifunctional method to get and set values to a collection
                // The value/s can optionally be executed if it's a function
                access: function(elems, fn, key, value, chainable, emptyGet, pass) {
                    var exec,
                        bulk = key == null,
                        i = 0,
                        length = elems.length;

                    // Sets many values
                    if (key && typeof key === "object") {
                        for (i in key) {
                            jQuery.access(elems, fn, i, key[i], 1, emptyGet, value);
                        }
                        chainable = 1;

                        // Sets one value
                    } else if (value !== undefined) {
                        // Optionally, function values get executed if exec is true
                        exec = pass === undefined && jQuery.isFunction(value);

                        if (bulk) {
                            // Bulk operations only iterate when executing function values
                            if (exec) {
                                exec = fn;
                                fn = function(elem, key, value) {
                                    return exec.call(jQuery(elem), value);
                                };

                                // Otherwise they run against the entire set
                            } else {
                                fn.call(elems, value);
                                fn = null;
                            }
                        }

                        if (fn) {
                            for (; i < length; i++) {
                                fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
                            }
                        }

                        chainable = 1;
                    }

                    return chainable ?
                        elems :
                    // Gets
                        bulk ?
                            fn.call(elems) :
                            length ? fn(elems[0], key) : emptyGet;
                },

                now: function() {
                    return (new Date()).getTime();
                },

                // Use of jQuery.browser is frowned upon.
                // More details: http://docs.jquery.com/Utilities/jQuery.browser
                uaMatch: function(ua) {
                    ua = ua.toLowerCase();

                    var match = rwebkit.exec(ua) ||
                        ropera.exec(ua) ||
                            rmsie.exec(ua) ||
                                ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ||
                                    [];

                    return { browser: match[1] || "", version: match[2] || "0" };
                },

                sub: function() {

                    function jQuerySub(selector, context) {
                        return new jQuerySub.fn.init(selector, context);
                    }

                    jQuery.extend(true, jQuerySub, this);
                    jQuerySub.superclass = this;
                    jQuerySub.fn = jQuerySub.prototype = this();
                    jQuerySub.fn.constructor = jQuerySub;
                    jQuerySub.sub = this.sub;
                    jQuerySub.fn.init = function init(selector, context) {
                        if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
                            context = jQuerySub(context);
                        }

                        return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
                    };
                    jQuerySub.fn.init.prototype = jQuerySub.fn;
                    var rootjQuerySub = jQuerySub(document);
                    return jQuerySub;
                },

                browser: { }
            });

            // Populate the class2type map
            jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
                class2type["[object " + name + "]"] = name.toLowerCase();
            });

            browserMatch = jQuery.uaMatch(userAgent);
            if (browserMatch.browser) {
                jQuery.browser[browserMatch.browser] = true;
                jQuery.browser.version = browserMatch.version;
            }

            // Deprecated, use jQuery.browser.webkit instead
            if (jQuery.browser.webkit) {
                jQuery.browser.safari = true;
            }

            // IE doesn't match non-breaking spaces with \s
            if (rnotwhite.test("\xA0")) {
                trimLeft = /^[\s\xA0]+/ ;
                trimRight = /[\s\xA0]+$/ ;
            }

            // All jQuery objects should point back to these
            rootjQuery = jQuery(document);

            // Cleanup functions for the document ready method
            if (document.addEventListener) {
                DOMContentLoaded = function() {
                    document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                    jQuery.ready();
                };

            } else if (document.attachEvent) {
                DOMContentLoaded = function() {
                    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                    if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", DOMContentLoaded);
                        jQuery.ready();
                    }
                };
            }

            // The DOM ready check for Internet Explorer

            function doScrollCheck() {
                if (jQuery.isReady) {
                    return;
                }

                try {
                    // If IE is used, use the trick by Diego Perini
                    // http://javascript.nwbox.com/IEContentLoaded/
                    document.documentElement.doScroll("left");
                } catch(e) {
                    setTimeout(doScrollCheck, 1);
                    return;
                }

                // and execute any waiting functions
                jQuery.ready();
            }

            return jQuery;

        })();


        // String to Object flags format cache
        var flagsCache = { };

        // Convert String-formatted flags into Object-formatted ones and store in cache

        function createFlags(flags) {
            var object = flagsCache[flags] = { },
                i, length;
            flags = flags.split( /\s+/ );
            for (i = 0, length = flags.length; i < length; i++) {
                object[flags[i]] = true;
            }
            return object;
        }

        /*
        * Create a callback list using the following parameters:
        *
        *	flags:	an optional list of space-separated flags that will change how
        *			the callback list behaves
        *
        * By default a callback list will act like an event callback list and can be
        * "fired" multiple times.
        *
        * Possible flags:
        *
        *	once:			will ensure the callback list can only be fired once (like a Deferred)
        *
        *	memory:			will keep track of previous values and will call any callback added
        *					after the list has been fired right away with the latest "memorized"
        *					values (like a Deferred)
        *
        *	unique:			will ensure a callback can only be added once (no duplicate in the list)
        *
        *	stopOnFalse:	interrupt callings when a callback returns false
        *
        */
        jQuery.Callbacks = function(flags) {

            // Convert flags from String-formatted to Object-formatted
            // (we check in cache first)
            flags = flags ? (flagsCache[flags] || createFlags(flags)) : { };

            var// Actual callback list
                list = [],
                // Stack of fire calls for repeatable lists
                stack = [],
                // Last fire value (for non-forgettable lists)
                memory,
                // Flag to know if list was already fired
                fired,
                // Flag to know if list is currently firing
                firing,
                // First callback to fire (used internally by add and fireWith)
                firingStart,
                // End of the loop when firing
                firingLength,
                // Index of currently firing callback (modified by remove if needed)
                firingIndex,
                // Add one or several callbacks to the list
                add = function(args) {
                    var i,
                        length,
                        elem,
                        type,
                        actual;
                    for (i = 0, length = args.length; i < length; i++) {
                        elem = args[i];
                        type = jQuery.type(elem);
                        if (type === "array") {
                            // Inspect recursively
                            add(elem);
                        } else if (type === "function") {
                            // Add if not in unique mode and callback is not in
                            if (!flags.unique || !self.has(elem)) {
                                list.push(elem);
                            }
                        }
                    }
                },
                // Fire callbacks
                fire = function(context, args) {
                    args = args || [];
                    memory = !flags.memory || [context, args];
                    fired = true;
                    firing = true;
                    firingIndex = firingStart || 0;
                    firingStart = 0;
                    firingLength = list.length;
                    for (; list && firingIndex < firingLength; firingIndex++) {
                        if (list[firingIndex].apply(context, args) === false && flags.stopOnFalse) {
                            memory = true; // Mark as halted
                            break;
                        }
                    }
                    firing = false;
                    if (list) {
                        if (!flags.once) {
                            if (stack && stack.length) {
                                memory = stack.shift();
                                self.fireWith(memory[0], memory[1]);
                            }
                        } else if (memory === true) {
                            self.disable();
                        } else {
                            list = [];
                        }
                    }
                },
                // Actual Callbacks object
                self = {
                // Add a callback or a collection of callbacks to the list
                    add: function() {
                        if (list) {
                            var length = list.length;
                            add(arguments);
                            // Do we need to add the callbacks to the
                            // current firing batch?
                            if (firing) {
                                firingLength = list.length;
                                // With memory, if we're not firing then
                                // we should call right away, unless previous
                                // firing was halted (stopOnFalse)
                            } else if (memory && memory !== true) {
                                firingStart = length;
                                fire(memory[0], memory[1]);
                            }
                        }
                        return this;
                    },
                    // Remove a callback from the list
                    remove: function() {
                        if (list) {
                            var args = arguments,
                                argIndex = 0,
                                argLength = args.length;
                            for (; argIndex < argLength; argIndex++) {
                                for (var i = 0; i < list.length; i++) {
                                    if (args[argIndex] === list[i]) {
                                        // Handle firingIndex and firingLength
                                        if (firing) {
                                            if (i <= firingLength) {
                                                firingLength--;
                                                if (i <= firingIndex) {
                                                    firingIndex--;
                                                }
                                            }
                                        }
                                        // Remove the element
                                        list.splice(i--, 1);
                                        // If we have some unicity property then
                                        // we only need to do this once
                                        if (flags.unique) {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        return this;
                    },
                    // Control if a given callback is in the list
                    has: function(fn) {
                        if (list) {
                            var i = 0,
                                length = list.length;
                            for (; i < length; i++) {
                                if (fn === list[i]) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    },
                    // Remove all callbacks from the list
                    empty: function() {
                        list = [];
                        return this;
                    },
                    // Have the list do nothing anymore
                    disable: function() {
                        list = stack = memory = undefined;
                        return this;
                    },
                    // Is it disabled?
                    disabled: function() {
                        return !list;
                    },
                    // Lock the list in its current state
                    lock: function() {
                        stack = undefined;
                        if (!memory || memory === true) {
                            self.disable();
                        }
                        return this;
                    },
                    // Is it locked?
                    locked: function() {
                        return !stack;
                    },
                    // Call all callbacks with the given context and arguments
                    fireWith: function(context, args) {
                        if (stack) {
                            if (firing) {
                                if (!flags.once) {
                                    stack.push([context, args]);
                                }
                            } else if (!(flags.once && memory)) {
                                fire(context, args);
                            }
                        }
                        return this;
                    },
                    // Call all the callbacks with the given arguments
                    fire: function() {
                        self.fireWith(this, arguments);
                        return this;
                    },
                    // To know if the callbacks have already been called at least once
                    fired: function() {
                        return !!fired;
                    }
                };

            return self;
        };


        var// Static reference to slice
            sliceDeferred = [].slice;

        jQuery.extend({
            Deferred: function(func) {
                var doneList = jQuery.Callbacks("once memory"),
                    failList = jQuery.Callbacks("once memory"),
                    progressList = jQuery.Callbacks("memory"),
                    state = "pending",
                    lists = {
                        resolve: doneList,
                        reject: failList,
                        notify: progressList
                    },
                    promise = {
                        done: doneList.add,
                        fail: failList.add,
                        progress: progressList.add,

                        state: function() {
                            return state;
                        },

                        // Deprecated
                        isResolved: doneList.fired,
                        isRejected: failList.fired,

                        then: function(doneCallbacks, failCallbacks, progressCallbacks) {
                            deferred.done(doneCallbacks).fail(failCallbacks).progress(progressCallbacks);
                            return this;
                        },
                        always: function() {
                            deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);
                            return this;
                        },
                        pipe: function(fnDone, fnFail, fnProgress) {
                            return jQuery.Deferred(function(newDefer) {
                                jQuery.each({
                                        done: [fnDone, "resolve"],
                                        fail: [fnFail, "reject"],
                                        progress: [fnProgress, "notify"]
                                    }, function(handler, data) {
                                        var fn = data[0],
                                            action = data[1],
                                            returned;
                                        if (jQuery.isFunction(fn)) {
                                            deferred[handler](function() {
                                                returned = fn.apply(this, arguments);
                                                if (returned && jQuery.isFunction(returned.promise)) {
                                                    returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify);
                                                } else {
                                                    newDefer[action + "With"](this === deferred ? newDefer : this, [returned]);
                                                }
                                            });
                                        } else {
                                            deferred[handler](newDefer[action]);
                                        }
                                    });
                            }).promise();
                        },
                        // Get a promise for this deferred
                        // If obj is provided, the promise aspect is added to the object
                        promise: function(obj) {
                            if (obj == null) {
                                obj = promise;
                            } else {
                                for (var key in promise) {
                                    obj[key] = promise[key];
                                }
                            }
                            return obj;
                        }
                    },
                    deferred = promise.promise({ }),
                    key;

                for (key in lists) {
                    deferred[key] = lists[key].fire;
                    deferred[key + "With"] = lists[key].fireWith;
                }

                // Handle state
                deferred.done(function() {
                    state = "resolved";
                }, failList.disable, progressList.lock).fail(function() {
                    state = "rejected";
                }, doneList.disable, progressList.lock);

                // Call given func if any
                if (func) {
                    func.call(deferred, deferred);
                }

                // All done!
                return deferred;
            },

            // Deferred helper
            when: function(firstParam) {
                var args = sliceDeferred.call(arguments, 0),
                    i = 0,
                    length = args.length,
                    pValues = new Array(length),
                    count = length,
                    pCount = length,
                    deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ?
                        firstParam :
                        jQuery.Deferred(),
                    promise = deferred.promise();

                function resolveFunc(i) {
                    return function(value) {
                        args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                        if (!(--count)) {
                            deferred.resolveWith(deferred, args);
                        }
                    };
                }

                function progressFunc(i) {
                    return function(value) {
                        pValues[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                        deferred.notifyWith(promise, pValues);
                    };
                }

                if (length > 1) {
                    for (; i < length; i++) {
                        if (args[i] && args[i].promise && jQuery.isFunction(args[i].promise)) {
                            args[i].promise().then(resolveFunc(i), deferred.reject, progressFunc(i));
                        } else {
                            --count;
                        }
                    }
                    if (!count) {
                        deferred.resolveWith(deferred, args);
                    }
                } else if (deferred !== firstParam) {
                    deferred.resolveWith(deferred, length ? [firstParam] : []);
                }
                return promise;
            }
        });


        jQuery.support = (function() {

            var support,
                all,
                a,
                select,
                opt,
                input,
                fragment,
                tds,
                events,
                eventName,
                i,
                isSupported,
                div = document.createElement("div"),
                documentElement = document.documentElement;

            // Preliminary tests
            div.setAttribute("className", "t");
            div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

            all = div.getElementsByTagName("*");
            a = div.getElementsByTagName("a")[0];

            // Can't get basic test support
            if (!all || !all.length || !a) {
                return { };
            }

            // First batch of supports tests
            select = document.createElement("select");
            opt = select.appendChild(document.createElement("option"));
            input = div.getElementsByTagName("input")[0];

            support = {
            // IE strips leading whitespace when .innerHTML is used
                leadingWhitespace: (div.firstChild.nodeType === 3),

                // Make sure that tbody elements aren't automatically inserted
                // IE will insert them into empty tables
                tbody: !div.getElementsByTagName("tbody").length,

                // Make sure that link elements get serialized correctly by innerHTML
                // This requires a wrapper element in IE
                htmlSerialize: !!div.getElementsByTagName("link").length,

                // Get the style information from getAttribute
                // (IE uses .cssText instead)
                style: /top/ .test(a.getAttribute("style")),

                // Make sure that URLs aren't manipulated
                // (IE normalizes it by default)
                hrefNormalized: (a.getAttribute("href") === "/a"),

                // Make sure that element opacity exists
                // (IE uses filter instead)
                // Use a regex to work around a WebKit issue. See #5145
                opacity: /^0.55/ .test(a.style.opacity),

                // Verify style float existence
                // (IE uses styleFloat instead of cssFloat)
                cssFloat: !!a.style.cssFloat,

                // Make sure that if no value is specified for a checkbox
                // that it defaults to "on".
                // (WebKit defaults to "" instead)
                checkOn: (input.value === "on"),

                // Make sure that a selected-by-default option has a working selected property.
                // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
                optSelected: opt.selected,

                // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
                getSetAttribute: div.className !== "t",

                // Tests for enctype support on a form(#6743)
                enctype: !!document.createElement("form").enctype,

                // Makes sure cloning an html5 element does not cause problems
                // Where outerHTML is undefined, this still works
                html5Clone: document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",

                // Will be defined later
                submitBubbles: true,
                changeBubbles: true,
                focusinBubbles: false,
                deleteExpando: true,
                noCloneEvent: true,
                inlineBlockNeedsLayout: false,
                shrinkWrapBlocks: false,
                reliableMarginRight: true,
                pixelMargin: true
            };

            // jQuery.boxModel DEPRECATED in 1.3, use jQuery.support.boxModel instead
            jQuery.boxModel = support.boxModel = (document.compatMode === "CSS1Compat");

            // Make sure checked status is properly cloned
            input.checked = true;
            support.noCloneChecked = input.cloneNode(true).checked;

            // Make sure that the options inside disabled selects aren't marked as disabled
            // (WebKit marks them as disabled)
            select.disabled = true;
            support.optDisabled = !opt.disabled;

            // Test to see if it's possible to delete an expando from an element
            // Fails in Internet Explorer
            try {
                delete div.test;
            } catch(e) {
                support.deleteExpando = false;
            }

            if (!div.addEventListener && div.attachEvent && div.fireEvent) {
                div.attachEvent("onclick", function() {
                    // Cloning a node shouldn't copy over any
                    // bound event handlers (IE does this)
                    support.noCloneEvent = false;
                });
                div.cloneNode(true).fireEvent("onclick");
            }

            // Check if a radio maintains its value
            // after being appended to the DOM
            input = document.createElement("input");
            input.value = "t";
            input.setAttribute("type", "radio");
            support.radioValue = input.value === "t";

            input.setAttribute("checked", "checked");

            // #11217 - WebKit loses check when the name is after the checked attribute
            input.setAttribute("name", "t");

            div.appendChild(input);
            fragment = document.createDocumentFragment();
            fragment.appendChild(div.lastChild);

            // WebKit doesn't clone checked state correctly in fragments
            support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

            // Check if a disconnected checkbox will retain its checked
            // value of true after appended to the DOM (IE6/7)
            support.appendChecked = input.checked;

            fragment.removeChild(input);
            fragment.appendChild(div);

            // Technique from Juriy Zaytsev
            // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
            // We only care about the case where non-standard event systems
            // are used, namely in IE. Short-circuiting here helps us to
            // avoid an eval call (in setAttribute) which can cause CSP
            // to go haywire. See: https://developer.mozilla.org/en/Security/CSP
            if (div.attachEvent) {
                for (i in {
                    submit: 1,
                    change: 1,
                    focusin: 1
                }) {
                    eventName = "on" + i;
                    isSupported = (eventName in div);
                    if (!isSupported) {
                        div.setAttribute(eventName, "return;");
                        isSupported = (typeof div[eventName] === "function");
                    }
                    support[i + "Bubbles"] = isSupported;
                }
            }

            fragment.removeChild(div);

            // Null elements to avoid leaks in IE
            fragment = select = opt = div = input = null;

            // Run tests that need a body at doc ready
            jQuery(function() {
                var container, outer, inner, table, td, offsetSupport,
                    marginDiv, conMarginTop, style, html, positionTopLeftWidthHeight,
                    paddingMarginBorderVisibility, paddingMarginBorder,
                    body = document.getElementsByTagName("body")[0];

                if (!body) {
                    // Return for frameset docs that don't have a body
                    return;
                }

                conMarginTop = 1;
                paddingMarginBorder = "padding:0;margin:0;border:";
                positionTopLeftWidthHeight = "position:absolute;top:0;left:0;width:1px;height:1px;";
                paddingMarginBorderVisibility = paddingMarginBorder + "0;visibility:hidden;";
                style = "style='" + positionTopLeftWidthHeight + paddingMarginBorder + "5px solid #000;";
                html = "<div " + style + "display:block;'><div style='" + paddingMarginBorder + "0;display:block;overflow:hidden;'></div></div>" +
                    "<table " + style + "' cellpadding='0' cellspacing='0'>" +
                        "<tr><td></td></tr></table>";

                container = document.createElement("div");
                container.style.cssText = paddingMarginBorderVisibility + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
                body.insertBefore(container, body.firstChild);

                // Construct the test element
                div = document.createElement("div");
                container.appendChild(div);

                // Check if table cells still have offsetWidth/Height when they are set
                // to display:none and there are still other visible table cells in a
                // table row; if so, offsetWidth/Height are not reliable for use when
                // determining if an element has been hidden directly using
                // display:none (it is still safe to use offsets if a parent element is
                // hidden; don safety goggles and see bug #4512 for more information).
                // (only IE 8 fails this test)
                div.innerHTML = "<table><tr><td style='" + paddingMarginBorder + "0;display:none'></td><td>t</td></tr></table>";
                tds = div.getElementsByTagName("td");
                isSupported = (tds[0].offsetHeight === 0);

                tds[0].style.display = "";
                tds[1].style.display = "none";

                // Check if empty table cells still have offsetWidth/Height
                // (IE <= 8 fail this test)
                support.reliableHiddenOffsets = isSupported && (tds[0].offsetHeight === 0);

                // Check if div with explicit width and no margin-right incorrectly
                // gets computed margin-right based on width of container. For more
                // info see bug #3333
                // Fails in WebKit before Feb 2011 nightlies
                // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                if (window.getComputedStyle) {
                    div.innerHTML = "";
                    marginDiv = document.createElement("div");
                    marginDiv.style.width = "0";
                    marginDiv.style.marginRight = "0";
                    div.style.width = "2px";
                    div.appendChild(marginDiv);
                    support.reliableMarginRight =
                        (parseInt((window.getComputedStyle(marginDiv, null) || { marginRight: 0 }).marginRight, 10) || 0) === 0;
                }

                if (typeof div.style.zoom !== "undefined") {
                    // Check if natively block-level elements act like inline-block
                    // elements when setting their display to 'inline' and giving
                    // them layout
                    // (IE < 8 does this)
                    div.innerHTML = "";
                    div.style.width = div.style.padding = "1px";
                    div.style.border = 0;
                    div.style.overflow = "hidden";
                    div.style.display = "inline";
                    div.style.zoom = 1;
                    support.inlineBlockNeedsLayout = (div.offsetWidth === 3);

                    // Check if elements with layout shrink-wrap their children
                    // (IE 6 does this)
                    div.style.display = "block";
                    div.style.overflow = "visible";
                    div.innerHTML = "<div style='width:5px;'></div>";
                    support.shrinkWrapBlocks = (div.offsetWidth !== 3);
                }

                div.style.cssText = positionTopLeftWidthHeight + paddingMarginBorderVisibility;
                div.innerHTML = html;

                outer = div.firstChild;
                inner = outer.firstChild;
                td = outer.nextSibling.firstChild.firstChild;

                offsetSupport = {
                    doesNotAddBorder: (inner.offsetTop !== 5),
                    doesAddBorderForTableAndCells: (td.offsetTop === 5)
                };

                inner.style.position = "fixed";
                inner.style.top = "20px";

                // safari subtracts parent border width here which is 5px
                offsetSupport.fixedPosition = (inner.offsetTop === 20 || inner.offsetTop === 15);
                inner.style.position = inner.style.top = "";

                outer.style.overflow = "hidden";
                outer.style.position = "relative";

                offsetSupport.subtractsBorderForOverflowNotVisible = (inner.offsetTop === -5);
                offsetSupport.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== conMarginTop);

                if (window.getComputedStyle) {
                    div.style.marginTop = "1%";
                    support.pixelMargin = (window.getComputedStyle(div, null) || { marginTop: 0 }).marginTop !== "1%";
                }

                if (typeof container.style.zoom !== "undefined") {
                    container.style.zoom = 1;
                }

                body.removeChild(container);
                marginDiv = div = container = null;

                jQuery.extend(support, offsetSupport);
            });

            return support;
        })();


        var rbrace = /^(?:\{.*\}|\[.*\])$/ ,
            rmultiDash = /([A-Z])/g ;

        jQuery.extend({
            cache: { },

            // Please use with caution
            uuid: 0,

            // Unique for each copy of jQuery on the page
            // Non-digits removed to match rinlinejQuery
            expando: "jQuery" + (jQuery.fn.jquery + Math.random()).replace( /\D/g , ""),

            // The following elements throw uncatchable exceptions if you
            // attempt to add expando properties to them.
            noData: {
                "embed": true,
                // Ban all objects except for Flash (which handle expandos)
                "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
                "applet": true
            },

            hasData: function(elem) {
                elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
                return !!elem && !isEmptyDataObject(elem);
            },

            data: function(elem, name, data, pvt /* Internal Use Only */) {
                if (!jQuery.acceptData(elem)) {
                    return;
                }

                var privateCache, thisCache, ret,
                    internalKey = jQuery.expando,
                    getByName = typeof name === "string",
                    // We have to handle DOM nodes and JS objects differently because IE6-7
                // can't GC object references properly across the DOM-JS boundary
                    isNode = elem.nodeType,
                    // Only DOM nodes need the global jQuery cache; JS object data is
                // attached directly to the object so GC can occur automatically
                    cache = isNode ? jQuery.cache : elem,
                    // Only defining an ID for JS objects if its cache already exists allows
                // the code to shortcut on the same path as a DOM node with no cache
                    id = isNode ? elem[internalKey] : elem[internalKey] && internalKey,
                    isEvents = name === "events";

                // Avoid doing any more work than we need to when trying to get data on an
                // object that has no data at all
                if ((!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined) {
                    return;
                }

                if (!id) {
                    // Only DOM nodes need a new unique ID for each element since their data
                    // ends up in the global cache
                    if (isNode) {
                        elem[internalKey] = id = ++jQuery.uuid;
                    } else {
                        id = internalKey;
                    }
                }

                if (!cache[id]) {
                    cache[id] = { };

                    // Avoids exposing jQuery metadata on plain JS objects when the object
                    // is serialized using JSON.stringify
                    if (!isNode) {
                        cache[id].toJSON = jQuery.noop;
                    }
                }

                // An object can be passed to jQuery.data instead of a key/value pair; this gets
                // shallow copied over onto the existing cache
                if (typeof name === "object" || typeof name === "function") {
                    if (pvt) {
                        cache[id] = jQuery.extend(cache[id], name);
                    } else {
                        cache[id].data = jQuery.extend(cache[id].data, name);
                    }
                }

                privateCache = thisCache = cache[id];

                // jQuery data() is stored in a separate object inside the object's internal data
                // cache in order to avoid key collisions between internal data and user-defined
                // data.
                if (!pvt) {
                    if (!thisCache.data) {
                        thisCache.data = { };
                    }

                    thisCache = thisCache.data;
                }

                if (data !== undefined) {
                    thisCache[jQuery.camelCase(name)] = data;
                }

                // Users should not attempt to inspect the internal events object using jQuery.data,
                // it is undocumented and subject to change. But does anyone listen? No.
                if (isEvents && !thisCache[name]) {
                    return privateCache.events;
                }

                // Check for both converted-to-camel and non-converted data property names
                // If a data property was specified
                if (getByName) {

                    // First Try to find as-is property data
                    ret = thisCache[name];

                    // Test for null|undefined property data
                    if (ret == null) {

                        // Try to find the camelCased property
                        ret = thisCache[jQuery.camelCase(name)];
                    }
                } else {
                    ret = thisCache;
                }

                return ret;
            },

            removeData: function(elem, name, pvt /* Internal Use Only */) {
                if (!jQuery.acceptData(elem)) {
                    return;
                }

                var thisCache, i, l,
                    // Reference to internal data cache key
                    internalKey = jQuery.expando,
                    isNode = elem.nodeType,
                    // See jQuery.data for more information
                    cache = isNode ? jQuery.cache : elem,
                    // See jQuery.data for more information
                    id = isNode ? elem[internalKey] : internalKey;

                // If there is already no cache entry for this object, there is no
                // purpose in continuing
                if (!cache[id]) {
                    return;
                }

                if (name) {

                    thisCache = pvt ? cache[id] : cache[id].data;

                    if (thisCache) {

                        // Support array or space separated string names for data keys
                        if (!jQuery.isArray(name)) {

                            // try the string as a key before any manipulation
                            if (name in thisCache) {
                                name = [name];
                            } else {

                                // split the camel cased version by spaces unless a key with the spaces exists
                                name = jQuery.camelCase(name);
                                if (name in thisCache) {
                                    name = [name];
                                } else {
                                    name = name.split(" ");
                                }
                            }
                        }

                        for (i = 0, l = name.length; i < l; i++) {
                            delete thisCache[name[i]];
                        }

                        // If there is no data left in the cache, we want to continue
                        // and let the cache object itself get destroyed
                        if (!(pvt ? isEmptyDataObject : jQuery.isEmptyObject)(thisCache)) {
                            return;
                        }
                    }
                }

                // See jQuery.data for more information
                if (!pvt) {
                    delete cache[id].data;

                    // Don't destroy the parent cache unless the internal data object
                    // had been the only thing left in it
                    if (!isEmptyDataObject(cache[id])) {
                        return;
                    }
                }

                // Browsers that fail expando deletion also refuse to delete expandos on
                // the window, but it will allow it on all other JS objects; other browsers
                // don't care
                // Ensure that `cache` is not a window object #10080
                if (jQuery.support.deleteExpando || !cache.setInterval) {
                    delete cache[id];
                } else {
                    cache[id] = null;
                }

                // We destroyed the cache and need to eliminate the expando on the node to avoid
                // false lookups in the cache for entries that no longer exist
                if (isNode) {
                    // IE does not allow us to delete expando properties from nodes,
                    // nor does it have a removeAttribute function on Document nodes;
                    // we must handle all of these cases
                    if (jQuery.support.deleteExpando) {
                        delete elem[internalKey];
                    } else if (elem.removeAttribute) {
                        elem.removeAttribute(internalKey);
                    } else {
                        elem[internalKey] = null;
                    }
                }
            },

            // For internal use only.
            _data: function(elem, name, data) {
                return jQuery.data(elem, name, data, true);
            },

            // A method for determining if a DOM node can handle the data expando
            acceptData: function(elem) {
                if (elem.nodeName) {
                    var match = jQuery.noData[elem.nodeName.toLowerCase()];

                    if (match) {
                        return !(match === true || elem.getAttribute("classid") !== match);
                    }
                }

                return true;
            }
        });

        jQuery.fn.extend({
            data: function(key, value) {
                var parts, part, attr, name, l,
                    elem = this[0],
                    i = 0,
                    data = null;

                // Gets all values
                if (key === undefined) {
                    if (this.length) {
                        data = jQuery.data(elem);

                        if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs")) {
                            attr = elem.attributes;
                            for (l = attr.length; i < l; i++) {
                                name = attr[i].name;

                                if (name.indexOf("data-") === 0) {
                                    name = jQuery.camelCase(name.substring(5));

                                    dataAttr(elem, name, data[name]);
                                }
                            }
                            jQuery._data(elem, "parsedAttrs", true);
                        }
                    }

                    return data;
                }

                // Sets multiple values
                if (typeof key === "object") {
                    return this.each(function() {
                        jQuery.data(this, key);
                    });
                }

                parts = key.split(".", 2);
                parts[1] = parts[1] ? "." + parts[1] : "";
                part = parts[1] + "!";

                return jQuery.access(this, function(value) {

                    if (value === undefined) {
                        data = this.triggerHandler("getData" + part, [parts[0]]);

                        // Try to fetch any internally stored data first
                        if (data === undefined && elem) {
                            data = jQuery.data(elem, key);
                            data = dataAttr(elem, key, data);
                        }

                        return data === undefined && parts[1] ?
                            this.data(parts[0]) :
                            data;
                    }

                    parts[1] = value;
                    this.each(function() {
                        var self = jQuery(this);

                        self.triggerHandler("setData" + part, parts);
                        jQuery.data(this, key, value);
                        self.triggerHandler("changeData" + part, parts);
                    });
                }, null, value, arguments.length > 1, null, false);
            },

            removeData: function(key) {
                return this.each(function() {
                    jQuery.removeData(this, key);
                });
            }
        });

        function dataAttr(elem, key, data) {
            // If nothing was found internally, try to fetch any
            // data from the HTML5 data-* attribute
            if (data === undefined && elem.nodeType === 1) {

                var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();

                data = elem.getAttribute(name);

                if (typeof data === "string") {
                    try {
                        data = data === "true" ? true :
                            data === "false" ? false :
                                data === "null" ? null :
                                    jQuery.isNumeric(data) ? +data :
                                        rbrace.test(data) ? jQuery.parseJSON(data) :
                                            data;
                    } catch(e) {
                    }

                    // Make sure we set the data so it isn't changed later
                    jQuery.data(elem, key, data);

                } else {
                    data = undefined;
                }
            }

            return data;
        }

        // checks a cache object for emptiness

        function isEmptyDataObject(obj) {
            for (var name in obj) {

                // if the public data object is empty, the private is still empty
                if (name === "data" && jQuery.isEmptyObject(obj[name])) {
                    continue;
                }
                if (name !== "toJSON") {
                    return false;
                }
            }

            return true;
        }


        function handleQueueMarkDefer(elem, type, src) {
            var deferDataKey = type + "defer",
                queueDataKey = type + "queue",
                markDataKey = type + "mark",
                defer = jQuery._data(elem, deferDataKey);
            if (defer &&
                (src === "queue" || !jQuery._data(elem, queueDataKey)) &&
                    (src === "mark" || !jQuery._data(elem, markDataKey))) {
                // Give room for hard-coded callbacks to fire first
                // and eventually mark/queue something else on the element
                setTimeout(function() {
                    if (!jQuery._data(elem, queueDataKey) &&
                        !jQuery._data(elem, markDataKey)) {
                        jQuery.removeData(elem, deferDataKey, true);
                        defer.fire();
                    }
                }, 0);
            }
        }

        jQuery.extend({
            _mark: function(elem, type) {
                if (elem) {
                    type = (type || "fx") + "mark";
                    jQuery._data(elem, type, (jQuery._data(elem, type) || 0) + 1);
                }
            },

            _unmark: function(force, elem, type) {
                if (force !== true) {
                    type = elem;
                    elem = force;
                    force = false;
                }
                if (elem) {
                    type = type || "fx";
                    var key = type + "mark",
                        count = force ? 0 : ((jQuery._data(elem, key) || 1) - 1);
                    if (count) {
                        jQuery._data(elem, key, count);
                    } else {
                        jQuery.removeData(elem, key, true);
                        handleQueueMarkDefer(elem, type, "mark");
                    }
                }
            },

            queue: function(elem, type, data) {
                var q;
                if (elem) {
                    type = (type || "fx") + "queue";
                    q = jQuery._data(elem, type);

                    // Speed up dequeue by getting out quickly if this is just a lookup
                    if (data) {
                        if (!q || jQuery.isArray(data)) {
                            q = jQuery._data(elem, type, jQuery.makeArray(data));
                        } else {
                            q.push(data);
                        }
                    }
                    return q || [];
                }
            },

            dequeue: function(elem, type) {
                type = type || "fx";

                var queue = jQuery.queue(elem, type),
                    fn = queue.shift(),
                    hooks = { };

                // If the fx queue is dequeued, always remove the progress sentinel
                if (fn === "inprogress") {
                    fn = queue.shift();
                }

                if (fn) {
                    // Add a progress sentinel to prevent the fx queue from being
                    // automatically dequeued
                    if (type === "fx") {
                        queue.unshift("inprogress");
                    }

                    jQuery._data(elem, type + ".run", hooks);
                    fn.call(elem, function() {
                        jQuery.dequeue(elem, type);
                    }, hooks);
                }

                if (!queue.length) {
                    jQuery.removeData(elem, type + "queue " + type + ".run", true);
                    handleQueueMarkDefer(elem, type, "queue");
                }
            }
        });

        jQuery.fn.extend({
            queue: function(type, data) {
                var setter = 2;

                if (typeof type !== "string") {
                    data = type;
                    type = "fx";
                    setter--;
                }

                if (arguments.length < setter) {
                    return jQuery.queue(this[0], type);
                }

                return data === undefined ?
                    this :
                    this.each(function() {
                        var queue = jQuery.queue(this, type, data);

                        if (type === "fx" && queue[0] !== "inprogress") {
                            jQuery.dequeue(this, type);
                        }
                    });
            },
            dequeue: function(type) {
                return this.each(function() {
                    jQuery.dequeue(this, type);
                });
            },
            // Based off of the plugin by Clint Helfers, with permission.
            // http://blindsignals.com/index.php/2009/07/jquery-delay/
            delay: function(time, type) {
                time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
                type = type || "fx";

                return this.queue(type, function(next, hooks) {
                    var timeout = setTimeout(next, time);
                    hooks.stop = function() {
                        clearTimeout(timeout);
                    };
                });
            },
            clearQueue: function(type) {
                return this.queue(type || "fx", []);
            },
            // Get a promise resolved when queues of a certain type
            // are emptied (fx is the type by default)
            promise: function(type, object) {
                if (typeof type !== "string") {
                    object = type;
                    type = undefined;
                }
                type = type || "fx";
                var defer = jQuery.Deferred(),
                    elements = this,
                    i = elements.length,
                    count = 1,
                    deferDataKey = type + "defer",
                    queueDataKey = type + "queue",
                    markDataKey = type + "mark",
                    tmp;

                function resolve() {
                    if (!(--count)) {
                        defer.resolveWith(elements, [elements]);
                    }
                }

                while (i--) {
                    if ((tmp = jQuery.data(elements[i], deferDataKey, undefined, true) ||
                        (jQuery.data(elements[i], queueDataKey, undefined, true) ||
                            jQuery.data(elements[i], markDataKey, undefined, true)) &&
                                jQuery.data(elements[i], deferDataKey, jQuery.Callbacks("once memory"), true))) {
                        count++;
                        tmp.add(resolve);
                    }
                }
                resolve();
                return defer.promise(object);
            }
        });


        var rclass = /[\n\t\r]/g ,
            rspace = /\s+/ ,
            rreturn = /\r/g ,
            rtype = /^(?:button|input)$/i ,
            rfocusable = /^(?:button|input|object|select|textarea)$/i ,
            rclickable = /^a(?:rea)?$/i ,
            rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i ,
            getSetAttribute = jQuery.support.getSetAttribute,
            nodeHook, boolHook, fixSpecified;

        jQuery.fn.extend({
            attr: function(name, value) {
                return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
            },

            removeAttr: function(name) {
                return this.each(function() {
                    jQuery.removeAttr(this, name);
                });
            },

            prop: function(name, value) {
                return jQuery.access(this, jQuery.prop, name, value, arguments.length > 1);
            },

            removeProp: function(name) {
                name = jQuery.propFix[name] || name;
                return this.each(function() {
                    // try/catch handles cases where IE balks (such as removing a property on window)
                    try {
                        this[name] = undefined;
                        delete this[name];
                    } catch(e) {
                    }
                });
            },

            addClass: function(value) {
                var classNames, i, l, elem,
                    setClass, c, cl;

                if (jQuery.isFunction(value)) {
                    return this.each(function(j) {
                        jQuery(this).addClass(value.call(this, j, this.className));
                    });
                }

                if (value && typeof value === "string") {
                    classNames = value.split(rspace);

                    for (i = 0, l = this.length; i < l; i++) {
                        elem = this[i];

                        if (elem.nodeType === 1) {
                            if (!elem.className && classNames.length === 1) {
                                elem.className = value;

                            } else {
                                setClass = " " + elem.className + " ";

                                for (c = 0, cl = classNames.length; c < cl; c++) {
                                    if (!~setClass.indexOf(" " + classNames[c] + " ")) {
                                        setClass += classNames[c] + " ";
                                    }
                                }
                                elem.className = jQuery.trim(setClass);
                            }
                        }
                    }
                }

                return this;
            },

            removeClass: function(value) {
                var classNames, i, l, elem, className, c, cl;

                if (jQuery.isFunction(value)) {
                    return this.each(function(j) {
                        jQuery(this).removeClass(value.call(this, j, this.className));
                    });
                }

                if ((value && typeof value === "string") || value === undefined) {
                    classNames = (value || "").split(rspace);

                    for (i = 0, l = this.length; i < l; i++) {
                        elem = this[i];

                        if (elem.nodeType === 1 && elem.className) {
                            if (value) {
                                className = (" " + elem.className + " ").replace(rclass, " ");
                                for (c = 0, cl = classNames.length; c < cl; c++) {
                                    className = className.replace(" " + classNames[c] + " ", " ");
                                }
                                elem.className = jQuery.trim(className);

                            } else {
                                elem.className = "";
                            }
                        }
                    }
                }

                return this;
            },

            toggleClass: function(value, stateVal) {
                var type = typeof value,
                    isBool = typeof stateVal === "boolean";

                if (jQuery.isFunction(value)) {
                    return this.each(function(i) {
                        jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                    });
                }

                return this.each(function() {
                    if (type === "string") {
                        // toggle individual class names
                        var className,
                            i = 0,
                            self = jQuery(this),
                            state = stateVal,
                            classNames = value.split(rspace);

                        while ((className = classNames[i++])) {
                            // check each className given, space seperated list
                            state = isBool ? state : !self.hasClass(className);
                            self[state ? "addClass" : "removeClass"](className);
                        }

                    } else if (type === "undefined" || type === "boolean") {
                        if (this.className) {
                            // store className if set
                            jQuery._data(this, "__className__", this.className);
                        }

                        // toggle whole className
                        this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
                    }
                });
            },

            hasClass: function(selector) {
                var className = " " + selector + " ",
                    i = 0,
                    l = this.length;
                for (; i < l; i++) {
                    if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1) {
                        return true;
                    }
                }

                return false;
            },

            val: function(value) {
                var hooks, ret, isFunction,
                    elem = this[0];

                if (!arguments.length) {
                    if (elem) {
                        hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

                        if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                            return ret;
                        }

                        ret = elem.value;

                        return typeof ret === "string" ?
                        // handle most common string cases
                            ret.replace(rreturn, "") :
                        // handle cases where value is null/undef or number
                            ret == null ? "" : ret;
                    }

                    return;
                }

                isFunction = jQuery.isFunction(value);

                return this.each(function(i) {
                    var self = jQuery(this), val;

                    if (this.nodeType !== 1) {
                        return;
                    }

                    if (isFunction) {
                        val = value.call(this, i, self.val());
                    } else {
                        val = value;
                    }

                    // Treat null/undefined as ""; convert numbers to string
                    if (val == null) {
                        val = "";
                    } else if (typeof val === "number") {
                        val += "";
                    } else if (jQuery.isArray(val)) {
                        val = jQuery.map(val, function(value) {
                            return value == null ? "" : value + "";
                        });
                    }

                    hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

                    // If set returns undefined, fall back to normal setting
                    if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
                        this.value = val;
                    }
                });
            }
        });

        jQuery.extend({
            valHooks: {
                option: {
                    get: function(elem) {
                        // attributes.value is undefined in Blackberry 4.7 but
                        // uses .value. See #6932
                        var val = elem.attributes.value;
                        return !val || val.specified ? elem.value : elem.text;
                    }
                },
                select: {
                    get: function(elem) {
                        var value, i, max, option,
                            index = elem.selectedIndex,
                            values = [],
                            options = elem.options,
                            one = elem.type === "select-one";

                        // Nothing was selected
                        if (index < 0) {
                            return null;
                        }

                        // Loop through all the selected options
                        i = one ? index : 0;
                        max = one ? index + 1 : options.length;
                        for (; i < max; i++) {
                            option = options[i];

                            // Don't return options that are disabled or in a disabled optgroup
                            if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
                                (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {

                                // Get the specific value for the option
                                value = jQuery(option).val();

                                // We don't need an array for one selects
                                if (one) {
                                    return value;
                                }

                                // Multi-Selects return an array
                                values.push(value);
                            }
                        }

                        // Fixes Bug #2551 -- select.val() broken in IE after form.reset()
                        if (one && !values.length && options.length) {
                            return jQuery(options[index]).val();
                        }

                        return values;
                    },

                    set: function(elem, value) {
                        var values = jQuery.makeArray(value);

                        jQuery(elem).find("option").each(function() {
                            this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                        });

                        if (!values.length) {
                            elem.selectedIndex = -1;
                        }
                        return values;
                    }
                }
            },

            attrFn: {
                val: true,
                css: true,
                html: true,
                text: true,
                data: true,
                width: true,
                height: true,
                offset: true
            },

            attr: function(elem, name, value, pass) {
                var ret, hooks, notxml,
                    nType = elem.nodeType;

                // don't get/set attributes on text, comment and attribute nodes
                if (!elem || nType === 3 || nType === 8 || nType === 2) {
                    return;
                }

                if (pass && name in jQuery.attrFn) {
                    return jQuery(elem)[name](value);
                }

                // Fallback to prop when attributes are not supported
                if (typeof elem.getAttribute === "undefined") {
                    return jQuery.prop(elem, name, value);
                }

                notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

                // All attributes are lowercase
                // Grab necessary hook if one is defined
                if (notxml) {
                    name = name.toLowerCase();
                    hooks = jQuery.attrHooks[name] || (rboolean.test(name) ? boolHook : nodeHook);
                }

                if (value !== undefined) {

                    if (value === null) {
                        jQuery.removeAttr(elem, name);
                        return;

                    } else if (hooks && "set" in hooks && notxml && (ret = hooks.set(elem, value, name)) !== undefined) {
                        return ret;

                    } else {
                        elem.setAttribute(name, "" + value);
                        return value;
                    }

                } else if (hooks && "get" in hooks && notxml && (ret = hooks.get(elem, name)) !== null) {
                    return ret;

                } else {

                    ret = elem.getAttribute(name);

                    // Non-existent attributes return null, we normalize to undefined
                    return ret === null ?
                        undefined :
                        ret;
                }
            },

            removeAttr: function(elem, value) {
                var propName, attrNames, name, l, isBool,
                    i = 0;

                if (value && elem.nodeType === 1) {
                    attrNames = value.toLowerCase().split(rspace);
                    l = attrNames.length;

                    for (; i < l; i++) {
                        name = attrNames[i];

                        if (name) {
                            propName = jQuery.propFix[name] || name;
                            isBool = rboolean.test(name);

                            // See #9699 for explanation of this approach (setting first, then removal)
                            // Do not do this for boolean attributes (see #10870)
                            if (!isBool) {
                                jQuery.attr(elem, name, "");
                            }
                            elem.removeAttribute(getSetAttribute ? name : propName);

                            // Set corresponding property to false for boolean attributes
                            if (isBool && propName in elem) {
                                elem[propName] = false;
                            }
                        }
                    }
                }
            },

            attrHooks: {
                type: {
                    set: function(elem, value) {
                        // We can't allow the type property to be changed (since it causes problems in IE)
                        if (rtype.test(elem.nodeName) && elem.parentNode) {
                            jQuery.error("type property can't be changed");
                        } else if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
                            // Setting the type on a radio button after the value resets the value in IE6-9
                            // Reset value to it's default in case type is set after value
                            // This is for element creation
                            var val = elem.value;
                            elem.setAttribute("type", value);
                            if (val) {
                                elem.value = val;
                            }
                            return value;
                        }
                    }
                },
                // Use the value property for back compat
                // Use the nodeHook for button elements in IE6/7 (#1954)
                value: {
                    get: function(elem, name) {
                        if (nodeHook && jQuery.nodeName(elem, "button")) {
                            return nodeHook.get(elem, name);
                        }
                        return name in elem ?
                            elem.value :
                            null;
                    },
                    set: function(elem, value, name) {
                        if (nodeHook && jQuery.nodeName(elem, "button")) {
                            return nodeHook.set(elem, value, name);
                        }
                        // Does not return so that setAttribute is also used
                        elem.value = value;
                    }
                }
            },

            propFix: {
                tabindex: "tabIndex",
                readonly: "readOnly",
                "for": "htmlFor",
                "class": "className",
                maxlength: "maxLength",
                cellspacing: "cellSpacing",
                cellpadding: "cellPadding",
                rowspan: "rowSpan",
                colspan: "colSpan",
                usemap: "useMap",
                frameborder: "frameBorder",
                contenteditable: "contentEditable"
            },

            prop: function(elem, name, value) {
                var ret, hooks, notxml,
                    nType = elem.nodeType;

                // don't get/set properties on text, comment and attribute nodes
                if (!elem || nType === 3 || nType === 8 || nType === 2) {
                    return;
                }

                notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

                if (notxml) {
                    // Fix name and attach hooks
                    name = jQuery.propFix[name] || name;
                    hooks = jQuery.propHooks[name];
                }

                if (value !== undefined) {
                    if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                        return ret;

                    } else {
                        return (elem[name] = value);
                    }

                } else {
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                        return ret;

                    } else {
                        return elem[name];
                    }
                }
            },

            propHooks: {
                tabIndex: {
                    get: function(elem) {
                        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                        var attributeNode = elem.getAttributeNode("tabindex");

                        return attributeNode && attributeNode.specified ?
                            parseInt(attributeNode.value, 10) :
                            rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ?
                                0 :
                                undefined;
                    }
                }
            }
        });

        // Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
        jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

        // Hook for boolean attributes
        boolHook = {
            get: function(elem, name) {
                // Align boolean attributes with corresponding properties
                // Fall back to attribute presence where some booleans are not supported
                var attrNode,
                    property = jQuery.prop(elem, name);
                return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) && attrNode.nodeValue !== false ?
                    name.toLowerCase() :
                    undefined;
            },
            set: function(elem, value, name) {
                var propName;
                if (value === false) {
                    // Remove boolean attributes when set to false
                    jQuery.removeAttr(elem, name);
                } else {
                    // value is true since we know at this point it's type boolean and not false
                    // Set boolean attributes to the same name and set the DOM property
                    propName = jQuery.propFix[name] || name;
                    if (propName in elem) {
                        // Only set the IDL specifically if it already exists on the element
                        elem[propName] = true;
                    }

                    elem.setAttribute(name, name.toLowerCase());
                }
                return name;
            }
        };

        // IE6/7 do not support getting/setting some attributes with get/setAttribute
        if (!getSetAttribute) {

            fixSpecified = {
                name: true,
                id: true,
                coords: true
            };

            // Use this for any attribute in IE6/7
            // This fixes almost every IE6/7 issue
            nodeHook = jQuery.valHooks.button = {
                get: function(elem, name) {
                    var ret;
                    ret = elem.getAttributeNode(name);
                    return ret && (fixSpecified[name] ? ret.nodeValue !== "" : ret.specified) ?
                        ret.nodeValue :
                        undefined;
                },
                set: function(elem, value, name) {
                    // Set the existing or create a new attribute node
                    var ret = elem.getAttributeNode(name);
                    if (!ret) {
                        ret = document.createAttribute(name);
                        elem.setAttributeNode(ret);
                    }
                    return (ret.nodeValue = value + "");
                }
            };

            // Apply the nodeHook to tabindex
            jQuery.attrHooks.tabindex.set = nodeHook.set;

            // Set width and height to auto instead of 0 on empty string( Bug #8150 )
            // This is for removals
            jQuery.each(["width", "height"], function(i, name) {
                jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
                    set: function(elem, value) {
                        if (value === "") {
                            elem.setAttribute(name, "auto");
                            return value;
                        }
                    }
                });
            });

            // Set contenteditable to false on removals(#10429)
            // Setting to empty string throws an error as an invalid value
            jQuery.attrHooks.contenteditable = {
                get: nodeHook.get,
                set: function(elem, value, name) {
                    if (value === "") {
                        value = "false";
                    }
                    nodeHook.set(elem, value, name);
                }
            };
        }


        // Some attributes require a special call on IE
        if (!jQuery.support.hrefNormalized) {
            jQuery.each(["href", "src", "width", "height"], function(i, name) {
                jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
                    get: function(elem) {
                        var ret = elem.getAttribute(name, 2);
                        return ret === null ? undefined : ret;
                    }
                });
            });
        }

        if (!jQuery.support.style) {
            jQuery.attrHooks.style = {
                get: function(elem) {
                    // Return undefined in the case of empty string
                    // Normalize to lowercase since IE uppercases css property names
                    return elem.style.cssText.toLowerCase() || undefined;
                },
                set: function(elem, value) {
                    return (elem.style.cssText = "" + value);
                }
            };
        }

        // Safari mis-reports the default selected property of an option
        // Accessing the parent's selectedIndex property fixes it
        if (!jQuery.support.optSelected) {
            jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
                get: function(elem) {
                    var parent = elem.parentNode;

                    if (parent) {
                        parent.selectedIndex;

                        // Make sure that it also works with optgroups, see #5701
                        if (parent.parentNode) {
                            parent.parentNode.selectedIndex;
                        }
                    }
                    return null;
                }
            });
        }

        // IE6/7 call enctype encoding
        if (!jQuery.support.enctype) {
            jQuery.propFix.enctype = "encoding";
        }

        // Radios and checkboxes getter/setter
        if (!jQuery.support.checkOn) {
            jQuery.each(["radio", "checkbox"], function() {
                jQuery.valHooks[this] = {
                    get: function(elem) {
                        // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                        return elem.getAttribute("value") === null ? "on" : elem.value;
                    }
                };
            });
        }
        jQuery.each(["radio", "checkbox"], function() {
            jQuery.valHooks[this] = jQuery.extend(jQuery.valHooks[this], {
                set: function(elem, value) {
                    if (jQuery.isArray(value)) {
                        return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0);
                    }
                }
            });
        });


        var rformElems = /^(?:textarea|input|select)$/i ,
            rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/ ,
            rhoverHack = /(?:^|\s)hover(\.\S+)?\b/ ,
            rkeyEvent = /^key/ ,
            rmouseEvent = /^(?:mouse|contextmenu)|click/ ,
            rfocusMorph = /^(?:focusinfocus|focusoutblur)$/ ,
            rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/ ,
            quickParse = function(selector) {
                var quick = rquickIs.exec(selector);
                if (quick) {
                    //   0  1    2   3
                    // [ _, tag, id, class ]
                    quick[1] = (quick[1] || "").toLowerCase();
                    quick[3] = quick[3] && new RegExp("(?:^|\\s)" + quick[3] + "(?:\\s|$)");
                }
                return quick;
            },
            quickIs = function(elem, m) {
                var attrs = elem.attributes || { };
                return (
                    (!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
                        (!m[2] || (attrs.id || { }).value === m[2]) &&
                            (!m[3] || m[3].test((attrs["class"] || { }).value))
                );
            },
            hoverHack = function(events) {
                return jQuery.event.special.hover ? events : events.replace(rhoverHack, "mouseenter$1 mouseleave$1");
            };

        /*
        * Helper functions for managing events -- not part of the public interface.
        * Props to Dean Edwards' addEvent library for many of the ideas.
        */
        jQuery.event = {
            add: function(elem, types, handler, data, selector) {

                var elemData, eventHandle, events,
                    t, tns, type, namespaces, handleObj,
                    handleObjIn, quick, handlers, special;

                // Don't attach events to noData or text/comment nodes (allow plain objects tho)
                if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem))) {
                    return;
                }

                // Caller can pass in an object of custom data in lieu of the handler
                if (handler.handler) {
                    handleObjIn = handler;
                    handler = handleObjIn.handler;
                    selector = handleObjIn.selector;
                }

                // Make sure that the handler has a unique ID, used to find/remove it later
                if (!handler.guid) {
                    handler.guid = jQuery.guid++;
                }

                // Init the element's event structure and main handler, if this is the first
                events = elemData.events;
                if (!events) {
                    elemData.events = events = { };
                }
                eventHandle = elemData.handle;
                if (!eventHandle) {
                    elemData.handle = eventHandle = function(e) {
                        // Discard the second event of a jQuery.event.trigger() and
                        // when an event is called after a page has unloaded
                        return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
                            jQuery.event.dispatch.apply(eventHandle.elem, arguments) :
                            undefined;
                    };
                    // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
                    eventHandle.elem = elem;
                }

                // Handle multiple events separated by a space
                // jQuery(...).bind("mouseover mouseout", fn);
                types = jQuery.trim(hoverHack(types)).split(" ");
                for (t = 0; t < types.length; t++) {

                    tns = rtypenamespace.exec(types[t]) || [];
                    type = tns[1];
                    namespaces = (tns[2] || "").split(".").sort();

                    // If event changes its type, use the special event handlers for the changed type
                    special = jQuery.event.special[type] || { };

                    // If selector defined, determine special event api type, otherwise given type
                    type = (selector ? special.delegateType : special.bindType) || type;

                    // Update special based on newly reset type
                    special = jQuery.event.special[type] || { };

                    // handleObj is passed to all event handlers
                    handleObj = jQuery.extend({
                        type: type,
                        origType: tns[1],
                        data: data,
                        handler: handler,
                        guid: handler.guid,
                        selector: selector,
                        quick: selector && quickParse(selector),
                        namespace: namespaces.join(".")
                    }, handleObjIn);

                    // Init the event handler queue if we're the first
                    handlers = events[type];
                    if (!handlers) {
                        handlers = events[type] = [];
                        handlers.delegateCount = 0;

                        // Only use addEventListener/attachEvent if the special events handler returns false
                        if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                            // Bind the global event handler to the element
                            if (elem.addEventListener) {
                                elem.addEventListener(type, eventHandle, false);

                            } else if (elem.attachEvent) {
                                elem.attachEvent("on" + type, eventHandle);
                            }
                        }
                    }

                    if (special.add) {
                        special.add.call(elem, handleObj);

                        if (!handleObj.handler.guid) {
                            handleObj.handler.guid = handler.guid;
                        }
                    }

                    // Add to the element's handler list, delegates in front
                    if (selector) {
                        handlers.splice(handlers.delegateCount++, 0, handleObj);
                    } else {
                        handlers.push(handleObj);
                    }

                    // Keep track of which events have ever been used, for event optimization
                    jQuery.event.global[type] = true;
                }

                // Nullify elem to prevent memory leaks in IE
                elem = null;
            },

            global: { },

            // Detach an event or set of events from an element
            remove: function(elem, types, handler, selector, mappedTypes) {

                var elemData = jQuery.hasData(elem) && jQuery._data(elem),
                    t, tns, type, origType, namespaces, origCount,
                    j, events, special, handle, eventType, handleObj;

                if (!elemData || !(events = elemData.events)) {
                    return;
                }

                // Once for each type.namespace in types; type may be omitted
                types = jQuery.trim(hoverHack(types || "")).split(" ");
                for (t = 0; t < types.length; t++) {
                    tns = rtypenamespace.exec(types[t]) || [];
                    type = origType = tns[1];
                    namespaces = tns[2];

                    // Unbind all events (on this namespace, if provided) for the element
                    if (!type) {
                        for (type in events) {
                            jQuery.event.remove(elem, type + types[t], handler, selector, true);
                        }
                        continue;
                    }

                    special = jQuery.event.special[type] || { };
                    type = (selector ? special.delegateType : special.bindType) || type;
                    eventType = events[type] || [];
                    origCount = eventType.length;
                    namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

                    // Remove matching events
                    for (j = 0; j < eventType.length; j++) {
                        handleObj = eventType[j];

                        if ((mappedTypes || origType === handleObj.origType) &&
                            (!handler || handler.guid === handleObj.guid) &&
                                (!namespaces || namespaces.test(handleObj.namespace)) &&
                                    (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                            eventType.splice(j--, 1);

                            if (handleObj.selector) {
                                eventType.delegateCount--;
                            }
                            if (special.remove) {
                                special.remove.call(elem, handleObj);
                            }
                        }
                    }

                    // Remove generic event handler if we removed something and no more handlers exist
                    // (avoids potential for endless recursion during removal of special event handlers)
                    if (eventType.length === 0 && origCount !== eventType.length) {
                        if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
                            jQuery.removeEvent(elem, type, elemData.handle);
                        }

                        delete events[type];
                    }
                }

                // Remove the expando if it's no longer used
                if (jQuery.isEmptyObject(events)) {
                    handle = elemData.handle;
                    if (handle) {
                        handle.elem = null;
                    }

                    // removeData also checks for emptiness and clears the expando if empty
                    // so use it instead of delete
                    jQuery.removeData(elem, ["events", "handle"], true);
                }
            },

            // Events that are safe to short-circuit if no handlers are attached.
            // Native DOM events should not be added, they may have inline handlers.
            customEvent: {
                "getData": true,
                "setData": true,
                "changeData": true
            },

            trigger: function(event, data, elem, onlyHandlers) {
                // Don't do events on text and comment nodes
                if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
                    return;
                }

                // Event object or event type
                var type = event.type || event,
                    namespaces = [],
                    cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

                // focus/blur morphs to focusin/out; ensure we're not firing them right now
                if (rfocusMorph.test(type + jQuery.event.triggered)) {
                    return;
                }

                if (type.indexOf("!") >= 0) {
                    // Exclusive events trigger only for the exact event (no namespaces)
                    type = type.slice(0, -1);
                    exclusive = true;
                }

                if (type.indexOf(".") >= 0) {
                    // Namespaced trigger; create a regexp to match event type in handle()
                    namespaces = type.split(".");
                    type = namespaces.shift();
                    namespaces.sort();
                }

                if ((!elem || jQuery.event.customEvent[type]) && !jQuery.event.global[type]) {
                    // No jQuery handlers for this event type, and it can't have inline handlers
                    return;
                }

                // Caller can pass in an Event, Object, or just an event type string
                event = typeof event === "object" ?
                // jQuery.Event object
                    event[jQuery.expando] ? event :
                // Object literal
                        new jQuery.Event(type, event) :
                // Just the event type (string)
                    new jQuery.Event(type);

                event.type = type;
                event.isTrigger = true;
                event.exclusive = exclusive;
                event.namespace = namespaces.join(".");
                event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
                ontype = type.indexOf(":") < 0 ? "on" + type : "";

                // Handle a global trigger
                if (!elem) {

                    // TODO: Stop taunting the data cache; remove global events and always attach to document
                    cache = jQuery.cache;
                    for (i in cache) {
                        if (cache[i].events && cache[i].events[type]) {
                            jQuery.event.trigger(event, data, cache[i].handle.elem, true);
                        }
                    }
                    return;
                }

                // Clean up the event in case it is being reused
                event.result = undefined;
                if (!event.target) {
                    event.target = elem;
                }

                // Clone any incoming data and prepend the event, creating the handler arg list
                data = data != null ? jQuery.makeArray(data) : [];
                data.unshift(event);

                // Allow special events to draw outside the lines
                special = jQuery.event.special[type] || { };
                if (special.trigger && special.trigger.apply(elem, data) === false) {
                    return;
                }

                // Determine event propagation path in advance, per W3C events spec (#9951)
                // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
                eventPath = [[elem, special.bindType || type]];
                if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

                    bubbleType = special.delegateType || type;
                    cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                    old = null;
                    for (; cur; cur = cur.parentNode) {
                        eventPath.push([cur, bubbleType]);
                        old = cur;
                    }

                    // Only add window if we got to document (e.g., not plain obj or detached DOM)
                    if (old && old === elem.ownerDocument) {
                        eventPath.push([old.defaultView || old.parentWindow || window, bubbleType]);
                    }
                }

                // Fire handlers on the event path
                for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {

                    cur = eventPath[i][0];
                    event.type = eventPath[i][1];

                    handle = (jQuery._data(cur, "events") || { })[event.type] && jQuery._data(cur, "handle");
                    if (handle) {
                        handle.apply(cur, data);
                    }
                    // Note that this is a bare JS function and not a jQuery handler
                    handle = ontype && cur[ontype];
                    if (handle && jQuery.acceptData(cur) && handle.apply(cur, data) === false) {
                        event.preventDefault();
                    }
                }
                event.type = type;

                // If nobody prevented the default action, do it now
                if (!onlyHandlers && !event.isDefaultPrevented()) {

                    if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) &&
                        !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) {

                        // Call a native DOM method on the target with the same name name as the event.
                        // Can't use an .isFunction() check here because IE6/7 fails that test.
                        // Don't do default actions on window, that's where global variables be (#6170)
                        // IE<9 dies on focus/blur to hidden element (#1486)
                        if (ontype && elem[type] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow(elem)) {

                            // Don't re-trigger an onFOO event when we call its FOO() method
                            old = elem[ontype];

                            if (old) {
                                elem[ontype] = null;
                            }

                            // Prevent re-triggering of the same event, since we already bubbled it above
                            jQuery.event.triggered = type;
                            elem[type]();
                            jQuery.event.triggered = undefined;

                            if (old) {
                                elem[ontype] = old;
                            }
                        }
                    }
                }

                return event.result;
            },

            dispatch: function(event) {

                // Make a writable jQuery.Event from the native event object
                event = jQuery.event.fix(event || window.event);

                var handlers = ((jQuery._data(this, "events") || { })[event.type] || []),
                    delegateCount = handlers.delegateCount,
                    args = [].slice.call(arguments, 0),
                    run_all = !event.exclusive && !event.namespace,
                    special = jQuery.event.special[event.type] || { },
                    handlerQueue = [],
                    i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

                // Use the fix-ed jQuery.Event rather than the (read-only) native event
                args[0] = event;
                event.delegateTarget = this;

                // Call the preDispatch hook for the mapped type, and let it bail if desired
                if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                    return;
                }

                // Determine handlers that should run if there are delegated events
                // Avoid non-left-click bubbling in Firefox (#3861)
                if (delegateCount && !(event.button && event.type === "click")) {

                    // Pregenerate a single jQuery object for reuse with .is()
                    jqcur = jQuery(this);
                    jqcur.context = this.ownerDocument || this;

                    for (cur = event.target; cur != this; cur = cur.parentNode || this) {

                        // Don't process events on disabled elements (#6911, #8165)
                        if (cur.disabled !== true) {
                            selMatch = { };
                            matches = [];
                            jqcur[0] = cur;
                            for (i = 0; i < delegateCount; i++) {
                                handleObj = handlers[i];
                                sel = handleObj.selector;

                                if (selMatch[sel] === undefined) {
                                    selMatch[sel] = (
                                        handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel)
                                    );
                                }
                                if (selMatch[sel]) {
                                    matches.push(handleObj);
                                }
                            }
                            if (matches.length) {
                                handlerQueue.push({ elem: cur, matches: matches });
                            }
                        }
                    }
                }

                // Add the remaining (directly-bound) handlers
                if (handlers.length > delegateCount) {
                    handlerQueue.push({ elem: this, matches: handlers.slice(delegateCount) });
                }

                // Run delegates first; they may want to stop propagation beneath us
                for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
                    matched = handlerQueue[i];
                    event.currentTarget = matched.elem;

                    for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
                        handleObj = matched.matches[j];

                        // Triggered event must either 1) be non-exclusive and have no namespace, or
                        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                        if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {

                            event.data = handleObj.data;
                            event.handleObj = handleObj;

                            ret = ((jQuery.event.special[handleObj.origType] || { }).handle || handleObj.handler)
                                .apply(matched.elem, args);

                            if (ret !== undefined) {
                                event.result = ret;
                                if (ret === false) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                        }
                    }
                }

                // Call the postDispatch hook for the mapped type
                if (special.postDispatch) {
                    special.postDispatch.call(this, event);
                }

                return event.result;
            },

            // Includes some event props shared by KeyEvent and MouseEvent
            // *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
            props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

            fixHooks: { },

            keyHooks: {
                props: "char charCode key keyCode".split(" "),
                filter: function(event, original) {

                    // Add which for key events
                    if (event.which == null) {
                        event.which = original.charCode != null ? original.charCode : original.keyCode;
                    }

                    return event;
                }
            },

            mouseHooks: {
                props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
                filter: function(event, original) {
                    var eventDoc, doc, body,
                        button = original.button,
                        fromElement = original.fromElement;

                    // Calculate pageX/Y if missing and clientX/Y available
                    if (event.pageX == null && original.clientX != null) {
                        eventDoc = event.target.ownerDocument || document;
                        doc = eventDoc.documentElement;
                        body = eventDoc.body;

                        event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                        event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                    }

                    // Add relatedTarget, if necessary
                    if (!event.relatedTarget && fromElement) {
                        event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                    }

                    // Add which for click: 1 === left; 2 === middle; 3 === right
                    // Note: button is not normalized, so don't use it
                    if (!event.which && button !== undefined) {
                        event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
                    }

                    return event;
                }
            },

            fix: function(event) {
                if (event[jQuery.expando]) {
                    return event;
                }

                // Create a writable copy of the event object and normalize some properties
                var i, prop,
                    originalEvent = event,
                    fixHook = jQuery.event.fixHooks[event.type] || { },
                    copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

                event = jQuery.Event(originalEvent);

                for (i = copy.length; i;) {
                    prop = copy[--i];
                    event[prop] = originalEvent[prop];
                }

                // Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
                if (!event.target) {
                    event.target = originalEvent.srcElement || document;
                }

                // Target should not be a text node (#504, Safari)
                if (event.target.nodeType === 3) {
                    event.target = event.target.parentNode;
                }

                // For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
                if (event.metaKey === undefined) {
                    event.metaKey = event.ctrlKey;
                }

                return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
            },

            special: {
                ready: {
                // Make sure the ready event is setup
                    setup: jQuery.bindReady
                },

                load: {
                // Prevent triggered image.load events from bubbling to window.load
                    noBubble: true
                },

                focus: {
                    delegateType: "focusin"
                },
                blur: {
                    delegateType: "focusout"
                },

                beforeunload: {
                    setup: function(data, namespaces, eventHandle) {
                        // We only want to do this special case on windows
                        if (jQuery.isWindow(this)) {
                            this.onbeforeunload = eventHandle;
                        }
                    },

                    teardown: function(namespaces, eventHandle) {
                        if (this.onbeforeunload === eventHandle) {
                            this.onbeforeunload = null;
                        }
                    }
                }
            },

            simulate: function(type, elem, event, bubble) {
                // Piggyback on a donor event to simulate a different one.
                // Fake originalEvent to avoid donor's stopPropagation, but if the
                // simulated event prevents default then we do the same on the donor.
                var e = jQuery.extend(
                    new jQuery.Event(),
                    event,
                    {
                        type: type,
                        isSimulated: true,
                        originalEvent: { }
                    }
                );
                if (bubble) {
                    jQuery.event.trigger(e, null, elem);
                } else {
                    jQuery.event.dispatch.call(elem, e);
                }
                if (e.isDefaultPrevented()) {
                    event.preventDefault();
                }
            }
        };

        // Some plugins are using, but it's undocumented/deprecated and will be removed.
        // The 1.7 special event interface should provide all the hooks needed now.
        jQuery.event.handle = jQuery.event.dispatch;

        jQuery.removeEvent = document.removeEventListener ?
            function(elem, type, handle) {
                if (elem.removeEventListener) {
                    elem.removeEventListener(type, handle, false);
                }
            } :
            function(elem, type, handle) {
                if (elem.detachEvent) {
                    elem.detachEvent("on" + type, handle);
                }
            };

        jQuery.Event = function(src, props) {
            // Allow instantiation without the 'new' keyword
            if (!(this instanceof jQuery.Event)) {
                return new jQuery.Event(src, props);
            }

            // Event object
            if (src && src.type) {
                this.originalEvent = src;
                this.type = src.type;

                // Events bubbling up the document may have been marked as prevented
                // by a handler lower down the tree; reflect the correct value.
                this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
                    src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

                // Event type
            } else {
                this.type = src;
            }

            // Put explicitly provided properties onto the event object
            if (props) {
                jQuery.extend(this, props);
            }

            // Create a timestamp if incoming event doesn't have one
            this.timeStamp = src && src.timeStamp || jQuery.now();

            // Mark it as fixed
            this[jQuery.expando] = true;
        };

        function returnFalse() {
            return false;
        }

        function returnTrue() {
            return true;
        }

        // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
        // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
        jQuery.Event.prototype = {
            preventDefault: function() {
                this.isDefaultPrevented = returnTrue;

                var e = this.originalEvent;
                if (!e) {
                    return;
                }

                // if preventDefault exists run it on the original event
                if (e.preventDefault) {
                    e.preventDefault();

                    // otherwise set the returnValue property of the original event to false (IE)
                } else {
                    e.returnValue = false;
                }
            },
            stopPropagation: function() {
                this.isPropagationStopped = returnTrue;

                var e = this.originalEvent;
                if (!e) {
                    return;
                }
                // if stopPropagation exists run it on the original event
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                // otherwise set the cancelBubble property of the original event to true (IE)
                e.cancelBubble = true;
            },
            stopImmediatePropagation: function() {
                this.isImmediatePropagationStopped = returnTrue;
                this.stopPropagation();
            },
            isDefaultPrevented: returnFalse,
            isPropagationStopped: returnFalse,
            isImmediatePropagationStopped: returnFalse
        };

        // Create mouseenter/leave events using mouseover/out and event-time checks
        jQuery.each({
                mouseenter: "mouseover",
                mouseleave: "mouseout"
            }, function(orig, fix) {
                jQuery.event.special[orig] = {
                    delegateType: fix,
                    bindType: fix,

                    handle: function(event) {
                        var target = this,
                            related = event.relatedTarget,
                            handleObj = event.handleObj,
                            selector = handleObj.selector,
                            ret;

                        // For mousenter/leave call the handler if related is outside the target.
                        // NB: No relatedTarget if the mouse left/entered the browser window
                        if (!related || (related !== target && !jQuery.contains(target, related))) {
                            event.type = handleObj.origType;
                            ret = handleObj.handler.apply(this, arguments);
                            event.type = fix;
                        }
                        return ret;
                    }
                };
            });

        // IE submit delegation
        if (!jQuery.support.submitBubbles) {

            jQuery.event.special.submit = {
                setup: function() {
                    // Only need this for delegated form submit events
                    if (jQuery.nodeName(this, "form")) {
                        return false;
                    }

                    // Lazy-add a submit handler when a descendant form may potentially be submitted
                    jQuery.event.add(this, "click._submit keypress._submit", function(e) {
                        // Node name check avoids a VML-related crash in IE (#9807)
                        var elem = e.target,
                            form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
                        if (form && !form._submit_attached) {
                            jQuery.event.add(form, "submit._submit", function(event) {
                                event._submit_bubble = true;
                            });
                            form._submit_attached = true;
                        }
                    });
                    // return undefined since we don't need an event listener
                },

                postDispatch: function(event) {
                    // If form was submitted by the user, bubble the event up the tree
                    if (event._submit_bubble) {
                        delete event._submit_bubble;
                        if (this.parentNode && !event.isTrigger) {
                            jQuery.event.simulate("submit", this.parentNode, event, true);
                        }
                    }
                },

                teardown: function() {
                    // Only need this for delegated form submit events
                    if (jQuery.nodeName(this, "form")) {
                        return false;
                    }

                    // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
                    jQuery.event.remove(this, "._submit");
                }
            };
        }

        // IE change delegation and checkbox/radio fix
        if (!jQuery.support.changeBubbles) {

            jQuery.event.special.change = {
                setup: function() {

                    if (rformElems.test(this.nodeName)) {
                        // IE doesn't fire change on a check/radio until blur; trigger it on click
                        // after a propertychange. Eat the blur-change in special.change.handle.
                        // This still fires onchange a second time for check/radio after blur.
                        if (this.type === "checkbox" || this.type === "radio") {
                            jQuery.event.add(this, "propertychange._change", function(event) {
                                if (event.originalEvent.propertyName === "checked") {
                                    this._just_changed = true;
                                }
                            });
                            jQuery.event.add(this, "click._change", function(event) {
                                if (this._just_changed && !event.isTrigger) {
                                    this._just_changed = false;
                                    jQuery.event.simulate("change", this, event, true);
                                }
                            });
                        }
                        return false;
                    }
                    // Delegated event; lazy-add a change handler on descendant inputs
                    jQuery.event.add(this, "beforeactivate._change", function(e) {
                        var elem = e.target;

                        if (rformElems.test(elem.nodeName) && !elem._change_attached) {
                            jQuery.event.add(elem, "change._change", function(event) {
                                if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                                    jQuery.event.simulate("change", this.parentNode, event, true);
                                }
                            });
                            elem._change_attached = true;
                        }
                    });
                },

                handle: function(event) {
                    var elem = event.target;

                    // Swallow native change events from checkbox/radio, we already triggered them above
                    if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
                        return event.handleObj.handler.apply(this, arguments);
                    }
                },

                teardown: function() {
                    jQuery.event.remove(this, "._change");

                    return rformElems.test(this.nodeName);
                }
            };
        }

        // Create "bubbling" focus and blur events
        if (!jQuery.support.focusinBubbles) {
            jQuery.each({ focus: "focusin", blur: "focusout" }, function(orig, fix) {

                // Attach a single capturing handler while someone wants focusin/focusout
                var attaches = 0,
                    handler = function(event) {
                        jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
                    };

                jQuery.event.special[fix] = {
                    setup: function() {
                        if (attaches++ === 0) {
                            document.addEventListener(orig, handler, true);
                        }
                    },
                    teardown: function() {
                        if (--attaches === 0) {
                            document.removeEventListener(orig, handler, true);
                        }
                    }
                };
            });
        }

        jQuery.fn.extend({
            on: function(types, selector, data, fn, /*INTERNAL*/one) {
                var origFn, type;

                // Types can be a map of types/handlers
                if (typeof types === "object") {
                    // ( types-Object, selector, data )
                    if (typeof selector !== "string") { // && selector != null
                        // ( types-Object, data )
                        data = data || selector;
                        selector = undefined;
                    }
                    for (type in types) {
                        this.on(type, selector, data, types[type], one);
                    }
                    return this;
                }

                if (data == null && fn == null) {
                    // ( types, fn )
                    fn = selector;
                    data = selector = undefined;
                } else if (fn == null) {
                    if (typeof selector === "string") {
                        // ( types, selector, fn )
                        fn = data;
                        data = undefined;
                    } else {
                        // ( types, data, fn )
                        fn = data;
                        data = selector;
                        selector = undefined;
                    }
                }
                if (fn === false) {
                    fn = returnFalse;
                } else if (!fn) {
                    return this;
                }

                if (one === 1) {
                    origFn = fn;
                    fn = function(event) {
                        // Can use an empty set, since event contains the info
                        jQuery().off(event);
                        return origFn.apply(this, arguments);
                    };
                    // Use same guid so caller can remove using origFn
                    fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
                }
                return this.each(function() {
                    jQuery.event.add(this, types, fn, data, selector);
                });
            },
            one: function(types, selector, data, fn) {
                return this.on(types, selector, data, fn, 1);
            },
            off: function(types, selector, fn) {
                if (types && types.preventDefault && types.handleObj) {
                    // ( event )  dispatched jQuery.Event
                    var handleObj = types.handleObj;
                    jQuery(types.delegateTarget).off(
                        handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                        handleObj.selector,
                        handleObj.handler
                    );
                    return this;
                }
                if (typeof types === "object") {
                    // ( types-object [, selector] )
                    for (var type in types) {
                        this.off(type, selector, types[type]);
                    }
                    return this;
                }
                if (selector === false || typeof selector === "function") {
                    // ( types [, fn] )
                    fn = selector;
                    selector = undefined;
                }
                if (fn === false) {
                    fn = returnFalse;
                }
                return this.each(function() {
                    jQuery.event.remove(this, types, fn, selector);
                });
            },

            bind: function(types, data, fn) {
                return this.on(types, null, data, fn);
            },
            unbind: function(types, fn) {
                return this.off(types, null, fn);
            },

            live: function(types, data, fn) {
                jQuery(this.context).on(types, this.selector, data, fn);
                return this;
            },
            die: function(types, fn) {
                jQuery(this.context).off(types, this.selector || "**", fn);
                return this;
            },

            delegate: function(selector, types, data, fn) {
                return this.on(types, selector, data, fn);
            },
            undelegate: function(selector, types, fn) {
                // ( namespace ) or ( selector, types [, fn] )
                return arguments.length == 1 ? this.off(selector, "**") : this.off(types, selector, fn);
            },

            trigger: function(type, data) {
                return this.each(function() {
                    jQuery.event.trigger(type, data, this);
                });
            },
            triggerHandler: function(type, data) {
                if (this[0]) {
                    return jQuery.event.trigger(type, data, this[0], true);
                }
            },

            toggle: function(fn) {
                // Save reference to arguments for access in closure
                var args = arguments,
                    guid = fn.guid || jQuery.guid++,
                    i = 0,
                    toggler = function(event) {
                        // Figure out which function to execute
                        var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
                        jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);

                        // Make sure that clicks stop
                        event.preventDefault();

                        // and execute the function
                        return args[lastToggle].apply(this, arguments) || false;
                    };

                // link all the functions, so any of them can unbind this click handler
                toggler.guid = guid;
                while (i < args.length) {
                    args[i++].guid = guid;
                }

                return this.click(toggler);
            },

            hover: function(fnOver, fnOut) {
                return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
            }
        });

        jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
            "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
            "change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {

                // Handle event binding
                jQuery.fn[name] = function(data, fn) {
                    if (fn == null) {
                        fn = data;
                        data = null;
                    }

                    return arguments.length > 0 ?
                        this.on(name, null, data, fn) :
                        this.trigger(name);
                };

                if (jQuery.attrFn) {
                    jQuery.attrFn[name] = true;
                }

                if (rkeyEvent.test(name)) {
                    jQuery.event.fixHooks[name] = jQuery.event.keyHooks;
                }

                if (rmouseEvent.test(name)) {
                    jQuery.event.fixHooks[name] = jQuery.event.mouseHooks;
                }
            });


        /*!
        * Sizzle CSS Selector Engine
        *  Copyright 2011, The Dojo Foundation
        *  Released under the MIT, BSD, and GPL Licenses.
        *  More information: http://sizzlejs.com/
        */
        (function() {

            var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g ,
                expando = "sizcache" + (Math.random() + '').replace('.', ''),
                done = 0,
                toString = Object.prototype.toString,
                hasDuplicate = false,
                baseHasDuplicate = true,
                rBackslash = /\\/g ,
                rReturn = /\r\n/g ,
                rNonWord = /\W/ ;

            // Here we check if the JavaScript engine is using some sort of
            // optimization where it does not always call our comparision
            // function. If that is the case, discard the hasDuplicate value.
            //   Thus far that includes Google Chrome.
            [0, 0].sort(function() {
                baseHasDuplicate = false;
                return 0;
            });

            var Sizzle = function(selector, context, results, seed) {
                results = results || [];
                context = context || document;

                var origContext = context;

                if (context.nodeType !== 1 && context.nodeType !== 9) {
                    return [];
                }

                if (!selector || typeof selector !== "string") {
                    return results;
                }

                var m, set, checkSet, extra, ret, cur, pop, i,
                    prune = true,
                    contextXML = Sizzle.isXML(context),
                    parts = [],
                    soFar = selector;

                // Reset the position of the chunker regexp (start from head)
                do {
                    chunker.exec("");
                    m = chunker.exec(soFar);

                    if (m) {
                        soFar = m[3];

                        parts.push(m[1]);

                        if (m[2]) {
                            extra = m[3];
                            break;
                        }
                    }
                } while (m);

                if (parts.length > 1 && origPOS.exec(selector)) {

                    if (parts.length === 2 && Expr.relative[parts[0]]) {
                        set = posProcess(parts[0] + parts[1], context, seed);

                    } else {
                        set = Expr.relative[parts[0]] ?
                            [context] :
                            Sizzle(parts.shift(), context);

                        while (parts.length) {
                            selector = parts.shift();

                            if (Expr.relative[selector]) {
                                selector += parts.shift();
                            }

                            set = posProcess(selector, set, seed);
                        }
                    }

                } else {
                    // Take a shortcut and set the context if the root selector is an ID
                    // (but not if it'll be faster if the inner selector is an ID)
                    if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                        Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {

                        ret = Sizzle.find(parts.shift(), context, contextXML);
                        context = ret.expr ?
                            Sizzle.filter(ret.expr, ret.set)[0] :
                            ret.set[0];
                    }

                    if (context) {
                        ret = seed ?
                            { expr: parts.pop(), set: makeArray(seed) } :
                            Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);

                        set = ret.expr ?
                            Sizzle.filter(ret.expr, ret.set) :
                            ret.set;

                        if (parts.length > 0) {
                            checkSet = makeArray(set);

                        } else {
                            prune = false;
                        }

                        while (parts.length) {
                            cur = parts.pop();
                            pop = cur;

                            if (!Expr.relative[cur]) {
                                cur = "";
                            } else {
                                pop = parts.pop();
                            }

                            if (pop == null) {
                                pop = context;
                            }

                            Expr.relative[cur](checkSet, pop, contextXML);
                        }

                    } else {
                        checkSet = parts = [];
                    }
                }

                if (!checkSet) {
                    checkSet = set;
                }

                if (!checkSet) {
                    Sizzle.error(cur || selector);
                }

                if (toString.call(checkSet) === "[object Array]") {
                    if (!prune) {
                        results.push.apply(results, checkSet);

                    } else if (context && context.nodeType === 1) {
                        for (i = 0; checkSet[i] != null; i++) {
                            if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                                results.push(set[i]);
                            }
                        }

                    } else {
                        for (i = 0; checkSet[i] != null; i++) {
                            if (checkSet[i] && checkSet[i].nodeType === 1) {
                                results.push(set[i]);
                            }
                        }
                    }

                } else {
                    makeArray(checkSet, results);
                }

                if (extra) {
                    Sizzle(extra, origContext, results, seed);
                    Sizzle.uniqueSort(results);
                }

                return results;
            };

            Sizzle.uniqueSort = function(results) {
                if (sortOrder) {
                    hasDuplicate = baseHasDuplicate;
                    results.sort(sortOrder);

                    if (hasDuplicate) {
                        for (var i = 1; i < results.length; i++) {
                            if (results[i] === results[i - 1]) {
                                results.splice(i--, 1);
                            }
                        }
                    }
                }

                return results;
            };

            Sizzle.matches = function(expr, set) {
                return Sizzle(expr, null, null, set);
            };

            Sizzle.matchesSelector = function(node, expr) {
                return Sizzle(expr, null, null, [node]).length > 0;
            };

            Sizzle.find = function(expr, context, isXML) {
                var set, i, len, match, type, left;

                if (!expr) {
                    return [];
                }

                for (i = 0, len = Expr.order.length; i < len; i++) {
                    type = Expr.order[i];

                    if ((match = Expr.leftMatch[type].exec(expr))) {
                        left = match[1];
                        match.splice(1, 1);

                        if (left.substr(left.length - 1) !== "\\") {
                            match[1] = (match[1] || "").replace(rBackslash, "");
                            set = Expr.find[type](match, context, isXML);

                            if (set != null) {
                                expr = expr.replace(Expr.match[type], "");
                                break;
                            }
                        }
                    }
                }

                if (!set) {
                    set = typeof context.getElementsByTagName !== "undefined" ?
                        context.getElementsByTagName("*") :
                        [];
                }

                return { set: set, expr: expr };
            };

            Sizzle.filter = function(expr, set, inplace, not) {
                var match, anyFound,
                    type, found, item, filter, left,
                    i, pass,
                    old = expr,
                    result = [],
                    curLoop = set,
                    isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

                while (expr && set.length) {
                    for (type in Expr.filter) {
                        if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
                            filter = Expr.filter[type];
                            left = match[1];

                            anyFound = false;

                            match.splice(1, 1);

                            if (left.substr(left.length - 1) === "\\") {
                                continue;
                            }

                            if (curLoop === result) {
                                result = [];
                            }

                            if (Expr.preFilter[type]) {
                                match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);

                                if (!match) {
                                    anyFound = found = true;

                                } else if (match === true) {
                                    continue;
                                }
                            }

                            if (match) {
                                for (i = 0; (item = curLoop[i]) != null; i++) {
                                    if (item) {
                                        found = filter(item, match, i, curLoop);
                                        pass = not ^ found;

                                        if (inplace && found != null) {
                                            if (pass) {
                                                anyFound = true;

                                            } else {
                                                curLoop[i] = false;
                                            }

                                        } else if (pass) {
                                            result.push(item);
                                            anyFound = true;
                                        }
                                    }
                                }
                            }

                            if (found !== undefined) {
                                if (!inplace) {
                                    curLoop = result;
                                }

                                expr = expr.replace(Expr.match[type], "");

                                if (!anyFound) {
                                    return [];
                                }

                                break;
                            }
                        }
                    }

                    // Improper expression
                    if (expr === old) {
                        if (anyFound == null) {
                            Sizzle.error(expr);

                        } else {
                            break;
                        }
                    }

                    old = expr;
                }

                return curLoop;
            };

            Sizzle.error = function(msg) {
                throw new Error("Syntax error, unrecognized expression: " + msg);
            };

            /**
            * Utility function for retreiving the text value of an array of DOM nodes
            * @param {Array|Element} elem
            */
            var getText = Sizzle.getText = function(elem) {
                var i, node,
                    nodeType = elem.nodeType,
                    ret = "";

                if (nodeType) {
                    if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                        // Use textContent || innerText for elements
                        if (typeof elem.textContent === 'string') {
                            return elem.textContent;
                        } else if (typeof elem.innerText === 'string') {
                            // Replace IE's carriage returns
                            return elem.innerText.replace(rReturn, '');
                        } else {
                            // Traverse it's children
                            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                                ret += getText(elem);
                            }
                        }
                    } else if (nodeType === 3 || nodeType === 4) {
                        return elem.nodeValue;
                    }
                } else {

                    // If no nodeType, this is expected to be an array
                    for (i = 0; (node = elem[i]); i++) {
                        // Do not traverse comment nodes
                        if (node.nodeType !== 8) {
                            ret += getText(node);
                        }
                    }
                }
                return ret;
            };

            var Expr = Sizzle.selectors = {
                order: ["ID", "NAME", "TAG"],

                match: {
                    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/ ,
                    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/ ,
                    NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/ ,
                    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/ ,
                    TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/ ,
                    CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/ ,
                    POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/ ,
                    PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
                },

                leftMatch: { },

                attrMap: {
                    "class": "className",
                    "for": "htmlFor"
                },

                attrHandle: {
                    href: function(elem) {
                        return elem.getAttribute("href");
                    },
                    type: function(elem) {
                        return elem.getAttribute("type");
                    }
                },

                relative: {
                    "+": function(checkSet, part) {
                        var isPartStr = typeof part === "string",
                            isTag = isPartStr && !rNonWord.test(part),
                            isPartStrNotTag = isPartStr && !isTag;

                        if (isTag) {
                            part = part.toLowerCase();
                        }

                        for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                            if ((elem = checkSet[i])) {
                                while ((elem = elem.previousSibling) && elem.nodeType !== 1) {
                                }

                                checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                                    elem || false :
                                    elem === part;
                            }
                        }

                        if (isPartStrNotTag) {
                            Sizzle.filter(part, checkSet, true);
                        }
                    },

                    ">": function(checkSet, part) {
                        var elem,
                            isPartStr = typeof part === "string",
                            i = 0,
                            l = checkSet.length;

                        if (isPartStr && !rNonWord.test(part)) {
                            part = part.toLowerCase();

                            for (; i < l; i++) {
                                elem = checkSet[i];

                                if (elem) {
                                    var parent = elem.parentNode;
                                    checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                                }
                            }

                        } else {
                            for (; i < l; i++) {
                                elem = checkSet[i];

                                if (elem) {
                                    checkSet[i] = isPartStr ?
                                        elem.parentNode :
                                        elem.parentNode === part;
                                }
                            }

                            if (isPartStr) {
                                Sizzle.filter(part, checkSet, true);
                            }
                        }
                    },

                    "": function(checkSet, part, isXML) {
                        var nodeCheck,
                            doneName = done++,
                            checkFn = dirCheck;

                        if (typeof part === "string" && !rNonWord.test(part)) {
                            part = part.toLowerCase();
                            nodeCheck = part;
                            checkFn = dirNodeCheck;
                        }

                        checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
                    },

                    "~": function(checkSet, part, isXML) {
                        var nodeCheck,
                            doneName = done++,
                            checkFn = dirCheck;

                        if (typeof part === "string" && !rNonWord.test(part)) {
                            part = part.toLowerCase();
                            nodeCheck = part;
                            checkFn = dirNodeCheck;
                        }

                        checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
                    }
                },

                find: {
                    ID: function(match, context, isXML) {
                        if (typeof context.getElementById !== "undefined" && !isXML) {
                            var m = context.getElementById(match[1]);
                            // Check parentNode to catch when Blackberry 4.6 returns
                            // nodes that are no longer in the document #6963
                            return m && m.parentNode ? [m] : [];
                        }
                    },

                    NAME: function(match, context) {
                        if (typeof context.getElementsByName !== "undefined") {
                            var ret = [],
                                results = context.getElementsByName(match[1]);

                            for (var i = 0, l = results.length; i < l; i++) {
                                if (results[i].getAttribute("name") === match[1]) {
                                    ret.push(results[i]);
                                }
                            }

                            return ret.length === 0 ? null : ret;
                        }
                    },

                    TAG: function(match, context) {
                        if (typeof context.getElementsByTagName !== "undefined") {
                            return context.getElementsByTagName(match[1]);
                        }
                    }
                },
                preFilter: {
                    CLASS: function(match, curLoop, inplace, result, not, isXML) {
                        match = " " + match[1].replace(rBackslash, "") + " ";

                        if (isXML) {
                            return match;
                        }

                        for (var i = 0, elem; (elem = curLoop[i]) != null; i++) {
                            if (elem) {
                                if (not ^ (elem.className && (" " + elem.className + " ").replace( /[\t\n\r]/g , " ").indexOf(match) >= 0)) {
                                    if (!inplace) {
                                        result.push(elem);
                                    }

                                } else if (inplace) {
                                    curLoop[i] = false;
                                }
                            }
                        }

                        return false;
                    },

                    ID: function(match) {
                        return match[1].replace(rBackslash, "");
                    },

                    TAG: function(match, curLoop) {
                        return match[1].replace(rBackslash, "").toLowerCase();
                    },

                    CHILD: function(match) {
                        if (match[1] === "nth") {
                            if (!match[2]) {
                                Sizzle.error(match[0]);
                            }

                            match[2] = match[2].replace( /^\+|\s*/g , '');

                            // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                            var test = /(-?)(\d*)(?:n([+\-]?\d*))?/ .exec(
                                match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
                                    ! /\D/ .test(match[2]) && "0n+" + match[2] || match[2]);

                            // calculate the numbers (first)n+(last) including if they are negative
                            match[2] = (test[1] + (test[2] || 1)) - 0;
                            match[3] = test[3] - 0;
                        } else if (match[2]) {
                            Sizzle.error(match[0]);
                        }

                        // TODO: Move to normal caching system
                        match[0] = done++;

                        return match;
                    },

                    ATTR: function(match, curLoop, inplace, result, not, isXML) {
                        var name = match[1] = match[1].replace(rBackslash, "");

                        if (!isXML && Expr.attrMap[name]) {
                            match[1] = Expr.attrMap[name];
                        }

                        // Handle if an un-quoted value was used
                        match[4] = (match[4] || match[5] || "").replace(rBackslash, "");

                        if (match[2] === "~=") {
                            match[4] = " " + match[4] + " ";
                        }

                        return match;
                    },

                    PSEUDO: function(match, curLoop, inplace, result, not) {
                        if (match[1] === "not") {
                            // If we're dealing with a complex expression, or a simple one
                            if ((chunker.exec(match[3]) || "").length > 1 || /^\w/ .test(match[3])) {
                                match[3] = Sizzle(match[3], null, null, curLoop);

                            } else {
                                var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                                if (!inplace) {
                                    result.push.apply(result, ret);
                                }

                                return false;
                            }

                        } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                            return true;
                        }

                        return match;
                    },

                    POS: function(match) {
                        match.unshift(true);

                        return match;
                    }
                },

                filters: {
                    enabled: function(elem) {
                        return elem.disabled === false && elem.type !== "hidden";
                    },

                    disabled: function(elem) {
                        return elem.disabled === true;
                    },

                    checked: function(elem) {
                        return elem.checked === true;
                    },

                    selected: function(elem) {
                        // Accessing this property makes selected-by-default
                        // options in Safari work properly
                        if (elem.parentNode) {
                            elem.parentNode.selectedIndex;
                        }

                        return elem.selected === true;
                    },

                    parent: function(elem) {
                        return !!elem.firstChild;
                    },

                    empty: function(elem) {
                        return !elem.firstChild;
                    },

                    has: function(elem, i, match) {
                        return !!Sizzle(match[3], elem).length;
                    },

                    header: function(elem) {
                        return ( /h\d/i ).test(elem.nodeName);
                    },

                    text: function(elem) {
                        var attr = elem.getAttribute("type"), type = elem.type;
                        // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                        // use getAttribute instead to test this case
                        return elem.nodeName.toLowerCase() === "input" && "text" === type && (attr === type || attr === null);
                    },

                    radio: function(elem) {
                        return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
                    },

                    checkbox: function(elem) {
                        return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
                    },

                    file: function(elem) {
                        return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
                    },

                    password: function(elem) {
                        return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
                    },

                    submit: function(elem) {
                        var name = elem.nodeName.toLowerCase();
                        return (name === "input" || name === "button") && "submit" === elem.type;
                    },

                    image: function(elem) {
                        return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
                    },

                    reset: function(elem) {
                        var name = elem.nodeName.toLowerCase();
                        return (name === "input" || name === "button") && "reset" === elem.type;
                    },

                    button: function(elem) {
                        var name = elem.nodeName.toLowerCase();
                        return name === "input" && "button" === elem.type || name === "button";
                    },

                    input: function(elem) {
                        return ( /input|select|textarea|button/i ).test(elem.nodeName);
                    },

                    focus: function(elem) {
                        return elem === elem.ownerDocument.activeElement;
                    }
                },
                setFilters: {
                    first: function(elem, i) {
                        return i === 0;
                    },

                    last: function(elem, i, match, array) {
                        return i === array.length - 1;
                    },

                    even: function(elem, i) {
                        return i % 2 === 0;
                    },

                    odd: function(elem, i) {
                        return i % 2 === 1;
                    },

                    lt: function(elem, i, match) {
                        return i < match[3] - 0;
                    },

                    gt: function(elem, i, match) {
                        return i > match[3] - 0;
                    },

                    nth: function(elem, i, match) {
                        return match[3] - 0 === i;
                    },

                    eq: function(elem, i, match) {
                        return match[3] - 0 === i;
                    }
                },
                filter: {
                    PSEUDO: function(elem, match, i, array) {
                        var name = match[1],
                            filter = Expr.filters[name];

                        if (filter) {
                            return filter(elem, i, match, array);

                        } else if (name === "contains") {
                            return (elem.textContent || elem.innerText || getText([elem]) || "").indexOf(match[3]) >= 0;

                        } else if (name === "not") {
                            var not = match[3];

                            for (var j = 0, l = not.length; j < l; j++) {
                                if (not[j] === elem) {
                                    return false;
                                }
                            }

                            return true;

                        } else {
                            Sizzle.error(name);
                        }
                    },

                    CHILD: function(elem, match) {
                        var first, last,
                            doneName, parent, cache,
                            count, diff,
                            type = match[1],
                            node = elem;

                        switch (type) {
                        case "only":
                        case "first":
                            while ((node = node.previousSibling)) {
                                if (node.nodeType === 1) {
                                    return false;
                                }
                            }

                            if (type === "first") {
                                return true;
                            }

                            node = elem;
                        /* falls through */
                        case "last":
                            while ((node = node.nextSibling)) {
                                if (node.nodeType === 1) {
                                    return false;
                                }
                            }

                            return true;
                        case "nth":
                            first = match[2];
                            last = match[3];

                            if (first === 1 && last === 0) {
                                return true;
                            }

                            doneName = match[0];
                            parent = elem.parentNode;

                            if (parent && (parent[expando] !== doneName || !elem.nodeIndex)) {
                                count = 0;

                                for (node = parent.firstChild; node; node = node.nextSibling) {
                                    if (node.nodeType === 1) {
                                        node.nodeIndex = ++count;
                                    }
                                }

                                parent[expando] = doneName;
                            }

                            diff = elem.nodeIndex - last;

                            if (first === 0) {
                                return diff === 0;

                            } else {
                                return (diff % first === 0 && diff / first >= 0);
                            }
                        }
                    },

                    ID: function(elem, match) {
                        return elem.nodeType === 1 && elem.getAttribute("id") === match;
                    },

                    TAG: function(elem, match) {
                        return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
                    },

                    CLASS: function(elem, match) {
                        return (" " + (elem.className || elem.getAttribute("class")) + " ")
                            .indexOf(match) > -1;
                    },

                    ATTR: function(elem, match) {
                        var name = match[1],
                            result = Sizzle.attr ?
                                Sizzle.attr(elem, name) :
                                Expr.attrHandle[name] ?
                                    Expr.attrHandle[name](elem) :
                                    elem[name] != null ?
                                        elem[name] :
                                        elem.getAttribute(name),
                            value = result + "",
                            type = match[2],
                            check = match[4];

                        return result == null ?
                            type === "!=" :
                            !type && Sizzle.attr ?
                                result != null :
                                type === "=" ?
                                    value === check :
                                    type === "*=" ?
                                        value.indexOf(check) >= 0 :
                                        type === "~=" ?
                                            (" " + value + " ").indexOf(check) >= 0 :
                                            !check ?
                                                value && result !== false :
                                                type === "!=" ?
                                                    value !== check :
                                                    type === "^=" ?
                                                        value.indexOf(check) === 0 :
                                                        type === "$=" ?
                                                            value.substr(value.length - check.length) === check :
                                                            type === "|=" ?
                                                                value === check || value.substr(0, check.length + 1) === check + "-" :
                                                                false;
                    },

                    POS: function(elem, match, i, array) {
                        var name = match[2],
                            filter = Expr.setFilters[name];

                        if (filter) {
                            return filter(elem, i, match, array);
                        }
                    }
                }
            };

            var origPOS = Expr.match.POS,
                fescape = function(all, num) {
                    return "\\" + (num - 0 + 1);
                };

            for (var type in Expr.match) {
                Expr.match[type] = new RegExp(Expr.match[type].source + ( /(?![^\[]*\])(?![^\(]*\))/ .source));
                Expr.leftMatch[type] = new RegExp( /(^(?:.|\r|\n)*?)/ .source + Expr.match[type].source.replace( /\\(\d+)/g , fescape));
            }
            // Expose origPOS
            // "global" as in regardless of relation to brackets/parens
            Expr.match.globalPOS = origPOS;

            var makeArray = function(array, results) {
                array = Array.prototype.slice.call(array, 0);

                if (results) {
                    results.push.apply(results, array);
                    return results;
                }

                return array;
            };

            // Perform a simple check to determine if the browser is capable of
            // converting a NodeList to an array using builtin methods.
            // Also verifies that the returned array holds DOM nodes
            // (which is not the case in the Blackberry browser)
            try {
                Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;

                // Provide a fallback method if it does not work
            } catch(e) {
                makeArray = function(array, results) {
                    var i = 0,
                        ret = results || [];

                    if (toString.call(array) === "[object Array]") {
                        Array.prototype.push.apply(ret, array);

                    } else {
                        if (typeof array.length === "number") {
                            for (var l = array.length; i < l; i++) {
                                ret.push(array[i]);
                            }

                        } else {
                            for (; array[i]; i++) {
                                ret.push(array[i]);
                            }
                        }
                    }

                    return ret;
                };
            }

            var sortOrder, siblingCheck;

            if (document.documentElement.compareDocumentPosition) {
                sortOrder = function(a, b) {
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                        return a.compareDocumentPosition ? -1 : 1;
                    }

                    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
                };

            } else {
                sortOrder = function(a, b) {
                    // The nodes are identical, we can exit early
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;

                        // Fallback to using sourceIndex (in IE) if it's available on both nodes
                    } else if (a.sourceIndex && b.sourceIndex) {
                        return a.sourceIndex - b.sourceIndex;
                    }

                    var al, bl,
                        ap = [],
                        bp = [],
                        aup = a.parentNode,
                        bup = b.parentNode,
                        cur = aup;

                    // If the nodes are siblings (or identical) we can do a quick check
                    if (aup === bup) {
                        return siblingCheck(a, b);

                        // If no parents were found then the nodes are disconnected
                    } else if (!aup) {
                        return -1;

                    } else if (!bup) {
                        return 1;
                    }

                    // Otherwise they're somewhere else in the tree so we need
                    // to build up a full list of the parentNodes for comparison
                    while (cur) {
                        ap.unshift(cur);
                        cur = cur.parentNode;
                    }

                    cur = bup;

                    while (cur) {
                        bp.unshift(cur);
                        cur = cur.parentNode;
                    }

                    al = ap.length;
                    bl = bp.length;

                    // Start walking down the tree looking for a discrepancy
                    for (var i = 0; i < al && i < bl; i++) {
                        if (ap[i] !== bp[i]) {
                            return siblingCheck(ap[i], bp[i]);
                        }
                    }

                    // We ended someplace up the tree so do a sibling check
                    return i === al ?
                        siblingCheck(a, bp[i], -1) :
                        siblingCheck(ap[i], b, 1);
                };

                siblingCheck = function(a, b, ret) {
                    if (a === b) {
                        return ret;
                    }

                    var cur = a.nextSibling;

                    while (cur) {
                        if (cur === b) {
                            return -1;
                        }

                        cur = cur.nextSibling;
                    }

                    return 1;
                };
            }

            // Check to see if the browser returns elements by name when
            // querying by getElementById (and provide a workaround)
            (function() {
                // We're going to inject a fake input element with a specified name
                var form = document.createElement("div"),
                    id = "script" + (new Date()).getTime(),
                    root = document.documentElement;

                form.innerHTML = "<a name='" + id + "'/>";

                // Inject it into the root element, check its status, and remove it quickly
                root.insertBefore(form, root.firstChild);

                // The workaround has to do additional checks after a getElementById
                // Which slows things down for other browsers (hence the branching)
                if (document.getElementById(id)) {
                    Expr.find.ID = function(match, context, isXML) {
                        if (typeof context.getElementById !== "undefined" && !isXML) {
                            var m = context.getElementById(match[1]);

                            return m ?
                                m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
                                    [m] :
                                    undefined :
                                [];
                        }
                    };

                    Expr.filter.ID = function(elem, match) {
                        var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                        return elem.nodeType === 1 && node && node.nodeValue === match;
                    };
                }

                root.removeChild(form);

                // release memory in IE
                root = form = null;
            })();

            (function() {
                // Check to see if the browser returns only elements
                // when doing getElementsByTagName("*")

                // Create a fake element
                var div = document.createElement("div");
                div.appendChild(document.createComment(""));

                // Make sure no comments are found
                if (div.getElementsByTagName("*").length > 0) {
                    Expr.find.TAG = function(match, context) {
                        var results = context.getElementsByTagName(match[1]);

                        // Filter out possible comments
                        if (match[1] === "*") {
                            var tmp = [];

                            for (var i = 0; results[i]; i++) {
                                if (results[i].nodeType === 1) {
                                    tmp.push(results[i]);
                                }
                            }

                            results = tmp;
                        }

                        return results;
                    };
                }

                // Check to see if an attribute returns normalized href attributes
                div.innerHTML = "<a href='#'></a>";

                if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
                    div.firstChild.getAttribute("href") !== "#") {

                    Expr.attrHandle.href = function(elem) {
                        return elem.getAttribute("href", 2);
                    };
                }

                // release memory in IE
                div = null;
            })();

            if (document.querySelectorAll) {
                (function() {
                    var oldSizzle = Sizzle,
                        div = document.createElement("div"),
                        id = "__sizzle__";

                    div.innerHTML = "<p class='TEST'></p>";

                    // Safari can't handle uppercase or unicode characters when
                    // in quirks mode.
                    if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                        return;
                    }

                    Sizzle = function(query, context, extra, seed) {
                        context = context || document;

                        // Only use querySelectorAll on non-XML documents
                        // (ID selectors don't work in non-HTML documents)
                        if (!seed && !Sizzle.isXML(context)) {
                            // See if we find a selector to speed up
                            var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/ .exec(query);

                            if (match && (context.nodeType === 1 || context.nodeType === 9)) {
                                // Speed-up: Sizzle("TAG")
                                if (match[1]) {
                                    return makeArray(context.getElementsByTagName(query), extra);

                                    // Speed-up: Sizzle(".CLASS")
                                } else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
                                    return makeArray(context.getElementsByClassName(match[2]), extra);
                                }
                            }

                            if (context.nodeType === 9) {
                                // Speed-up: Sizzle("body")
                                // The body element only exists once, optimize finding it
                                if (query === "body" && context.body) {
                                    return makeArray([context.body], extra);

                                    // Speed-up: Sizzle("#ID")
                                } else if (match && match[3]) {
                                    var elem = context.getElementById(match[3]);

                                    // Check parentNode to catch when Blackberry 4.6 returns
                                    // nodes that are no longer in the document #6963
                                    if (elem && elem.parentNode) {
                                        // Handle the case where IE and Opera return items
                                        // by name instead of ID
                                        if (elem.id === match[3]) {
                                            return makeArray([elem], extra);
                                        }

                                    } else {
                                        return makeArray([], extra);
                                    }
                                }

                                try {
                                    return makeArray(context.querySelectorAll(query), extra);
                                } catch(qsaError) {
                                }

                                // qSA works strangely on Element-rooted queries
                                // We can work around this by specifying an extra ID on the root
                                // and working up from there (Thanks to Andrew Dupont for the technique)
                                // IE 8 doesn't work on object elements
                            } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                                var oldContext = context,
                                    old = context.getAttribute("id"),
                                    nid = old || id,
                                    hasParent = context.parentNode,
                                    relativeHierarchySelector = /^\s*[+~]/ .test(query);

                                if (!old) {
                                    context.setAttribute("id", nid);
                                } else {
                                    nid = nid.replace( /'/g , "\\$&");
                                }
                                if (relativeHierarchySelector && hasParent) {
                                    context = context.parentNode;
                                }

                                try {
                                    if (!relativeHierarchySelector || hasParent) {
                                        return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
                                    }

                                } catch(pseudoError) {
                                } finally {
                                    if (!old) {
                                        oldContext.removeAttribute("id");
                                    }
                                }
                            }
                        }

                        return oldSizzle(query, context, extra, seed);
                    };

                    for (var prop in oldSizzle) {
                        Sizzle[prop] = oldSizzle[prop];
                    }

                    // release memory in IE
                    div = null;
                })();
            }

            (function() {
                var html = document.documentElement,
                    matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

                if (matches) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9 fails this)
                    var disconnectedMatch = !matches.call(document.createElement("div"), "div"),
                        pseudoWorks = false;

                    try {
                        // This should fail with an exception
                        // Gecko does not error, returns false instead
                        matches.call(document.documentElement, "[test!='']:sizzle");

                    } catch(pseudoError) {
                        pseudoWorks = true;
                    }

                    Sizzle.matchesSelector = function(node, expr) {
                        // Make sure that attribute selectors are quoted
                        expr = expr.replace( /\=\s*([^'"\]]*)\s*\]/g , "='$1']");

                        if (!Sizzle.isXML(node)) {
                            try {
                                if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && ! /!=/ .test(expr)) {
                                    var ret = matches.call(node, expr);

                                    // IE 9's matchesSelector returns false on disconnected nodes
                                    if (ret || !disconnectedMatch ||
                                        // As well, disconnected nodes are said to be in a document
                                        // fragment in IE 9, so check for that
                                        node.document && node.document.nodeType !== 11) {
                                        return ret;
                                    }
                                }
                            } catch(e) {
                            }
                        }

                        return Sizzle(expr, null, null, [node]).length > 0;
                    };
                }
            })();

            (function() {
                var div = document.createElement("div");

                div.innerHTML = "<div class='test e'></div><div class='test'></div>";

                // Opera can't find a second classname (in 9.6)
                // Also, make sure that getElementsByClassName actually exists
                if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
                    return;
                }

                // Safari caches class attributes, doesn't catch changes (in 3.2)
                div.lastChild.className = "e";

                if (div.getElementsByClassName("e").length === 1) {
                    return;
                }

                Expr.order.splice(1, 0, "CLASS");
                Expr.find.CLASS = function(match, context, isXML) {
                    if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                        return context.getElementsByClassName(match[1]);
                    }
                };

                // release memory in IE
                div = null;
            })();

            function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
                for (var i = 0, l = checkSet.length; i < l; i++) {
                    var elem = checkSet[i];

                    if (elem) {
                        var match = false;

                        elem = elem[dir];

                        while (elem) {
                            if (elem[expando] === doneName) {
                                match = checkSet[elem.sizset];
                                break;
                            }

                            if (elem.nodeType === 1 && !isXML) {
                                elem[expando] = doneName;
                                elem.sizset = i;
                            }

                            if (elem.nodeName.toLowerCase() === cur) {
                                match = elem;
                                break;
                            }

                            elem = elem[dir];
                        }

                        checkSet[i] = match;
                    }
                }
            }

            function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
                for (var i = 0, l = checkSet.length; i < l; i++) {
                    var elem = checkSet[i];

                    if (elem) {
                        var match = false;

                        elem = elem[dir];

                        while (elem) {
                            if (elem[expando] === doneName) {
                                match = checkSet[elem.sizset];
                                break;
                            }

                            if (elem.nodeType === 1) {
                                if (!isXML) {
                                    elem[expando] = doneName;
                                    elem.sizset = i;
                                }

                                if (typeof cur !== "string") {
                                    if (elem === cur) {
                                        match = true;
                                        break;
                                    }

                                } else if (Sizzle.filter(cur, [elem]).length > 0) {
                                    match = elem;
                                    break;
                                }
                            }

                            elem = elem[dir];
                        }

                        checkSet[i] = match;
                    }
                }
            }

            if (document.documentElement.contains) {
                Sizzle.contains = function(a, b) {
                    return a !== b && (a.contains ? a.contains(b) : true);
                };

            } else if (document.documentElement.compareDocumentPosition) {
                Sizzle.contains = function(a, b) {
                    return !!(a.compareDocumentPosition(b) & 16);
                };

            } else {
                Sizzle.contains = function() {
                    return false;
                };
            }

            Sizzle.isXML = function(elem) {
                // documentElement is verified for cases where it doesn't yet exist
                // (such as loading iframes in IE - #4833)
                var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

                return documentElement ? documentElement.nodeName !== "HTML" : false;
            };

            var posProcess = function(selector, context, seed) {
                var match,
                    tmpSet = [],
                    later = "",
                    root = context.nodeType ? [context] : context;

                // Position selectors must be done after the filter
                // And so must :not(positional) so we move all PSEUDOs to the end
                while ((match = Expr.match.PSEUDO.exec(selector))) {
                    later += match[0];
                    selector = selector.replace(Expr.match.PSEUDO, "");
                }

                selector = Expr.relative[selector] ? selector + "*" : selector;

                for (var i = 0, l = root.length; i < l; i++) {
                    Sizzle(selector, root[i], tmpSet, seed);
                }

                return Sizzle.filter(later, tmpSet);
            };

            // EXPOSE
            // Override sizzle attribute retrieval
            Sizzle.attr = jQuery.attr;
            Sizzle.selectors.attrMap = { };
            jQuery.find = Sizzle;
            jQuery.expr = Sizzle.selectors;
            jQuery.expr[":"] = jQuery.expr.filters;
            jQuery.unique = Sizzle.uniqueSort;
            jQuery.text = Sizzle.getText;
            jQuery.isXMLDoc = Sizzle.isXML;
            jQuery.contains = Sizzle.contains;


        })();


        var runtil = /Until$/ ,
            rparentsprev = /^(?:parents|prevUntil|prevAll)/ ,
            // Note: This RegExp should be improved, or likely pulled from Sizzle
            rmultiselector = /,/ ,
            isSimple = /^.[^:#\[\.,]*$/ ,
            slice = Array.prototype.slice,
            POS = jQuery.expr.match.globalPOS,
            // methods guaranteed to produce a unique set when starting from a unique set
            guaranteedUnique = {
                children: true,
                contents: true,
                next: true,
                prev: true
            };

        jQuery.fn.extend({
            find: function(selector) {
                var self = this,
                    i, l;

                if (typeof selector !== "string") {
                    return jQuery(selector).filter(function() {
                        for (i = 0, l = self.length; i < l; i++) {
                            if (jQuery.contains(self[i], this)) {
                                return true;
                            }
                        }
                    });
                }

                var ret = this.pushStack("", "find", selector),
                    length, n, r;

                for (i = 0, l = this.length; i < l; i++) {
                    length = ret.length;
                    jQuery.find(selector, this[i], ret);

                    if (i > 0) {
                        // Make sure that the results are unique
                        for (n = length; n < ret.length; n++) {
                            for (r = 0; r < length; r++) {
                                if (ret[r] === ret[n]) {
                                    ret.splice(n--, 1);
                                    break;
                                }
                            }
                        }
                    }
                }

                return ret;
            },

            has: function(target) {
                var targets = jQuery(target);
                return this.filter(function() {
                    for (var i = 0, l = targets.length; i < l; i++) {
                        if (jQuery.contains(this, targets[i])) {
                            return true;
                        }
                    }
                });
            },

            not: function(selector) {
                return this.pushStack(winnow(this, selector, false), "not", selector);
            },

            filter: function(selector) {
                return this.pushStack(winnow(this, selector, true), "filter", selector);
            },

            is: function(selector) {
                return !!selector && (
                    typeof selector === "string" ?
                // If this is a positional selector, check membership in the returned set
                // so $("p:first").is("p:last") won't return true for a doc with two "p".
                        POS.test(selector) ?
                            jQuery(selector, this.context).index(this[0]) >= 0 :
                            jQuery.filter(selector, this).length > 0 :
                        this.filter(selector).length > 0);
            },

            closest: function(selectors, context) {
                var ret = [], i, l, cur = this[0];

                // Array (deprecated as of jQuery 1.7)
                if (jQuery.isArray(selectors)) {
                    var level = 1;

                    while (cur && cur.ownerDocument && cur !== context) {
                        for (i = 0; i < selectors.length; i++) {

                            if (jQuery(cur).is(selectors[i])) {
                                ret.push({ selector: selectors[i], elem: cur, level: level });
                            }
                        }

                        cur = cur.parentNode;
                        level++;
                    }

                    return ret;
                }

                // String
                var pos = POS.test(selectors) || typeof selectors !== "string" ?
                    jQuery(selectors, context || this.context) :
                    0;

                for (i = 0, l = this.length; i < l; i++) {
                    cur = this[i];

                    while (cur) {
                        if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
                            ret.push(cur);
                            break;

                        } else {
                            cur = cur.parentNode;
                            if (!cur || !cur.ownerDocument || cur === context || cur.nodeType === 11) {
                                break;
                            }
                        }
                    }
                }

                ret = ret.length > 1 ? jQuery.unique(ret) : ret;

                return this.pushStack(ret, "closest", selectors);
            },

            // Determine the position of an element within
            // the matched set of elements
            index: function(elem) {

                // No argument, return index in parent
                if (!elem) {
                    return (this[0] && this[0].parentNode) ? this.prevAll().length : -1;
                }

                // index in selector
                if (typeof elem === "string") {
                    return jQuery.inArray(this[0], jQuery(elem));
                }

                // Locate the position of the desired element
                return jQuery.inArray(
                // If it receives a jQuery object, the first element is used
                    elem.jquery ? elem[0] : elem, this);
            },

            add: function(selector, context) {
                var set = typeof selector === "string" ?
                    jQuery(selector, context) :
                    jQuery.makeArray(selector && selector.nodeType ? [selector] : selector),
                    all = jQuery.merge(this.get(), set);

                return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ?
                        all :
                        jQuery.unique(all));
            },

            andSelf: function() {
                return this.add(this.prevObject);
            }
        });

        // A painfully simple check to see if an element is disconnected
        // from a document (should be improved, where feasible).

        function isDisconnected(node) {
            return !node || !node.parentNode || node.parentNode.nodeType === 11;
        }

        jQuery.each({
                parent: function(elem) {
                    var parent = elem.parentNode;
                    return parent && parent.nodeType !== 11 ? parent : null;
                },
                parents: function(elem) {
                    return jQuery.dir(elem, "parentNode");
                },
                parentsUntil: function(elem, i, until) {
                    return jQuery.dir(elem, "parentNode", until);
                },
                next: function(elem) {
                    return jQuery.nth(elem, 2, "nextSibling");
                },
                prev: function(elem) {
                    return jQuery.nth(elem, 2, "previousSibling");
                },
                nextAll: function(elem) {
                    return jQuery.dir(elem, "nextSibling");
                },
                prevAll: function(elem) {
                    return jQuery.dir(elem, "previousSibling");
                },
                nextUntil: function(elem, i, until) {
                    return jQuery.dir(elem, "nextSibling", until);
                },
                prevUntil: function(elem, i, until) {
                    return jQuery.dir(elem, "previousSibling", until);
                },
                siblings: function(elem) {
                    return jQuery.sibling((elem.parentNode || { }).firstChild, elem);
                },
                children: function(elem) {
                    return jQuery.sibling(elem.firstChild);
                },
                contents: function(elem) {
                    return jQuery.nodeName(elem, "iframe") ?
                        elem.contentDocument || elem.contentWindow.document :
                        jQuery.makeArray(elem.childNodes);
                }
            }, function(name, fn) {
                jQuery.fn[name] = function(until, selector) {
                    var ret = jQuery.map(this, fn, until);

                    if (!runtil.test(name)) {
                        selector = until;
                    }

                    if (selector && typeof selector === "string") {
                        ret = jQuery.filter(selector, ret);
                    }

                    ret = this.length > 1 && !guaranteedUnique[name] ? jQuery.unique(ret) : ret;

                    if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) {
                        ret = ret.reverse();
                    }

                    return this.pushStack(ret, name, slice.call(arguments).join(","));
                };
            });

        jQuery.extend({
            filter: function(expr, elems, not) {
                if (not) {
                    expr = ":not(" + expr + ")";
                }

                return elems.length === 1 ?
                    jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] :
                    jQuery.find.matches(expr, elems);
            },

            dir: function(elem, dir, until) {
                var matched = [],
                    cur = elem[dir];

                while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
                    if (cur.nodeType === 1) {
                        matched.push(cur);
                    }
                    cur = cur[dir];
                }
                return matched;
            },

            nth: function(cur, result, dir, elem) {
                result = result || 1;
                var num = 0;

                for (; cur; cur = cur[dir]) {
                    if (cur.nodeType === 1 && ++num === result) {
                        break;
                    }
                }

                return cur;
            },

            sibling: function(n, elem) {
                var r = [];

                for (; n; n = n.nextSibling) {
                    if (n.nodeType === 1 && n !== elem) {
                        r.push(n);
                    }
                }

                return r;
            }
        });

        // Implement the identical functionality for filter and not

        function winnow(elements, qualifier, keep) {

            // Can't pass null or undefined to indexOf in Firefox 4
            // Set to 0 to skip string check
            qualifier = qualifier || 0;

            if (jQuery.isFunction(qualifier)) {
                return jQuery.grep(elements, function(elem, i) {
                    var retVal = !!qualifier.call(elem, i, elem);
                    return retVal === keep;
                });

            } else if (qualifier.nodeType) {
                return jQuery.grep(elements, function(elem, i) {
                    return (elem === qualifier) === keep;
                });

            } else if (typeof qualifier === "string") {
                var filtered = jQuery.grep(elements, function(elem) {
                    return elem.nodeType === 1;
                });

                if (isSimple.test(qualifier)) {
                    return jQuery.filter(qualifier, filtered, !keep);
                } else {
                    qualifier = jQuery.filter(qualifier, filtered);
                }
            }

            return jQuery.grep(elements, function(elem, i) {
                return (jQuery.inArray(elem, qualifier) >= 0) === keep;
            });
        }


        function createSafeFragment(document) {
            var list = nodeNames.split("|"),
                safeFrag = document.createDocumentFragment();

            if (safeFrag.createElement) {
                while (list.length) {
                    safeFrag.createElement(
                        list.pop()
                    );
                }
            }
            return safeFrag;
        }

        var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
            "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
            rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g ,
            rleadingWhitespace = /^\s+/ ,
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig ,
            rtagName = /<([\w:]+)/ ,
            rtbody = /<tbody/i ,
            rhtml = /<|&#?\w+;/ ,
            rnoInnerhtml = /<(?:script|style)/i ,
            rnocache = /<(?:script|object|embed|option|style)/i ,
            rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
            // checked="checked" or checked
            rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i ,
            rscriptType = /\/(java|ecma)script/i ,
            rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/ ,
            wrapMap = {
                option: [1, "<select multiple='multiple'>", "</select>"],
                legend: [1, "<fieldset>", "</fieldset>"],
                thead: [1, "<table>", "</table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                area: [1, "<map>", "</map>"],
                _default: [0, "", ""]
            },
            safeFragment = createSafeFragment(document);

        wrapMap.optgroup = wrapMap.option;
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;

        // IE can't serialize <link> and <script> tags normally
        if (!jQuery.support.htmlSerialize) {
            wrapMap._default = [1, "div<div>", "</div>"];
        }

        jQuery.fn.extend({
            text: function(value) {
                return jQuery.access(this, function(value) {
                    return value === undefined ?
                        jQuery.text(this) :
                        this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
                }, null, value, arguments.length);
            },

            wrapAll: function(html) {
                if (jQuery.isFunction(html)) {
                    return this.each(function(i) {
                        jQuery(this).wrapAll(html.call(this, i));
                    });
                }

                if (this[0]) {
                    // The elements to wrap the target around
                    var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

                    if (this[0].parentNode) {
                        wrap.insertBefore(this[0]);
                    }

                    wrap.map(function() {
                        var elem = this;

                        while (elem.firstChild && elem.firstChild.nodeType === 1) {
                            elem = elem.firstChild;
                        }

                        return elem;
                    }).append(this);
                }

                return this;
            },

            wrapInner: function(html) {
                if (jQuery.isFunction(html)) {
                    return this.each(function(i) {
                        jQuery(this).wrapInner(html.call(this, i));
                    });
                }

                return this.each(function() {
                    var self = jQuery(this),
                        contents = self.contents();

                    if (contents.length) {
                        contents.wrapAll(html);

                    } else {
                        self.append(html);
                    }
                });
            },

            wrap: function(html) {
                var isFunction = jQuery.isFunction(html);

                return this.each(function(i) {
                    jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
                });
            },

            unwrap: function() {
                return this.parent().each(function() {
                    if (!jQuery.nodeName(this, "body")) {
                        jQuery(this).replaceWith(this.childNodes);
                    }
                }).end();
            },

            append: function() {
                return this.domManip(arguments, true, function(elem) {
                    if (this.nodeType === 1) {
                        this.appendChild(elem);
                    }
                });
            },

            prepend: function() {
                return this.domManip(arguments, true, function(elem) {
                    if (this.nodeType === 1) {
                        this.insertBefore(elem, this.firstChild);
                    }
                });
            },

            before: function() {
                if (this[0] && this[0].parentNode) {
                    return this.domManip(arguments, false, function(elem) {
                        this.parentNode.insertBefore(elem, this);
                    });
                } else if (arguments.length) {
                    var set = jQuery.clean(arguments);
                    set.push.apply(set, this.toArray());
                    return this.pushStack(set, "before", arguments);
                }
            },

            after: function() {
                if (this[0] && this[0].parentNode) {
                    return this.domManip(arguments, false, function(elem) {
                        this.parentNode.insertBefore(elem, this.nextSibling);
                    });
                } else if (arguments.length) {
                    var set = this.pushStack(this, "after", arguments);
                    set.push.apply(set, jQuery.clean(arguments));
                    return set;
                }
            },

            // keepData is for internal use only--do not document
            remove: function(selector, keepData) {
                for (var i = 0, elem; (elem = this[i]) != null; i++) {
                    if (!selector || jQuery.filter(selector, [elem]).length) {
                        if (!keepData && elem.nodeType === 1) {
                            jQuery.cleanData(elem.getElementsByTagName("*"));
                            jQuery.cleanData([elem]);
                        }

                        if (elem.parentNode) {
                            elem.parentNode.removeChild(elem);
                        }
                    }
                }

                return this;
            },

            empty: function() {
                for (var i = 0, elem; (elem = this[i]) != null; i++) {
                    // Remove element nodes and prevent memory leaks
                    if (elem.nodeType === 1) {
                        jQuery.cleanData(elem.getElementsByTagName("*"));
                    }

                    // Remove any remaining nodes
                    while (elem.firstChild) {
                        elem.removeChild(elem.firstChild);
                    }
                }

                return this;
            },

            clone: function(dataAndEvents, deepDataAndEvents) {
                dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
                deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

                return this.map(function() {
                    return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
                });
            },

            html: function(value) {
                return jQuery.access(this, function(value) {
                    var elem = this[0] || { },
                        i = 0,
                        l = this.length;

                    if (value === undefined) {
                        return elem.nodeType === 1 ?
                            elem.innerHTML.replace(rinlinejQuery, "") :
                            null;
                    }


                    if (typeof value === "string" && !rnoInnerhtml.test(value) &&
                        (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) &&
                            !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

                        value = value.replace(rxhtmlTag, "<$1></$2>");

                        try {
                            for (; i < l; i++) {
                                // Remove element nodes and prevent memory leaks
                                elem = this[i] || { };
                                if (elem.nodeType === 1) {
                                    jQuery.cleanData(elem.getElementsByTagName("*"));
                                    elem.innerHTML = value;
                                }
                            }

                            elem = 0;

                            // If using innerHTML throws an exception, use the fallback method
                        } catch(e) {
                        }
                    }

                    if (elem) {
                        this.empty().append(value);
                    }
                }, null, value, arguments.length);
            },

            replaceWith: function(value) {
                if (this[0] && this[0].parentNode) {
                    // Make sure that the elements are removed from the DOM before they are inserted
                    // this can help fix replacing a parent with child elements
                    if (jQuery.isFunction(value)) {
                        return this.each(function(i) {
                            var self = jQuery(this), old = self.html();
                            self.replaceWith(value.call(this, i, old));
                        });
                    }

                    if (typeof value !== "string") {
                        value = jQuery(value).detach();
                    }

                    return this.each(function() {
                        var next = this.nextSibling,
                            parent = this.parentNode;

                        jQuery(this).remove();

                        if (next) {
                            jQuery(next).before(value);
                        } else {
                            jQuery(parent).append(value);
                        }
                    });
                } else {
                    return this.length ?
                        this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) :
                        this;
                }
            },

            detach: function(selector) {
                return this.remove(selector, true);
            },

            domManip: function(args, table, callback) {
                var results, first, fragment, parent,
                    value = args[0],
                    scripts = [];

                // We can't cloneNode fragments that contain checked, in WebKit
                if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test(value)) {
                    return this.each(function() {
                        jQuery(this).domManip(args, table, callback, true);
                    });
                }

                if (jQuery.isFunction(value)) {
                    return this.each(function(i) {
                        var self = jQuery(this);
                        args[0] = value.call(this, i, table ? self.html() : undefined);
                        self.domManip(args, table, callback);
                    });
                }

                if (this[0]) {
                    parent = value && value.parentNode;

                    // If we're in a fragment, just use that instead of building a new one
                    if (jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length) {
                        results = { fragment: parent };

                    } else {
                        results = jQuery.buildFragment(args, this, scripts);
                    }

                    fragment = results.fragment;

                    if (fragment.childNodes.length === 1) {
                        first = fragment = fragment.firstChild;
                    } else {
                        first = fragment.firstChild;
                    }

                    if (first) {
                        table = table && jQuery.nodeName(first, "tr");

                        for (var i = 0, l = this.length, lastIndex = l - 1; i < l; i++) {
                            callback.call(
                                table ?
                                    root(this[i], first) :
                                    this[i],
                            // Make sure that we do not leak memory by inadvertently discarding
                            // the original fragment (which might have attached data) instead of
                            // using it; in addition, use the original fragment object for the last
                            // item instead of first because it can end up being emptied incorrectly
                            // in certain situations (Bug #8070).
                            // Fragments from the fragment cache must always be cloned and never used
                            // in place.
                                results.cacheable || (l > 1 && i < lastIndex) ?
                                    jQuery.clone(fragment, true, true) :
                                    fragment
                            );
                        }
                    }

                    if (scripts.length) {
                        jQuery.each(scripts, function(i, elem) {
                            if (elem.src) {
                                jQuery.ajax({
                                    type: "GET",
                                    global: false,
                                    url: elem.src,
                                    async: false,
                                    dataType: "script"
                                });
                            } else {
                                jQuery.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"));
                            }

                            if (elem.parentNode) {
                                elem.parentNode.removeChild(elem);
                            }
                        });
                    }
                }

                return this;
            }
        });

        function root(elem, cur) {
            return jQuery.nodeName(elem, "table") ?
                (elem.getElementsByTagName("tbody")[0] ||
                    elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
                elem;
        }

        function cloneCopyEvent(src, dest) {

            if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
                return;
            }

            var type, i, l,
                oldData = jQuery._data(src),
                curData = jQuery._data(dest, oldData),
                events = oldData.events;

            if (events) {
                delete curData.handle;
                curData.events = { };

                for (type in events) {
                    for (i = 0, l = events[type].length; i < l; i++) {
                        jQuery.event.add(dest, type, events[type][i]);
                    }
                }
            }

            // make the cloned public data object a copy from the original
            if (curData.data) {
                curData.data = jQuery.extend({ }, curData.data);
            }
        }

        function cloneFixAttributes(src, dest) {
            var nodeName;

            // We do not need to do anything for non-Elements
            if (dest.nodeType !== 1) {
                return;
            }

            // clearAttributes removes the attributes, which we don't want,
            // but also removes the attachEvent events, which we *do* want
            if (dest.clearAttributes) {
                dest.clearAttributes();
            }

            // mergeAttributes, in contrast, only merges back on the
            // original attributes, not the events
            if (dest.mergeAttributes) {
                dest.mergeAttributes(src);
            }

            nodeName = dest.nodeName.toLowerCase();

            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object") {
                dest.outerHTML = src.outerHTML;

            } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest.defaultChecked = dest.checked = src.checked;
                }

                // IE6-7 get confused and end up setting the value of a cloned
                // checkbox/radio button to an empty string instead of "on"
                if (dest.value !== src.value) {
                    dest.value = src.value;
                }

                // IE6-8 fails to return the selected option to the default selected
                // state when cloning options
            } else if (nodeName === "option") {
                dest.selected = src.defaultSelected;

                // IE6-8 fails to set the defaultValue to the correct value when
                // cloning other types of input fields
            } else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;

                // IE blanks contents when cloning scripts
            } else if (nodeName === "script" && dest.text !== src.text) {
                dest.text = src.text;
            }

            // Event data gets referenced instead of copied if the expando
            // gets copied too
            dest.removeAttribute(jQuery.expando);

            // Clear flags for bubbling special change/submit events, they must
            // be reattached when the newly cloned events are first activated
            dest.removeAttribute("_submit_attached");
            dest.removeAttribute("_change_attached");
        }

        jQuery.buildFragment = function(args, nodes, scripts) {
            var fragment, cacheable, cacheresults, doc,
                first = args[0];

            // nodes may contain either an explicit document object,
            // a jQuery collection or context object.
            // If nodes[0] contains a valid object to assign to doc
            if (nodes && nodes[0]) {
                doc = nodes[0].ownerDocument || nodes[0];
            }

            // Ensure that an attr object doesn't incorrectly stand in as a document object
            // Chrome and Firefox seem to allow this to occur and will throw exception
            // Fixes #8950
            if (!doc.createDocumentFragment) {
                doc = document;
            }

            // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
            // Cloning options loses the selected state, so don't cache them
            // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
            // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
            // Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
            if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
                first.charAt(0) === "<" && !rnocache.test(first) &&
                    (jQuery.support.checkClone || !rchecked.test(first)) &&
                        (jQuery.support.html5Clone || !rnoshimcache.test(first))) {

                cacheable = true;

                cacheresults = jQuery.fragments[first];
                if (cacheresults && cacheresults !== 1) {
                    fragment = cacheresults;
                }
            }

            if (!fragment) {
                fragment = doc.createDocumentFragment();
                jQuery.clean(args, doc, fragment, scripts);
            }

            if (cacheable) {
                jQuery.fragments[first] = cacheresults ? fragment : 1;
            }

            return { fragment: fragment, cacheable: cacheable };
        };

        jQuery.fragments = { };

        jQuery.each({
                appendTo: "append",
                prependTo: "prepend",
                insertBefore: "before",
                insertAfter: "after",
                replaceAll: "replaceWith"
            }, function(name, original) {
                jQuery.fn[name] = function(selector) {
                    var ret = [],
                        insert = jQuery(selector),
                        parent = this.length === 1 && this[0].parentNode;

                    if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
                        insert[original](this[0]);
                        return this;

                    } else {
                        for (var i = 0, l = insert.length; i < l; i++) {
                            var elems = (i > 0 ? this.clone(true) : this).get();
                            jQuery(insert[i])[original](elems);
                            ret = ret.concat(elems);
                        }

                        return this.pushStack(ret, name, insert.selector);
                    }
                };
            });

        function getAll(elem) {
            if (typeof elem.getElementsByTagName !== "undefined") {
                return elem.getElementsByTagName("*");

            } else if (typeof elem.querySelectorAll !== "undefined") {
                return elem.querySelectorAll("*");

            } else {
                return [];
            }
        }

        // Used in clean, fixes the defaultChecked property

        function fixDefaultChecked(elem) {
            if (elem.type === "checkbox" || elem.type === "radio") {
                elem.defaultChecked = elem.checked;
            }
        }

// Finds all inputs and passes them to fixDefaultChecked

        function findInputs(elem) {
            var nodeName = (elem.nodeName || "").toLowerCase();
            if (nodeName === "input") {
                fixDefaultChecked(elem);
                // Skip scripts, get other children
            } else if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined") {
                jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked);
            }
        }

        // Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js

        function shimCloneNode(elem) {
            var div = document.createElement("div");
            safeFragment.appendChild(div);

            div.innerHTML = elem.outerHTML;
            return div.firstChild;
        }

        jQuery.extend({
            clone: function(elem, dataAndEvents, deepDataAndEvents) {
                var srcElements,
                    destElements,
                    i,
                    // IE<=8 does not properly clone detached, unknown element nodes
                    clone = jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test("<" + elem.nodeName + ">") ?
                        elem.cloneNode(true) :
                        shimCloneNode(elem);

                if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
                    (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.

                    cloneFixAttributes(elem, clone);

                    // Using Sizzle here is crazy slow, so we use getElementsByTagName instead
                    srcElements = getAll(elem);
                    destElements = getAll(clone);

                    // Weird iteration because IE will replace the length property
                    // with an element if you are cloning the body and one of the
                    // elements on the page has a name or id of "length"
                    for (i = 0; srcElements[i]; ++i) {
                        // Ensure that the destination node is not null; Fixes #9587
                        if (destElements[i]) {
                            cloneFixAttributes(srcElements[i], destElements[i]);
                        }
                    }
                }

                // Copy the events from the original to the clone
                if (dataAndEvents) {
                    cloneCopyEvent(elem, clone);

                    if (deepDataAndEvents) {
                        srcElements = getAll(elem);
                        destElements = getAll(clone);

                        for (i = 0; srcElements[i]; ++i) {
                            cloneCopyEvent(srcElements[i], destElements[i]);
                        }
                    }
                }

                srcElements = destElements = null;

                // Return the cloned set
                return clone;
            },

            clean: function(elems, context, fragment, scripts) {
                var checkScriptType, script, j,
                    ret = [];

                context = context || document;

                // !context.createElement fails in IE with an error but returns typeof 'object'
                if (typeof context.createElement === "undefined") {
                    context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
                }

                for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                    if (typeof elem === "number") {
                        elem += "";
                    }

                    if (!elem) {
                        continue;
                    }

                    // Convert html string into DOM nodes
                    if (typeof elem === "string") {
                        if (!rhtml.test(elem)) {
                            elem = context.createTextNode(elem);
                        } else {
                            // Fix "XHTML"-style tags in all browsers
                            elem = elem.replace(rxhtmlTag, "<$1></$2>");

                            // Trim whitespace, otherwise indexOf won't work as expected
                            var tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(),
                                wrap = wrapMap[tag] || wrapMap._default,
                                depth = wrap[0],
                                div = context.createElement("div"),
                                safeChildNodes = safeFragment.childNodes,
                                remove;

                            // Append wrapper element to unknown element safe doc fragment
                            if (context === document) {
                                // Use the fragment we've already created for this document
                                safeFragment.appendChild(div);
                            } else {
                                // Use a fragment created with the owner document
                                createSafeFragment(context).appendChild(div);
                            }

                            // Go to html and back, then peel off extra wrappers
                            div.innerHTML = wrap[1] + elem + wrap[2];

                            // Move to the right depth
                            while (depth--) {
                                div = div.lastChild;
                            }

                            // Remove IE's autoinserted <tbody> from table fragments
                            if (!jQuery.support.tbody) {

                                // String was a <table>, *may* have spurious <tbody>
                                var hasBody = rtbody.test(elem),
                                    tbody = tag === "table" && !hasBody ?
                                        div.firstChild && div.firstChild.childNodes :
                                // String was a bare <thead> or <tfoot>
                                        wrap[1] === "<table>" && !hasBody ?
                                            div.childNodes :
                                            [];

                                for (j = tbody.length - 1; j >= 0; --j) {
                                    if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) {
                                        tbody[j].parentNode.removeChild(tbody[j]);
                                    }
                                }
                            }

                            // IE completely kills leading whitespace when innerHTML is used
                            if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                                div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                            }

                            elem = div.childNodes;

                            // Clear elements from DocumentFragment (safeFragment or otherwise)
                            // to avoid hoarding elements. Fixes #11356
                            if (div) {
                                div.parentNode.removeChild(div);

                                // Guard against -1 index exceptions in FF3.6
                                if (safeChildNodes.length > 0) {
                                    remove = safeChildNodes[safeChildNodes.length - 1];

                                    if (remove && remove.parentNode) {
                                        remove.parentNode.removeChild(remove);
                                    }
                                }
                            }
                        }
                    }

                    // Resets defaultChecked for any radios and checkboxes
                    // about to be appended to the DOM in IE 6/7 (#8060)
                    var len;
                    if (!jQuery.support.appendChecked) {
                        if (elem[0] && typeof(len = elem.length) === "number") {
                            for (j = 0; j < len; j++) {
                                findInputs(elem[j]);
                            }
                        } else {
                            findInputs(elem);
                        }
                    }

                    if (elem.nodeType) {
                        ret.push(elem);
                    } else {
                        ret = jQuery.merge(ret, elem);
                    }
                }

                if (fragment) {
                    checkScriptType = function(elem) {
                        return !elem.type || rscriptType.test(elem.type);
                    };
                    for (i = 0; ret[i]; i++) {
                        script = ret[i];
                        if (scripts && jQuery.nodeName(script, "script") && (!script.type || rscriptType.test(script.type))) {
                            scripts.push(script.parentNode ? script.parentNode.removeChild(script) : script);

                        } else {
                            if (script.nodeType === 1) {
                                var jsTags = jQuery.grep(script.getElementsByTagName("script"), checkScriptType);

                                ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
                            }
                            fragment.appendChild(script);
                        }
                    }
                }

                return ret;
            },

            cleanData: function(elems) {
                var data, id,
                    cache = jQuery.cache,
                    special = jQuery.event.special,
                    deleteExpando = jQuery.support.deleteExpando;

                for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                    if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) {
                        continue;
                    }

                    id = elem[jQuery.expando];

                    if (id) {
                        data = cache[id];

                        if (data && data.events) {
                            for (var type in data.events) {
                                if (special[type]) {
                                    jQuery.event.remove(elem, type);

                                    // This is a shortcut to avoid jQuery.event.remove's overhead
                                } else {
                                    jQuery.removeEvent(elem, type, data.handle);
                                }
                            }

                            // Null the DOM reference to avoid IE6/7/8 leak (#7054)
                            if (data.handle) {
                                data.handle.elem = null;
                            }
                        }

                        if (deleteExpando) {
                            delete elem[jQuery.expando];

                        } else if (elem.removeAttribute) {
                            elem.removeAttribute(jQuery.expando);
                        }

                        delete cache[id];
                    }
                }
            }
        });


        var ralpha = /alpha\([^)]*\)/i ,
            ropacity = /opacity=([^)]*)/ ,
            // fixed for IE9, see #8346
            rupper = /([A-Z]|^ms)/g ,
            rnum = /^[\-+]?(?:\d*\.)?\d+$/i ,
            rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i ,
            rrelNum = /^([\-+])=([\-+.\de]+)/ ,
            rmargin = /^margin/ ,
            cssShow = { position: "absolute", visibility: "hidden", display: "block" },
            // order is important!
            cssExpand = ["Top", "Right", "Bottom", "Left"],
            curCSS,
            getComputedStyle,
            currentStyle;

        jQuery.fn.css = function(name, value) {
            return jQuery.access(this, function(elem, name, value) {
                return value !== undefined ?
                    jQuery.style(elem, name, value) :
                    jQuery.css(elem, name);
            }, name, value, arguments.length > 1);
        };

        jQuery.extend({
        // Add in style property hooks for overriding the default
        // behavior of getting and setting a style property
            cssHooks: {
                opacity: {
                    get: function(elem, computed) {
                        if (computed) {
                            // We should always get a number back from opacity
                            var ret = curCSS(elem, "opacity");
                            return ret === "" ? "1" : ret;

                        } else {
                            return elem.style.opacity;
                        }
                    }
                }
            },

            // Exclude the following css properties to add px
            cssNumber: {
                "fillOpacity": true,
                "fontWeight": true,
                "lineHeight": true,
                "opacity": true,
                "orphans": true,
                "widows": true,
                "zIndex": true,
                "zoom": true
            },

            // Add in properties whose names you wish to fix before
            // setting or getting the value
            cssProps: {
            // normalize float css property
                "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
            },

            // Get and set the style property on a DOM Node
            style: function(elem, name, value, extra) {
                // Don't set styles on text and comment nodes
                if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                    return;
                }

                // Make sure that we're working with the right name
                var ret, type, origName = jQuery.camelCase(name),
                    style = elem.style, hooks = jQuery.cssHooks[origName];

                name = jQuery.cssProps[origName] || origName;

                // Check if we're setting a value
                if (value !== undefined) {
                    type = typeof value;

                    // convert relative number strings (+= or -=) to relative numbers. #7345
                    if (type === "string" && (ret = rrelNum.exec(value))) {
                        value = (+(ret[1] + 1) * +ret[2]) + parseFloat(jQuery.css(elem, name));
                        // Fixes bug #9237
                        type = "number";
                    }

                    // Make sure that NaN and null values aren't set. See: #7116
                    if (value == null || type === "number" && isNaN(value)) {
                        return;
                    }

                    // If a number was passed in, add 'px' to the (except for certain CSS properties)
                    if (type === "number" && !jQuery.cssNumber[origName]) {
                        value += "px";
                    }

                    // If a hook was provided, use that value, otherwise just set the specified value
                    if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                        // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
                        // Fixes bug #5509
                        try {
                            style[name] = value;
                        } catch(e) {
                        }
                    }

                } else {
                    // If a hook was provided get the non-computed value from there
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                        return ret;
                    }

                    // Otherwise just get the value from the style object
                    return style[name];
                }
            },

            css: function(elem, name, extra) {
                var ret, hooks;

                // Make sure that we're working with the right name
                name = jQuery.camelCase(name);
                hooks = jQuery.cssHooks[name];
                name = jQuery.cssProps[name] || name;

                // cssFloat needs a special treatment
                if (name === "cssFloat") {
                    name = "float";
                }

                // If a hook was provided get the computed value from there
                if (hooks && "get" in hooks && (ret = hooks.get(elem, true, extra)) !== undefined) {
                    return ret;

                    // Otherwise, if a way to get the computed value exists, use that
                } else if (curCSS) {
                    return curCSS(elem, name);
                }
            },

            // A method for quickly swapping in/out CSS properties to get correct calculations
            swap: function(elem, options, callback) {
                var old = { },
                    ret, name;

                // Remember the old values, and insert the new ones
                for (name in options) {
                    old[name] = elem.style[name];
                    elem.style[name] = options[name];
                }

                ret = callback.call(elem);

                // Revert the old values
                for (name in options) {
                    elem.style[name] = old[name];
                }

                return ret;
            }
        });

        // DEPRECATED in 1.3, Use jQuery.css() instead
        jQuery.curCSS = jQuery.css;

        if (document.defaultView && document.defaultView.getComputedStyle) {
            getComputedStyle = function(elem, name) {
                var ret, defaultView, computedStyle, width,
                    style = elem.style;

                name = name.replace(rupper, "-$1").toLowerCase();

                if ((defaultView = elem.ownerDocument.defaultView) &&
                    (computedStyle = defaultView.getComputedStyle(elem, null))) {

                    ret = computedStyle.getPropertyValue(name);
                    if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
                        ret = jQuery.style(elem, name);
                    }
                }

                // A tribute to the "awesome hack by Dean Edwards"
                // WebKit uses "computed value (percentage if specified)" instead of "used value" for margins
                // which is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
                if (!jQuery.support.pixelMargin && computedStyle && rmargin.test(name) && rnumnonpx.test(ret)) {
                    width = style.width;
                    style.width = ret;
                    ret = computedStyle.width;
                    style.width = width;
                }

                return ret;
            };
        }

        if (document.documentElement.currentStyle) {
            currentStyle = function(elem, name) {
                var left, rsLeft, uncomputed,
                    ret = elem.currentStyle && elem.currentStyle[name],
                    style = elem.style;

                // Avoid setting ret to empty string here
                // so we don't default to auto
                if (ret == null && style && (uncomputed = style[name])) {
                    ret = uncomputed;
                }

                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

                // If we're not dealing with a regular pixel number
                // but a number that has a weird ending, we need to convert it to pixels
                if (rnumnonpx.test(ret)) {

                    // Remember the original values
                    left = style.left;
                    rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

                    // Put in the new values to get a computed value out
                    if (rsLeft) {
                        elem.runtimeStyle.left = elem.currentStyle.left;
                    }
                    style.left = name === "fontSize" ? "1em" : ret;
                    ret = style.pixelLeft + "px";

                    // Revert the changed values
                    style.left = left;
                    if (rsLeft) {
                        elem.runtimeStyle.left = rsLeft;
                    }
                }

                return ret === "" ? "auto" : ret;
            };
        }

        curCSS = getComputedStyle || currentStyle;

        function getWidthOrHeight(elem, name, extra) {

            // Start with offset property
            var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
                i = name === "width" ? 1 : 0,
                len = 4;

            if (val > 0) {
                if (extra !== "border") {
                    for (; i < len; i += 2) {
                        if (!extra) {
                            val -= parseFloat(jQuery.css(elem, "padding" + cssExpand[i])) || 0;
                        }
                        if (extra === "margin") {
                            val += parseFloat(jQuery.css(elem, extra + cssExpand[i])) || 0;
                        } else {
                            val -= parseFloat(jQuery.css(elem, "border" + cssExpand[i] + "Width")) || 0;
                        }
                    }
                }

                return val + "px";
            }

            // Fall back to computed then uncomputed css if necessary
            val = curCSS(elem, name);
            if (val < 0 || val == null) {
                val = elem.style[name];
            }

            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }

            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;

            // Add padding, border, margin
            if (extra) {
                for (; i < len; i += 2) {
                    val += parseFloat(jQuery.css(elem, "padding" + cssExpand[i])) || 0;
                    if (extra !== "padding") {
                        val += parseFloat(jQuery.css(elem, "border" + cssExpand[i] + "Width")) || 0;
                    }
                    if (extra === "margin") {
                        val += parseFloat(jQuery.css(elem, extra + cssExpand[i])) || 0;
                    }
                }
            }

            return val + "px";
        }

        jQuery.each(["height", "width"], function(i, name) {
            jQuery.cssHooks[name] = {
                get: function(elem, computed, extra) {
                    if (computed) {
                        if (elem.offsetWidth !== 0) {
                            return getWidthOrHeight(elem, name, extra);
                        } else {
                            return jQuery.swap(elem, cssShow, function() {
                                return getWidthOrHeight(elem, name, extra);
                            });
                        }
                    }
                },

                set: function(elem, value) {
                    return rnum.test(value) ?
                        value + "px" :
                        value;
                }
            };
        });

        if (!jQuery.support.opacity) {
            jQuery.cssHooks.opacity = {
                get: function(elem, computed) {
                    // IE uses filters for opacity
                    return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ?
                        (parseFloat(RegExp.$1) / 100) + "" :
                        computed ? "1" : "";
                },

                set: function(elem, value) {
                    var style = elem.style,
                        currentStyle = elem.currentStyle,
                        opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "",
                        filter = currentStyle && currentStyle.filter || style.filter || "";

                    // IE has trouble with opacity if it does not have layout
                    // Force it by setting the zoom level
                    style.zoom = 1;

                    // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
                    if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "") {

                        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                        // if "filter:" is present at all, clearType is disabled, we want to avoid this
                        // style.removeAttribute is IE Only, but so apparently is this code path...
                        style.removeAttribute("filter");

                        // if there there is no filter style applied in a css rule, we are done
                        if (currentStyle && !currentStyle.filter) {
                            return;
                        }
                    }

                    // otherwise, set new filter values
                    style.filter = ralpha.test(filter) ?
                        filter.replace(ralpha, opacity) :
                        filter + " " + opacity;
                }
            };
        }

        jQuery(function() {
            // This hook cannot be added until DOM ready because the support test
            // for it is not run until after DOM ready
            if (!jQuery.support.reliableMarginRight) {
                jQuery.cssHooks.marginRight = {
                    get: function(elem, computed) {
                        // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                        // Work around by temporarily setting element display to inline-block
                        return jQuery.swap(elem, { "display": "inline-block" }, function() {
                            if (computed) {
                                return curCSS(elem, "margin-right");
                            } else {
                                return elem.style.marginRight;
                            }
                        });
                    }
                };
            }
        });

        if (jQuery.expr && jQuery.expr.filters) {
            jQuery.expr.filters.hidden = function(elem) {
                var width = elem.offsetWidth,
                    height = elem.offsetHeight;

                return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css(elem, "display")) === "none");
            };

            jQuery.expr.filters.visible = function(elem) {
                return !jQuery.expr.filters.hidden(elem);
            };
        }

        // These hooks are used by animate to expand properties
        jQuery.each({
                margin: "",
                padding: "",
                border: "Width"
            }, function(prefix, suffix) {

                jQuery.cssHooks[prefix + suffix] = {
                    expand: function(value) {
                        var i,
                            // assumes a single number if not a string
                            parts = typeof value === "string" ? value.split(" ") : [value],
                            expanded = { };

                        for (i = 0; i < 4; i++) {
                            expanded[prefix + cssExpand[i] + suffix] =
                                parts[i] || parts[i - 2] || parts[0];
                        }

                        return expanded;
                    }
                };
            });


        var r20 = /%20/g ,
            rbracket = /\[\]$/ ,
            rCRLF = /\r?\n/g ,
            rhash = /#.*$/ ,
            rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg , // IE leaves an \r character at EOL
            rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i ,
            // #7653, #8125, #8152: local protocol detection
            rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/ ,
            rnoContent = /^(?:GET|HEAD)$/ ,
            rprotocol = /^\/\// ,
            rquery = /\?/ ,
            rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi ,
            rselectTextarea = /^(?:select|textarea)/i ,
            rspacesAjax = /\s+/ ,
            rts = /([?&])_=[^&]*/ ,
            rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/ ,
            // Keep a copy of the old load method
            _load = jQuery.fn.load,
            /* Prefilters
        * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
        * 2) These are called:
        *    - BEFORE asking for a transport
        *    - AFTER param serialization (s.data is a string if s.processData is true)
        * 3) key is the dataType
        * 4) the catchall symbol "*" can be used
        * 5) execution will start with transport dataType and THEN continue down to "*" if needed
        */
            prefilters = { },
            /* Transports bindings
        * 1) key is the dataType
        * 2) the catchall symbol "*" can be used
        * 3) selection will start with transport dataType and THEN go to "*" if needed
        */
            transports = { },
            // Document location
            ajaxLocation,
            // Document location segments
            ajaxLocParts,
            // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
            allTypes = ["*/"] + ["*"];

        // #8138, IE may throw an exception when accessing
        // a field from window.location if document.domain has been set
        try {
            ajaxLocation = location.href;
        } catch(e) {
            // Use the href attribute of an A element
            // since IE will modify it given document.location
            ajaxLocation = document.createElement("a");
            ajaxLocation.href = "";
            ajaxLocation = ajaxLocation.href;
        }

        // Segment location into parts
        ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

        // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport

        function addToPrefiltersOrTransports(structure) {

            // dataTypeExpression is optional and defaults to "*"
            return function(dataTypeExpression, func) {

                if (typeof dataTypeExpression !== "string") {
                    func = dataTypeExpression;
                    dataTypeExpression = "*";
                }

                if (jQuery.isFunction(func)) {
                    var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax),
                        i = 0,
                        length = dataTypes.length,
                        dataType,
                        list,
                        placeBefore;

                    // For each dataType in the dataTypeExpression
                    for (; i < length; i++) {
                        dataType = dataTypes[i];
                        // We control if we're asked to add before
                        // any existing element
                        placeBefore = /^\+/ .test(dataType);
                        if (placeBefore) {
                            dataType = dataType.substr(1) || "*";
                        }
                        list = structure[dataType] = structure[dataType] || [];
                        // then we add to the structure accordingly
                        list[placeBefore ? "unshift" : "push"](func);
                    }
                }
            };
        }

        // Base inspection function for prefilters and transports

        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR,
            dataType /* internal */, inspected /* internal */) {

            dataType = dataType || options.dataTypes[0];
            inspected = inspected || { };

            inspected[dataType] = true;

            var list = structure[dataType],
                i = 0,
                length = list ? list.length : 0,
                executeOnly = (structure === prefilters),
                selection;

            for (; i < length && (executeOnly || !selection); i++) {
                selection = list[i](options, originalOptions, jqXHR);
                // If we got redirected to another dataType
                // we try there if executing only and not done already
                if (typeof selection === "string") {
                    if (!executeOnly || inspected[selection]) {
                        selection = undefined;
                    } else {
                        options.dataTypes.unshift(selection);
                        selection = inspectPrefiltersOrTransports(
                            structure, options, originalOptions, jqXHR, selection, inspected);
                    }
                }
            }
            // If we're only executing or nothing was selected
            // we try the catchall dataType if not done already
            if ((executeOnly || !selection) && !inspected["*"]) {
                selection = inspectPrefiltersOrTransports(
                    structure, options, originalOptions, jqXHR, "*", inspected);
            }
            // unnecessary when only executing (prefilters)
            // but it'll be ignored by the caller in that case
            return selection;
        }

        // A special extend for ajax options
        // that takes "flat" options (not to be deep extended)
        // Fixes #9887

        function ajaxExtend(target, src) {
            var key, deep,
                flatOptions = jQuery.ajaxSettings.flatOptions || { };
            for (key in src) {
                if (src[key] !== undefined) {
                    (flatOptions[key] ? target : (deep || (deep = { })))[key] = src[key];
                }
            }
            if (deep) {
                jQuery.extend(true, target, deep);
            }
        }

        jQuery.fn.extend({
            load: function(url, params, callback) {
                if (typeof url !== "string" && _load) {
                    return _load.apply(this, arguments);

                    // Don't do a request if no elements are being requested
                } else if (!this.length) {
                    return this;
                }

                var off = url.indexOf(" ");
                if (off >= 0) {
                    var selector = url.slice(off, url.length);
                    url = url.slice(0, off);
                }

                // Default to a GET request
                var type = "GET";

                // If the second parameter was provided
                if (params) {
                    // If it's a function
                    if (jQuery.isFunction(params)) {
                        // We assume that it's the callback
                        callback = params;
                        params = undefined;

                        // Otherwise, build a param string
                    } else if (typeof params === "object") {
                        params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                        type = "POST";
                    }
                }

                var self = this;

                // Request the remote document
                jQuery.ajax({
                    url: url,
                    type: type,
                    dataType: "html",
                    data: params,
                    // Complete callback (responseText is used internally)
                    complete: function(jqXHR, status, responseText) {
                        // Store the response as specified by the jqXHR object
                        responseText = jqXHR.responseText;
                        // If successful, inject the HTML into all the matched elements
                        if (jqXHR.isResolved()) {
                            // #4825: Get the actual response in case
                            // a dataFilter is present in ajaxSettings
                            jqXHR.done(function(r) {
                                responseText = r;
                            });
                            // See if a selector was specified
                            self.html(selector ?
                            // Create a dummy div to hold the results
                                    jQuery("<div>")
                                        // inject the contents of the document in, removing the scripts
                                        // to avoid any 'Permission Denied' errors in IE
                                        .append(responseText.replace(rscript, ""))

                                        // Locate the specified elements
                                        .find(selector) :
                            // If not, just inject the full result
                                    responseText);
                        }

                        if (callback) {
                            self.each(callback, [responseText, status, jqXHR]);
                        }
                    }
                });

                return this;
            },

            serialize: function() {
                return jQuery.param(this.serializeArray());
            },

            serializeArray: function() {
                return this.map(function() {
                    return this.elements ? jQuery.makeArray(this.elements) : this;
                })
                    .filter(function() {
                        return this.name && !this.disabled &&
                            (this.checked || rselectTextarea.test(this.nodeName) ||
                                rinput.test(this.type));
                    })
                    .map(function(i, elem) {
                        var val = jQuery(this).val();

                        return val == null ?
                            null :
                            jQuery.isArray(val) ?
                                jQuery.map(val, function(val, i) {
                                    return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
                                }) :
                                { name: elem.name, value: val.replace(rCRLF, "\r\n") };
                    }).get();
            }
        });

        // Attach a bunch of functions for handling common AJAX events
        jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(i, o) {
            jQuery.fn[o] = function(f) {
                return this.on(o, f);
            };
        });

        jQuery.each(["get", "post"], function(i, method) {
            jQuery[method] = function(url, data, callback, type) {
                // shift arguments if data argument was omitted
                if (jQuery.isFunction(data)) {
                    type = type || callback;
                    callback = data;
                    data = undefined;
                }

                return jQuery.ajax({
                    type: method,
                    url: url,
                    data: data,
                    success: callback,
                    dataType: type
                });
            };
        });

        jQuery.extend({
            getScript: function(url, callback) {
                return jQuery.get(url, undefined, callback, "script");
            },

            getJSON: function(url, data, callback) {
                return jQuery.get(url, data, callback, "json");
            },

            // Creates a full fledged settings object into target
            // with both ajaxSettings and settings fields.
            // If target is omitted, writes into ajaxSettings.
            ajaxSetup: function(target, settings) {
                if (settings) {
                    // Building a settings object
                    ajaxExtend(target, jQuery.ajaxSettings);
                } else {
                    // Extending ajaxSettings
                    settings = target;
                    target = jQuery.ajaxSettings;
                }
                ajaxExtend(target, settings);
                return target;
            },

            ajaxSettings: {
                url: ajaxLocation,
                isLocal: rlocalProtocol.test(ajaxLocParts[1]),
                global: true,
                type: "GET",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                processData: true,
                async: true,
                /*
                timeout: 0,
                data: null,
                dataType: null,
                username: null,
                password: null,
                cache: null,
                traditional: false,
                headers: {},
                */

                accepts: {
                    xml: "application/xml, text/xml",
                    html: "text/html",
                    text: "text/plain",
                    json: "application/json, text/javascript",
                    "*": allTypes
                },

                contents: {
                    xml: /xml/ ,
                    html: /html/ ,
                    json: /json/
                },

                responseFields: {
                    xml: "responseXML",
                    text: "responseText"
                },

                // List of data converters
                // 1) key format is "source_type destination_type" (a single space in-between)
                // 2) the catchall symbol "*" can be used for source_type
                converters: {
                // Convert anything to text
                    "* text": window.String,

                    // Text to html (true = no transformation)
                    "text html": true,

                    // Evaluate text as a json expression
                    "text json": jQuery.parseJSON,

                    // Parse text as xml
                    "text xml": jQuery.parseXML
                },

                // For options that shouldn't be deep extended:
                // you can add your own custom options here if
                // and when you create one that shouldn't be
                // deep extended (see ajaxExtend)
                flatOptions: {
                    context: true,
                    url: true
                }
            },

            ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
            ajaxTransport: addToPrefiltersOrTransports(transports),

            // Main method
            ajax: function(url, options) {

                // If url is an object, simulate pre-1.5 signature
                if (typeof url === "object") {
                    options = url;
                    url = undefined;
                }

                // Force options to be an object
                options = options || { };

                var// Create the final options object
                    s = jQuery.ajaxSetup({ }, options),
                    // Callbacks context
                    callbackContext = s.context || s,
                    // Context for global events
                // It's the callbackContext if one was provided in the options
                // and if it's a DOM node or a jQuery collection
                    globalEventContext = callbackContext !== s &&
                        (callbackContext.nodeType || callbackContext instanceof jQuery) ?
                        jQuery(callbackContext) : jQuery.event,
                    // Deferreds
                    deferred = jQuery.Deferred(),
                    completeDeferred = jQuery.Callbacks("once memory"),
                    // Status-dependent callbacks
                    statusCode = s.statusCode || { },
                    // ifModified key
                    ifModifiedKey,
                    // Headers (they are sent all at once)
                    requestHeaders = { },
                    requestHeadersNames = { },
                    // Response headers
                    responseHeadersString,
                    responseHeaders,
                    // transport
                    transport,
                    // timeout handle
                    timeoutTimer,
                    // Cross-domain detection vars
                    parts,
                    // The jqXHR state
                    state = 0,
                    // To know if global events are to be dispatched
                    fireGlobals,
                    // Loop variable
                    i,
                    // Fake xhr
                    jqXHR = {
                        readyState: 0,

                        // Caches the header
                        setRequestHeader: function(name, value) {
                            if (!state) {
                                var lname = name.toLowerCase();
                                name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                                requestHeaders[name] = value;
                            }
                            return this;
                        },

                        // Raw string
                        getAllResponseHeaders: function() {
                            return state === 2 ? responseHeadersString : null;
                        },

                        // Builds headers hashtable if needed
                        getResponseHeader: function(key) {
                            var match;
                            if (state === 2) {
                                if (!responseHeaders) {
                                    responseHeaders = { };
                                    while ((match = rheaders.exec(responseHeadersString))) {
                                        responseHeaders[match[1].toLowerCase()] = match[2];
                                    }
                                }
                                match = responseHeaders[key.toLowerCase()];
                            }
                            return match === undefined ? null : match;
                        },

                        // Overrides response content-type header
                        overrideMimeType: function(type) {
                            if (!state) {
                                s.mimeType = type;
                            }
                            return this;
                        },

                        // Cancel the request
                        abort: function(statusText) {
                            statusText = statusText || "abort";
                            if (transport) {
                                transport.abort(statusText);
                            }
                            done(0, statusText);
                            return this;
                        }
                    };

                // Callback for when everything is done
                // It is defined here because jslint complains if it is declared
                // at the end of the function (which would be more logical and readable)

                function done(status, nativeStatusText, responses, headers) {

                    // Called once
                    if (state === 2) {
                        return;
                    }

                    // State is "done" now
                    state = 2;

                    // Clear timeout if it exists
                    if (timeoutTimer) {
                        clearTimeout(timeoutTimer);
                    }

                    // Dereference transport for early garbage collection
                    // (no matter how long the jqXHR object will be used)
                    transport = undefined;

                    // Cache response headers
                    responseHeadersString = headers || "";

                    // Set readyState
                    jqXHR.readyState = status > 0 ? 4 : 0;

                    var isSuccess,
                        success,
                        error,
                        statusText = nativeStatusText,
                        response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined,
                        lastModified,
                        etag;

                    // If successful, handle type chaining
                    if (status >= 200 && status < 300 || status === 304) {

                        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                        if (s.ifModified) {

                            if ((lastModified = jqXHR.getResponseHeader("Last-Modified"))) {
                                jQuery.lastModified[ifModifiedKey] = lastModified;
                            }
                            if ((etag = jqXHR.getResponseHeader("Etag"))) {
                                jQuery.etag[ifModifiedKey] = etag;
                            }
                        }

                        // If not modified
                        if (status === 304) {

                            statusText = "notmodified";
                            isSuccess = true;

                            // If we have data
                        } else {

                            try {
                                success = ajaxConvert(s, response);
                                statusText = "success";
                                isSuccess = true;
                            } catch(e) {
                                // We have a parsererror
                                statusText = "parsererror";
                                error = e;
                            }
                        }
                    } else {
                        // We extract error from statusText
                        // then normalize statusText and status for non-aborts
                        error = statusText;
                        if (!statusText || status) {
                            statusText = "error";
                            if (status < 0) {
                                status = 0;
                            }
                        }
                    }

                    // Set data for the fake xhr object
                    jqXHR.status = status;
                    jqXHR.statusText = "" + (nativeStatusText || statusText);

                    // Success/Error
                    if (isSuccess) {
                        deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
                    } else {
                        deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
                    }

                    // Status-dependent callbacks
                    jqXHR.statusCode(statusCode);
                    statusCode = undefined;

                    if (fireGlobals) {
                        globalEventContext.trigger("ajax" + (isSuccess ? "Success" : "Error"),
                            [jqXHR, s, isSuccess ? success : error]);
                    }

                    // Complete
                    completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

                    if (fireGlobals) {
                        globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                        // Handle the global AJAX counter
                        if (!(--jQuery.active)) {
                            jQuery.event.trigger("ajaxStop");
                        }
                    }
                }

                // Attach deferreds
                deferred.promise(jqXHR);
                jqXHR.success = jqXHR.done;
                jqXHR.error = jqXHR.fail;
                jqXHR.complete = completeDeferred.add;

                // Status-dependent callbacks
                jqXHR.statusCode = function(map) {
                    if (map) {
                        var tmp;
                        if (state < 2) {
                            for (tmp in map) {
                                statusCode[tmp] = [statusCode[tmp], map[tmp]];
                            }
                        } else {
                            tmp = map[jqXHR.status];
                            jqXHR.then(tmp, tmp);
                        }
                    }
                    return this;
                };

                // Remove hash character (#7531: and string promotion)
                // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
                // We also use the url parameter if available
                s.url = ((url || s.url) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

                // Extract dataTypes list
                s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);

                // Determine if a cross-domain request is in order
                if (s.crossDomain == null) {
                    parts = rurl.exec(s.url.toLowerCase());
                    s.crossDomain = !!(parts &&
                        (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
                            (parts[3] || (parts[1] === "http:" ? 80 : 443)) !=
                                (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443)))
                    );
                }

                // Convert data if not already a string
                if (s.data && s.processData && typeof s.data !== "string") {
                    s.data = jQuery.param(s.data, s.traditional);
                }

                // Apply prefilters
                inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

                // If request was aborted inside a prefilter, stop there
                if (state === 2) {
                    return false;
                }

                // We can fire global events as of now if asked to
                fireGlobals = s.global;

                // Uppercase the type
                s.type = s.type.toUpperCase();

                // Determine if request has content
                s.hasContent = !rnoContent.test(s.type);

                // Watch for a new set of requests
                if (fireGlobals && jQuery.active++ === 0) {
                    jQuery.event.trigger("ajaxStart");
                }

                // More options handling for requests with no content
                if (!s.hasContent) {

                    // If data is available, append data to url
                    if (s.data) {
                        s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
                        // #9682: remove data so that it's not used in an eventual retry
                        delete s.data;
                    }

                    // Get ifModifiedKey before adding the anti-cache parameter
                    ifModifiedKey = s.url;

                    // Add anti-cache in url if needed
                    if (s.cache === false) {

                        var ts = jQuery.now(),
                            // try replacing _= if it is there
                            ret = s.url.replace(rts, "$1_=" + ts);

                        // if nothing was replaced, add timestamp to the end
                        s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
                    }
                }

                // Set the correct header, if data is being sent
                if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
                    jqXHR.setRequestHeader("Content-Type", s.contentType);
                }

                // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                if (s.ifModified) {
                    ifModifiedKey = ifModifiedKey || s.url;
                    if (jQuery.lastModified[ifModifiedKey]) {
                        jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[ifModifiedKey]);
                    }
                    if (jQuery.etag[ifModifiedKey]) {
                        jqXHR.setRequestHeader("If-None-Match", jQuery.etag[ifModifiedKey]);
                    }
                }

                // Set the Accepts header for the server, depending on the dataType
                jqXHR.setRequestHeader(
                    "Accept",
                    s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
                        s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") :
                        s.accepts["*"]
                );

                // Check for headers option
                for (i in s.headers) {
                    jqXHR.setRequestHeader(i, s.headers[i]);
                }

                // Allow custom headers/mimetypes and early abort
                if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
                    // Abort if not done already
                    jqXHR.abort();
                    return false;

                }

                // Install callbacks on deferreds
                for (i in { success: 1, error: 1, complete: 1 }) {
                    jqXHR[i](s[i]);
                }

                // Get transport
                transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

                // If no transport, we auto-abort
                if (!transport) {
                    done(-1, "No Transport");
                } else {
                    jqXHR.readyState = 1;
                    // Send global event
                    if (fireGlobals) {
                        globalEventContext.trigger("ajaxSend", [jqXHR, s]);
                    }
                    // Timeout
                    if (s.async && s.timeout > 0) {
                        timeoutTimer = setTimeout(function() {
                            jqXHR.abort("timeout");
                        }, s.timeout);
                    }

                    try {
                        state = 1;
                        transport.send(requestHeaders, done);
                    } catch(e) {
                        // Propagate exception as error if not done
                        if (state < 2) {
                            done(-1, e);
                            // Simply rethrow otherwise
                        } else {
                            throw e;
                        }
                    }
                }

                return jqXHR;
            },

            // Serialize an array of form elements or a set of
            // key/values into a query string
            param: function(a, traditional) {
                var s = [],
                    add = function(key, value) {
                        // If value is a function, invoke it and return its value
                        value = jQuery.isFunction(value) ? value() : value;
                        s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    };

                // Set traditional to true for jQuery <= 1.3.2 behavior.
                if (traditional === undefined) {
                    traditional = jQuery.ajaxSettings.traditional;
                }

                // If an array was passed in, assume that it is an array of form elements.
                if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
                    // Serialize the form elements
                    jQuery.each(a, function() {
                        add(this.name, this.value);
                    });

                } else {
                    // If traditional, encode the "old" way (the way 1.3.2 or older
                    // did it), otherwise encode params recursively.
                    for (var prefix in a) {
                        buildParams(prefix, a[prefix], traditional, add);
                    }
                }

                // Return the resulting serialization
                return s.join("&").replace(r20, "+");
            }
        });

        function buildParams(prefix, obj, traditional, add) {
            if (jQuery.isArray(obj)) {
                // Serialize array item.
                jQuery.each(obj, function(i, v) {
                    if (traditional || rbracket.test(prefix)) {
                        // Treat each array item as a scalar.
                        add(prefix, v);

                    } else {
                        // If array item is non-scalar (array or object), encode its
                        // numeric index to resolve deserialization ambiguity issues.
                        // Note that rack (as of 1.0.0) can't currently deserialize
                        // nested arrays properly, and attempting to do so may cause
                        // a server error. Possible fixes are to modify rack's
                        // deserialization algorithm or to provide an option or flag
                        // to force array serialization to be shallow.
                        buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
                    }
                });

            } else if (!traditional && jQuery.type(obj) === "object") {
                // Serialize object item.
                for (var name in obj) {
                    buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
                }

            } else {
                // Serialize scalar item.
                add(prefix, obj);
            }
        }

        // This is still on the jQuery object... for now
        // Want to move this to jQuery.ajax some day
        jQuery.extend({
        // Counter for holding the number of active queries
            active: 0,

            // Last-Modified header cache for next request
            lastModified: { },
            etag: { }
        });

        /* Handles responses to an ajax request:
        * - sets all responseXXX fields accordingly
        * - finds the right dataType (mediates between content-type and expected dataType)
        * - returns the corresponding response
        */

        function ajaxHandleResponses(s, jqXHR, responses) {

            var contents = s.contents,
                dataTypes = s.dataTypes,
                responseFields = s.responseFields,
                ct,
                type,
                finalDataType,
                firstDataType;

            // Fill responseXXX fields
            for (type in responseFields) {
                if (type in responses) {
                    jqXHR[responseFields[type]] = responses[type];
                }
            }

            // Remove auto dataType and get content-type in the process
            while (dataTypes[0] === "*") {
                dataTypes.shift();
                if (ct === undefined) {
                    ct = s.mimeType || jqXHR.getResponseHeader("content-type");
                }
            }

            // Check if we're dealing with a known content-type
            if (ct) {
                for (type in contents) {
                    if (contents[type] && contents[type].test(ct)) {
                        dataTypes.unshift(type);
                        break;
                    }
                }
            }

            // Check to see if we have a response for the expected dataType
            if (dataTypes[0] in responses) {
                finalDataType = dataTypes[0];
            } else {
                // Try convertible dataTypes
                for (type in responses) {
                    if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                        finalDataType = type;
                        break;
                    }
                    if (!firstDataType) {
                        firstDataType = type;
                    }
                }
                // Or just use first one
                finalDataType = finalDataType || firstDataType;
            }

            // If we found a dataType
            // We add the dataType to the list if needed
            // and return the corresponding response
            if (finalDataType) {
                if (finalDataType !== dataTypes[0]) {
                    dataTypes.unshift(finalDataType);
                }
                return responses[finalDataType];
            }
        }

        // Chain conversions given the request and the original response

        function ajaxConvert(s, response) {

            // Apply the dataFilter if provided
            if (s.dataFilter) {
                response = s.dataFilter(response, s.dataType);
            }

            var dataTypes = s.dataTypes,
                converters = { },
                i,
                key,
                length = dataTypes.length,
                tmp,
                // Current and previous dataTypes
                current = dataTypes[0],
                prev,
                // Conversion expression
                conversion,
                // Conversion function
                conv,
                // Conversion functions (transitive conversion)
                conv1,
                conv2;

            // For each dataType in the chain
            for (i = 1; i < length; i++) {

                // Create converters map
                // with lowercased keys
                if (i === 1) {
                    for (key in s.converters) {
                        if (typeof key === "string") {
                            converters[key.toLowerCase()] = s.converters[key];
                        }
                    }
                }

                // Get the dataTypes
                prev = current;
                current = dataTypes[i];

                // If current is auto dataType, update it to prev
                if (current === "*") {
                    current = prev;
                    // If no auto and dataTypes are actually different
                } else if (prev !== "*" && prev !== current) {

                    // Get the converter
                    conversion = prev + " " + current;
                    conv = converters[conversion] || converters["* " + current];

                    // If there is no direct converter, search transitively
                    if (!conv) {
                        conv2 = undefined;
                        for (conv1 in converters) {
                            tmp = conv1.split(" ");
                            if (tmp[0] === prev || tmp[0] === "*") {
                                conv2 = converters[tmp[1] + " " + current];
                                if (conv2) {
                                    conv1 = converters[conv1];
                                    if (conv1 === true) {
                                        conv = conv2;
                                    } else if (conv2 === true) {
                                        conv = conv1;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    // If we found no converter, dispatch an error
                    if (!(conv || conv2)) {
                        jQuery.error("No conversion from " + conversion.replace(" ", " to "));
                    }
                    // If found converter is not an equivalence
                    if (conv !== true) {
                        // Convert with 1 or 2 converters accordingly
                        response = conv ? conv(response) : conv2(conv1(response));
                    }
                }
            }
            return response;
        }


        var jsc = jQuery.now(),
            jsre = /(\=)\?(&|$)|\?\?/i ;

        // Default jsonp settings
        jQuery.ajaxSetup({
            jsonp: "callback",
            jsonpCallback: function() {
                return jQuery.expando + "_" + (jsc++);
            }
        });

        // Detect, normalize options and install callbacks for jsonp requests
        jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {

            var inspectData = (typeof s.data === "string") && /^application\/x\-www\-form\-urlencoded/ .test(s.contentType);

            if (s.dataTypes[0] === "jsonp" ||
                s.jsonp !== false && (jsre.test(s.url) ||
                    inspectData && jsre.test(s.data))) {

                var responseContainer,
                    jsonpCallback = s.jsonpCallback =
                        jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback,
                    previous = window[jsonpCallback],
                    url = s.url,
                    data = s.data,
                    replace = "$1" + jsonpCallback + "$2";

                if (s.jsonp !== false) {
                    url = url.replace(jsre, replace);
                    if (s.url === url) {
                        if (inspectData) {
                            data = data.replace(jsre, replace);
                        }
                        if (s.data === data) {
                            // Add callback manually
                            url += ( /\?/ .test(url) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
                        }
                    }
                }

                s.url = url;
                s.data = data;

                // Install callback
                window[jsonpCallback] = function(response) {
                    responseContainer = [response];
                };

                // Clean-up function
                jqXHR.always(function() {
                    // Set callback back to previous value
                    window[jsonpCallback] = previous;
                    // Call if it was a function and we have a response
                    if (responseContainer && jQuery.isFunction(previous)) {
                        window[jsonpCallback](responseContainer[0]);
                    }
                });

                // Use data converter to retrieve json after script execution
                s.converters["script json"] = function() {
                    if (!responseContainer) {
                        jQuery.error(jsonpCallback + " was not called");
                    }
                    return responseContainer[0];
                };

                // force json dataType
                s.dataTypes[0] = "json";

                // Delegate to script
                return "script";
            }
        });


        // Install script dataType
        jQuery.ajaxSetup({
            accepts: {
                script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            },
            contents: {
                script: /javascript|ecmascript/
            },
            converters: {
                "text script": function(text) {
                    jQuery.globalEval(text);
                    return text;
                }
            }
        });

        // Handle cache's special case and global
        jQuery.ajaxPrefilter("script", function(s) {
            if (s.cache === undefined) {
                s.cache = false;
            }
            if (s.crossDomain) {
                s.type = "GET";
                s.global = false;
            }
        });

        // Bind script tag hack transport
        jQuery.ajaxTransport("script", function(s) {

            // This transport only deals with cross domain requests
            if (s.crossDomain) {

                var script,
                    head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

                return {
                    send: function(_, callback) {

                        script = document.createElement("script");

                        script.async = "async";

                        if (s.scriptCharset) {
                            script.charset = s.scriptCharset;
                        }

                        script.src = s.url;

                        // Attach handlers for all browsers
                        script.onload = script.onreadystatechange = function(_, isAbort) {

                            if (isAbort || !script.readyState || /loaded|complete/ .test(script.readyState)) {

                                // Handle memory leak in IE
                                script.onload = script.onreadystatechange = null;

                                // Remove the script
                                if (head && script.parentNode) {
                                    head.removeChild(script);
                                }

                                // Dereference the script
                                script = undefined;

                                // Callback if not abort
                                if (!isAbort) {
                                    callback(200, "success");
                                }
                            }
                        };
                        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                        // This arises when a base node is used (#2709 and #4378).
                        head.insertBefore(script, head.firstChild);
                    },

                    abort: function() {
                        if (script) {
                            script.onload(0, 1);
                        }
                    }
                };
            }
        });


        var// #5280: Internet Explorer will keep connections alive if we don't abort on unload
            xhrOnUnloadAbort = window.ActiveXObject ? function() {
                // Abort all pending requests
                for (var key in xhrCallbacks) {
                    xhrCallbacks[key](0, 1);
                }
            } : false,
            xhrId = 0,
            xhrCallbacks;

        // Functions to create xhrs

        function createStandardXHR() {
            try {
                return new window.XMLHttpRequest();
            } catch(e) {
            }
        }

        function createActiveXHR() {
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } catch(e) {
            }
        }

        // Create the request object
        // (This is still attached to ajaxSettings for backward compatibility)
        jQuery.ajaxSettings.xhr = window.ActiveXObject ?
        /* Microsoft failed to properly
        * implement the XMLHttpRequest in IE7 (can't request local files),
        * so we use the ActiveXObject when it is available
        * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
        * we need a fallback.
        */
            function() {
                return !this.isLocal && createStandardXHR() || createActiveXHR();
            } :
        // For all other browsers, use the standard XMLHttpRequest object
            createStandardXHR;

        // Determine support properties
        (function(xhr) {
            jQuery.extend(jQuery.support, {
                ajax: !!xhr,
                cors: !!xhr && ("withCredentials" in xhr)
            });
        })(jQuery.ajaxSettings.xhr());

        // Create transport if the browser can provide an xhr
        if (jQuery.support.ajax) {

            jQuery.ajaxTransport(function(s) {
                // Cross domain only allowed if supported through XMLHttpRequest
                if (!s.crossDomain || jQuery.support.cors) {

                    var callback;

                    return {
                        send: function(headers, complete) {

                            // Get a new xhr
                            var xhr = s.xhr(),
                                handle,
                                i;

                            // Open the socket
                            // Passing null username, generates a login popup on Opera (#2865)
                            if (s.username) {
                                xhr.open(s.type, s.url, s.async, s.username, s.password);
                            } else {
                                xhr.open(s.type, s.url, s.async);
                            }

                            // Apply custom fields if provided
                            if (s.xhrFields) {
                                for (i in s.xhrFields) {
                                    xhr[i] = s.xhrFields[i];
                                }
                            }

                            // Override mime type if needed
                            if (s.mimeType && xhr.overrideMimeType) {
                                xhr.overrideMimeType(s.mimeType);
                            }

                            // X-Requested-With header
                            // For cross-domain requests, seeing as conditions for a preflight are
                            // akin to a jigsaw puzzle, we simply never set it to be sure.
                            // (it can always be set on a per-request basis or even using ajaxSetup)
                            // For same-domain requests, won't change header if already provided.
                            if (!s.crossDomain && !headers["X-Requested-With"]) {
                                headers["X-Requested-With"] = "XMLHttpRequest";
                            }

                            // Need an extra try/catch for cross domain requests in Firefox 3
                            try {
                                for (i in headers) {
                                    xhr.setRequestHeader(i, headers[i]);
                                }
                            } catch(_) {
                            }

                            // Do send the request
                            // This may raise an exception which is actually
                            // handled in jQuery.ajax (so no try/catch here)
                            xhr.send((s.hasContent && s.data) || null);

                            // Listener
                            callback = function(_, isAbort) {

                                var status,
                                    statusText,
                                    responseHeaders,
                                    responses,
                                    xml;

                                // Firefox throws exceptions when accessing properties
                                // of an xhr when a network error occured
                                // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                                try {

                                    // Was never called and is aborted or complete
                                    if (callback && (isAbort || xhr.readyState === 4)) {

                                        // Only called once
                                        callback = undefined;

                                        // Do not keep as active anymore
                                        if (handle) {
                                            xhr.onreadystatechange = jQuery.noop;
                                            if (xhrOnUnloadAbort) {
                                                delete xhrCallbacks[handle];
                                            }
                                        }

                                        // If it's an abort
                                        if (isAbort) {
                                            // Abort it manually if needed
                                            if (xhr.readyState !== 4) {
                                                xhr.abort();
                                            }
                                        } else {
                                            status = xhr.status;
                                            responseHeaders = xhr.getAllResponseHeaders();
                                            responses = { };
                                            xml = xhr.responseXML;

                                            // Construct response list
                                            if (xml && xml.documentElement /* #4958 */) {
                                                responses.xml = xml;
                                            }

                                            // When requesting binary data, IE6-9 will throw an exception
                                            // on any attempt to access responseText (#11426)
                                            try {
                                                responses.text = xhr.responseText;
                                            } catch(_) {
                                            }

                                            // Firefox throws an exception when accessing
                                            // statusText for faulty cross-domain requests
                                            try {
                                                statusText = xhr.statusText;
                                            } catch(e) {
                                                // We normalize with Webkit giving an empty statusText
                                                statusText = "";
                                            }

                                            // Filter status for non standard behaviors

                                            // If the request is local and we have data: assume a success
                                            // (success with no data won't get notified, that's the best we
                                            // can do given current implementations)
                                            if (!status && s.isLocal && !s.crossDomain) {
                                                status = responses.text ? 200 : 404;
                                                // IE - #1450: sometimes returns 1223 when it should be 204
                                            } else if (status === 1223) {
                                                status = 204;
                                            }
                                        }
                                    }
                                } catch(firefoxAccessException) {
                                    if (!isAbort) {
                                        complete(-1, firefoxAccessException);
                                    }
                                }

                                // Call complete if needed
                                if (responses) {
                                    complete(status, statusText, responses, responseHeaders);
                                }
                            };

                            // if we're in sync mode or it's in cache
                            // and has been retrieved directly (IE6 & IE7)
                            // we need to manually fire the callback
                            if (!s.async || xhr.readyState === 4) {
                                callback();
                            } else {
                                handle = ++xhrId;
                                if (xhrOnUnloadAbort) {
                                    // Create the active xhrs callbacks list if needed
                                    // and attach the unload handler
                                    if (!xhrCallbacks) {
                                        xhrCallbacks = { };
                                        jQuery(window).unload(xhrOnUnloadAbort);
                                    }
                                    // Add to list of active xhrs callbacks
                                    xhrCallbacks[handle] = callback;
                                }
                                xhr.onreadystatechange = callback;
                            }
                        },

                        abort: function() {
                            if (callback) {
                                callback(0, 1);
                            }
                        }
                    };
                }
            });
        }


        var elemdisplay = { },
            iframe, iframeDoc,
            rfxtypes = /^(?:toggle|show|hide)$/ ,
            rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i ,
            timerId,
            fxAttrs = [
        // height animations
                ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
        // width animations
                ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
        // opacity animations
                ["opacity"]
            ],
            fxNow;

        jQuery.fn.extend({
            show: function(speed, easing, callback) {
                var elem, display;

                if (speed || speed === 0) {
                    return this.animate(genFx("show", 3), speed, easing, callback);

                } else {
                    for (var i = 0, j = this.length; i < j; i++) {
                        elem = this[i];

                        if (elem.style) {
                            display = elem.style.display;

                            // Reset the inline display of this element to learn if it is
                            // being hidden by cascaded rules or not
                            if (!jQuery._data(elem, "olddisplay") && display === "none") {
                                display = elem.style.display = "";
                            }

                            // Set elements which have been overridden with display: none
                            // in a stylesheet to whatever the default browser style is
                            // for such an element
                            if ((display === "" && jQuery.css(elem, "display") === "none") ||
                                !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
                                jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                            }
                        }
                    }

                    // Set the display of most of the elements in a second loop
                    // to avoid the constant reflow
                    for (i = 0; i < j; i++) {
                        elem = this[i];

                        if (elem.style) {
                            display = elem.style.display;

                            if (display === "" || display === "none") {
                                elem.style.display = jQuery._data(elem, "olddisplay") || "";
                            }
                        }
                    }

                    return this;
                }
            },

            hide: function(speed, easing, callback) {
                if (speed || speed === 0) {
                    return this.animate(genFx("hide", 3), speed, easing, callback);

                } else {
                    var elem, display,
                        i = 0,
                        j = this.length;

                    for (; i < j; i++) {
                        elem = this[i];
                        if (elem.style) {
                            display = jQuery.css(elem, "display");

                            if (display !== "none" && !jQuery._data(elem, "olddisplay")) {
                                jQuery._data(elem, "olddisplay", display);
                            }
                        }
                    }

                    // Set the display of the elements in a second loop
                    // to avoid the constant reflow
                    for (i = 0; i < j; i++) {
                        if (this[i].style) {
                            this[i].style.display = "none";
                        }
                    }

                    return this;
                }
            },

            // Save the old toggle function
            _toggle: jQuery.fn.toggle,

            toggle: function(fn, fn2, callback) {
                var bool = typeof fn === "boolean";

                if (jQuery.isFunction(fn) && jQuery.isFunction(fn2)) {
                    this._toggle.apply(this, arguments);

                } else if (fn == null || bool) {
                    this.each(function() {
                        var state = bool ? fn : jQuery(this).is(":hidden");
                        jQuery(this)[state ? "show" : "hide"]();
                    });

                } else {
                    this.animate(genFx("toggle", 3), fn, fn2, callback);
                }

                return this;
            },

            fadeTo: function(speed, to, easing, callback) {
                return this.filter(":hidden").css("opacity", 0).show().end()
                    .animate({ opacity: to }, speed, easing, callback);
            },

            animate: function(prop, speed, easing, callback) {
                var optall = jQuery.speed(speed, easing, callback);

                if (jQuery.isEmptyObject(prop)) {
                    return this.each(optall.complete, [false]);
                }

                // Do not change referenced properties as per-property easing will be lost
                prop = jQuery.extend({ }, prop);

                function doAnimation() {
                    // XXX 'this' does not always have a nodeName when running the
                    // test suite

                    if (optall.queue === false) {
                        jQuery._mark(this);
                    }

                    var opt = jQuery.extend({ }, optall),
                        isElement = this.nodeType === 1,
                        hidden = isElement && jQuery(this).is(":hidden"),
                        name, val, p, e, hooks, replace,
                        parts, start, end, unit,
                        method;

                    // will store per property easing and be used to determine when an animation is complete
                    opt.animatedProperties = { };

                    // first pass over propertys to expand / normalize
                    for (p in prop) {
                        name = jQuery.camelCase(p);
                        if (p !== name) {
                            prop[name] = prop[p];
                            delete prop[p];
                        }

                        if ((hooks = jQuery.cssHooks[name]) && "expand" in hooks) {
                            replace = hooks.expand(prop[name]);
                            delete prop[name];

                            // not quite $.extend, this wont overwrite keys already present.
                            // also - reusing 'p' from above because we have the correct "name"
                            for (p in replace) {
                                if (!(p in prop)) {
                                    prop[p] = replace[p];
                                }
                            }
                        }
                    }

                    for (name in prop) {
                        val = prop[name];
                        // easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
                        if (jQuery.isArray(val)) {
                            opt.animatedProperties[name] = val[1];
                            val = prop[name] = val[0];
                        } else {
                            opt.animatedProperties[name] = opt.specialEasing && opt.specialEasing[name] || opt.easing || 'swing';
                        }

                        if (val === "hide" && hidden || val === "show" && !hidden) {
                            return opt.complete.call(this);
                        }

                        if (isElement && (name === "height" || name === "width")) {
                            // Make sure that nothing sneaks out
                            // Record all 3 overflow attributes because IE does not
                            // change the overflow attribute when overflowX and
                            // overflowY are set to the same value
                            opt.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];

                            // Set display property to inline-block for height/width
                            // animations on inline elements that are having width/height animated
                            if (jQuery.css(this, "display") === "inline" &&
                                jQuery.css(this, "float") === "none") {

                                // inline-level elements accept inline-block;
                                // block-level elements need to be inline with layout
                                if (!jQuery.support.inlineBlockNeedsLayout || defaultDisplay(this.nodeName) === "inline") {
                                    this.style.display = "inline-block";

                                } else {
                                    this.style.zoom = 1;
                                }
                            }
                        }
                    }

                    if (opt.overflow != null) {
                        this.style.overflow = "hidden";
                    }

                    for (p in prop) {
                        e = new jQuery.fx(this, opt, p);
                        val = prop[p];

                        if (rfxtypes.test(val)) {

                            // Tracks whether to show or hide based on private
                            // data attached to the element
                            method = jQuery._data(this, "toggle" + p) || (val === "toggle" ? hidden ? "show" : "hide" : 0);
                            if (method) {
                                jQuery._data(this, "toggle" + p, method === "show" ? "hide" : "show");
                                e[method]();
                            } else {
                                e[val]();
                            }

                        } else {
                            parts = rfxnum.exec(val);
                            start = e.cur();

                            if (parts) {
                                end = parseFloat(parts[2]);
                                unit = parts[3] || (jQuery.cssNumber[p] ? "" : "px");

                                // We need to compute starting value
                                if (unit !== "px") {
                                    jQuery.style(this, p, (end || 1) + unit);
                                    start = ((end || 1) / e.cur()) * start;
                                    jQuery.style(this, p, start + unit);
                                }

                                // If a +=/-= token was provided, we're doing a relative animation
                                if (parts[1]) {
                                    end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
                                }

                                e.custom(start, end, unit);

                            } else {
                                e.custom(start, val, "");
                            }
                        }
                    }

                    // For JS strict compliance
                    return true;
                }

                return optall.queue === false ?
                    this.each(doAnimation) :
                    this.queue(optall.queue, doAnimation);
            },

            stop: function(type, clearQueue, gotoEnd) {
                if (typeof type !== "string") {
                    gotoEnd = clearQueue;
                    clearQueue = type;
                    type = undefined;
                }
                if (clearQueue && type !== false) {
                    this.queue(type || "fx", []);
                }

                return this.each(function() {
                    var index,
                        hadTimers = false,
                        timers = jQuery.timers,
                        data = jQuery._data(this);

                    // clear marker counters if we know they won't be
                    if (!gotoEnd) {
                        jQuery._unmark(true, this);
                    }

                    function stopQueue(elem, data, index) {
                        var hooks = data[index];
                        jQuery.removeData(elem, index, true);
                        hooks.stop(gotoEnd);
                    }

                    if (type == null) {
                        for (index in data) {
                            if (data[index] && data[index].stop && index.indexOf(".run") === index.length - 4) {
                                stopQueue(this, data, index);
                            }
                        }
                    } else if (data[index = type + ".run"] && data[index].stop) {
                        stopQueue(this, data, index);
                    }

                    for (index = timers.length; index--;) {
                        if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                            if (gotoEnd) {

                                // force the next step to be the last
                                timers[index](true);
                            } else {
                                timers[index].saveState();
                            }
                            hadTimers = true;
                            timers.splice(index, 1);
                        }
                    }

                    // start the next in the queue if the last step wasn't forced
                    // timers currently will call their complete callbacks, which will dequeue
                    // but only if they were gotoEnd
                    if (!(gotoEnd && hadTimers)) {
                        jQuery.dequeue(this, type);
                    }
                });
            }
        });

        // Animations created synchronously will run synchronously

        function createFxNow() {
            setTimeout(clearFxNow, 0);
            return (fxNow = jQuery.now());
        }

        function clearFxNow() {
            fxNow = undefined;
        }

        // Generate parameters to create a standard animation

        function genFx(type, num) {
            var obj = { };

            jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function() {
                obj[this] = type;
            });

            return obj;
        }

        // Generate shortcuts for custom animations
        jQuery.each({
                slideDown: genFx("show", 1),
                slideUp: genFx("hide", 1),
                slideToggle: genFx("toggle", 1),
                fadeIn: { opacity: "show" },
                fadeOut: { opacity: "hide" },
                fadeToggle: { opacity: "toggle" }
            }, function(name, props) {
                jQuery.fn[name] = function(speed, easing, callback) {
                    return this.animate(props, speed, easing, callback);
                };
            });

        jQuery.extend({
            speed: function(speed, easing, fn) {
                var opt = speed && typeof speed === "object" ? jQuery.extend({ }, speed) : {
                    complete: fn || !fn && easing ||
                    jQuery.isFunction(speed) && speed,
                    duration: speed,
                    easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
                };

                opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
                    opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

                // normalize opt.queue - true/undefined/null -> "fx"
                if (opt.queue == null || opt.queue === true) {
                    opt.queue = "fx";
                }

                // Queueing
                opt.old = opt.complete;

                opt.complete = function(noUnmark) {
                    if (jQuery.isFunction(opt.old)) {
                        opt.old.call(this);
                    }

                    if (opt.queue) {
                        jQuery.dequeue(this, opt.queue);
                    } else if (noUnmark !== false) {
                        jQuery._unmark(this);
                    }
                };

                return opt;
            },

            easing: {
                linear: function(p) {
                    return p;
                },
                swing: function(p) {
                    return (-Math.cos(p * Math.PI) / 2) + 0.5;
                }
            },

            timers: [],

            fx: function(elem, options, prop) {
                this.options = options;
                this.elem = elem;
                this.prop = prop;

                options.orig = options.orig || { };
            }
        });

        jQuery.fx.prototype = {
        // Simple function for setting a style value
            update: function() {
                if (this.options.step) {
                    this.options.step.call(this.elem, this.now, this);
                }

                (jQuery.fx.step[this.prop] || jQuery.fx.step._default)(this);
            },

            // Get the current size
            cur: function() {
                if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
                    return this.elem[this.prop];
                }

                var parsed,
                    r = jQuery.css(this.elem, this.prop);
                // Empty strings, null, undefined and "auto" are converted to 0,
                // complex values such as "rotate(1rad)" are returned as is,
                // simple values such as "10px" are parsed to Float.
                return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed;
            },

            // Start an animation from one number to another
            custom: function(from, to, unit) {
                var self = this,
                    fx = jQuery.fx;

                this.startTime = fxNow || createFxNow();
                this.end = to;
                this.now = this.start = from;
                this.pos = this.state = 0;
                this.unit = unit || this.unit || (jQuery.cssNumber[this.prop] ? "" : "px");

                function t(gotoEnd) {
                    return self.step(gotoEnd);
                }

                t.queue = this.options.queue;
                t.elem = this.elem;
                t.saveState = function() {
                    if (jQuery._data(self.elem, "fxshow" + self.prop) === undefined) {
                        if (self.options.hide) {
                            jQuery._data(self.elem, "fxshow" + self.prop, self.start);
                        } else if (self.options.show) {
                            jQuery._data(self.elem, "fxshow" + self.prop, self.end);
                        }
                    }
                };

                if (t() && jQuery.timers.push(t) && !timerId) {
                    timerId = setInterval(fx.tick, fx.interval);
                }
            },

            // Simple 'show' function
            show: function() {
                var dataShow = jQuery._data(this.elem, "fxshow" + this.prop);

                // Remember where we started, so that we can go back to it later
                this.options.orig[this.prop] = dataShow || jQuery.style(this.elem, this.prop);
                this.options.show = true;

                // Begin the animation
                // Make sure that we start at a small width/height to avoid any flash of content
                if (dataShow !== undefined) {
                    // This show is picking up where a previous hide or show left off
                    this.custom(this.cur(), dataShow);
                } else {
                    this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
                }

                // Start by showing the element
                jQuery(this.elem).show();
            },

            // Simple 'hide' function
            hide: function() {
                // Remember where we started, so that we can go back to it later
                this.options.orig[this.prop] = jQuery._data(this.elem, "fxshow" + this.prop) || jQuery.style(this.elem, this.prop);
                this.options.hide = true;

                // Begin the animation
                this.custom(this.cur(), 0);
            },

            // Each step of an animation
            step: function(gotoEnd) {
                var p, n, complete,
                    t = fxNow || createFxNow(),
                    done = true,
                    elem = this.elem,
                    options = this.options;

                if (gotoEnd || t >= options.duration + this.startTime) {
                    this.now = this.end;
                    this.pos = this.state = 1;
                    this.update();

                    options.animatedProperties[this.prop] = true;

                    for (p in options.animatedProperties) {
                        if (options.animatedProperties[p] !== true) {
                            done = false;
                        }
                    }

                    if (done) {
                        // Reset the overflow
                        if (options.overflow != null && !jQuery.support.shrinkWrapBlocks) {

                            jQuery.each(["", "X", "Y"], function(index, value) {
                                elem.style["overflow" + value] = options.overflow[index];
                            });
                        }

                        // Hide the element if the "hide" operation was done
                        if (options.hide) {
                            jQuery(elem).hide();
                        }

                        // Reset the properties, if the item has been hidden or shown
                        if (options.hide || options.show) {
                            for (p in options.animatedProperties) {
                                jQuery.style(elem, p, options.orig[p]);
                                jQuery.removeData(elem, "fxshow" + p, true);
                                // Toggle data is no longer needed
                                jQuery.removeData(elem, "toggle" + p, true);
                            }
                        }

                        // Execute the complete function
                        // in the event that the complete function throws an exception
                        // we must ensure it won't be called twice. #5684

                        complete = options.complete;
                        if (complete) {

                            options.complete = false;
                            complete.call(elem);
                        }
                    }

                    return false;

                } else {
                    // classical easing cannot be used with an Infinity duration
                    if (options.duration == Infinity) {
                        this.now = t;
                    } else {
                        n = t - this.startTime;
                        this.state = n / options.duration;

                        // Perform the easing function, defaults to swing
                        this.pos = jQuery.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);
                        this.now = this.start + ((this.end - this.start) * this.pos);
                    }
                    // Perform the next step of the animation
                    this.update();
                }

                return true;
            }
        };

        jQuery.extend(jQuery.fx, {
            tick: function() {
                var timer,
                    timers = jQuery.timers,
                    i = 0;

                for (; i < timers.length; i++) {
                    timer = timers[i];
                    // Checks the timer has not already been removed
                    if (!timer() && timers[i] === timer) {
                        timers.splice(i--, 1);
                    }
                }

                if (!timers.length) {
                    jQuery.fx.stop();
                }
            },

            interval: 13,

            stop: function() {
                clearInterval(timerId);
                timerId = null;
            },

            speeds: {
                slow: 600,
                fast: 200,
                // Default speed
                _default: 400
            },

            step: {
                opacity: function(fx) {
                    jQuery.style(fx.elem, "opacity", fx.now);
                },

                _default: function(fx) {
                    if (fx.elem.style && fx.elem.style[fx.prop] != null) {
                        fx.elem.style[fx.prop] = fx.now + fx.unit;
                    } else {
                        fx.elem[fx.prop] = fx.now;
                    }
                }
            }
        });

        // Ensure props that can't be negative don't go there on undershoot easing
        jQuery.each(fxAttrs.concat.apply([], fxAttrs), function(i, prop) {
            // exclude marginTop, marginLeft, marginBottom and marginRight from this list
            if (prop.indexOf("margin")) {
                jQuery.fx.step[prop] = function(fx) {
                    jQuery.style(fx.elem, prop, Math.max(0, fx.now) + fx.unit);
                };
            }
        });

        if (jQuery.expr && jQuery.expr.filters) {
            jQuery.expr.filters.animated = function(elem) {
                return jQuery.grep(jQuery.timers, function(fn) {
                    return elem === fn.elem;
                }).length;
            };
        }

        // Try to restore the default display value of an element

        function defaultDisplay(nodeName) {

            if (!elemdisplay[nodeName]) {

                var body = document.body,
                    elem = jQuery("<" + nodeName + ">").appendTo(body),
                    display = elem.css("display");
                elem.remove();

                // If the simple way fails,
                // get element's real default display by attaching it to a temp iframe
                if (display === "none" || display === "") {
                    // No iframe to use yet, so create it
                    if (!iframe) {
                        iframe = document.createElement("iframe");
                        iframe.frameBorder = iframe.width = iframe.height = 0;
                    }

                    body.appendChild(iframe);

                    // Create a cacheable copy of the iframe document on first call.
                    // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                    // document to it; WebKit & Firefox won't allow reusing the iframe document.
                    if (!iframeDoc || !iframe.createElement) {
                        iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
                        iframeDoc.write((jQuery.support.boxModel ? "<!doctype html>" : "") + "<html><body>");
                        iframeDoc.close();
                    }

                    elem = iframeDoc.createElement(nodeName);

                    iframeDoc.body.appendChild(elem);

                    display = jQuery.css(elem, "display");
                    body.removeChild(iframe);
                }

                // Store the correct default display
                elemdisplay[nodeName] = display;
            }

            return elemdisplay[nodeName];
        }


        var getOffset,
            rtable = /^t(?:able|d|h)$/i ,
            rroot = /^(?:body|html)$/i ;

        if ("getBoundingClientRect" in document.documentElement) {
            getOffset = function(elem, doc, docElem, box) {
                try {
                    box = elem.getBoundingClientRect();
                } catch(e) {
                }

                // Make sure we're not dealing with a disconnected DOM node
                if (!box || !jQuery.contains(docElem, elem)) {
                    return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
                }

                var body = doc.body,
                    win = getWindow(doc),
                    clientTop = docElem.clientTop || body.clientTop || 0,
                    clientLeft = docElem.clientLeft || body.clientLeft || 0,
                    scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop,
                    scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
                    top = box.top + scrollTop - clientTop,
                    left = box.left + scrollLeft - clientLeft;

                return { top: top, left: left };
            };

        } else {
            getOffset = function(elem, doc, docElem) {
                var computedStyle,
                    offsetParent = elem.offsetParent,
                    prevOffsetParent = elem,
                    body = doc.body,
                    defaultView = doc.defaultView,
                    prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle,
                    top = elem.offsetTop,
                    left = elem.offsetLeft;

                while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
                    if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
                        break;
                    }

                    computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                    top -= elem.scrollTop;
                    left -= elem.scrollLeft;

                    if (elem === offsetParent) {
                        top += elem.offsetTop;
                        left += elem.offsetLeft;

                        if (jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName))) {
                            top += parseFloat(computedStyle.borderTopWidth) || 0;
                            left += parseFloat(computedStyle.borderLeftWidth) || 0;
                        }

                        prevOffsetParent = offsetParent;
                        offsetParent = elem.offsetParent;
                    }

                    if (jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
                        top += parseFloat(computedStyle.borderTopWidth) || 0;
                        left += parseFloat(computedStyle.borderLeftWidth) || 0;
                    }

                    prevComputedStyle = computedStyle;
                }

                if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
                    top += body.offsetTop;
                    left += body.offsetLeft;
                }

                if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
                    top += Math.max(docElem.scrollTop, body.scrollTop);
                    left += Math.max(docElem.scrollLeft, body.scrollLeft);
                }

                return { top: top, left: left };
            };
        }

        jQuery.fn.offset = function(options) {
            if (arguments.length) {
                return options === undefined ?
                    this :
                    this.each(function(i) {
                        jQuery.offset.setOffset(this, options, i);
                    });
            }

            var elem = this[0],
                doc = elem && elem.ownerDocument;

            if (!doc) {
                return null;
            }

            if (elem === doc.body) {
                return jQuery.offset.bodyOffset(elem);
            }

            return getOffset(elem, doc, doc.documentElement);
        };

        jQuery.offset = {
            bodyOffset: function(body) {
                var top = body.offsetTop,
                    left = body.offsetLeft;

                if (jQuery.support.doesNotIncludeMarginInBodyOffset) {
                    top += parseFloat(jQuery.css(body, "marginTop")) || 0;
                    left += parseFloat(jQuery.css(body, "marginLeft")) || 0;
                }

                return { top: top, left: left };
            },

            setOffset: function(elem, options, i) {
                var position = jQuery.css(elem, "position");

                // set position first, in-case top/left are set even on static elem
                if (position === "static") {
                    elem.style.position = "relative";
                }

                var curElem = jQuery(elem),
                    curOffset = curElem.offset(),
                    curCSSTop = jQuery.css(elem, "top"),
                    curCSSLeft = jQuery.css(elem, "left"),
                    calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
                    props = { }, curPosition = { }, curTop, curLeft;

                // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
                if (calculatePosition) {
                    curPosition = curElem.position();
                    curTop = curPosition.top;
                    curLeft = curPosition.left;
                } else {
                    curTop = parseFloat(curCSSTop) || 0;
                    curLeft = parseFloat(curCSSLeft) || 0;
                }

                if (jQuery.isFunction(options)) {
                    options = options.call(elem, i, curOffset);
                }

                if (options.top != null) {
                    props.top = (options.top - curOffset.top) + curTop;
                }
                if (options.left != null) {
                    props.left = (options.left - curOffset.left) + curLeft;
                }

                if ("using" in options) {
                    options.using.call(elem, props);
                } else {
                    curElem.css(props);
                }
            }
        };


        jQuery.fn.extend({
            position: function() {
                if (!this[0]) {
                    return null;
                }

                var elem = this[0],
                    // Get *real* offsetParent
                    offsetParent = this.offsetParent(),
                    // Get correct offsets
                    offset = this.offset(),
                    parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

                // Subtract element margins
                // note: when an element has margin: auto the offsetLeft and marginLeft
                // are the same in Safari causing offset.left to incorrectly be 0
                offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
                offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;

                // Add offsetParent borders
                parentOffset.top += parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0;
                parentOffset.left += parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0;

                // Subtract the two offsets
                return {
                    top: offset.top - parentOffset.top,
                    left: offset.left - parentOffset.left
                };
            },

            offsetParent: function() {
                return this.map(function() {
                    var offsetParent = this.offsetParent || document.body;
                    while (offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static")) {
                        offsetParent = offsetParent.offsetParent;
                    }
                    return offsetParent;
                });
            }
        });


        // Create scrollLeft and scrollTop methods
        jQuery.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(method, prop) {
            var top = /Y/ .test(prop);

            jQuery.fn[method] = function(val) {
                return jQuery.access(this, function(elem, method, val) {
                    var win = getWindow(elem);

                    if (val === undefined) {
                        return win ? (prop in win) ? win[prop] :
                            jQuery.support.boxModel && win.document.documentElement[method] ||
                                win.document.body[method] :
                            elem[method];
                    }

                    if (win) {
                        win.scrollTo(
                            !top ? val : jQuery(win).scrollLeft(),
                            top ? val : jQuery(win).scrollTop()
                        );

                    } else {
                        elem[method] = val;
                    }
                }, method, val, arguments.length, null);
            };
        });

        function getWindow(elem) {
            return jQuery.isWindow(elem) ?
                elem :
                elem.nodeType === 9 ?
                    elem.defaultView || elem.parentWindow :
                    false;
        }


        // Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
        jQuery.each({ Height: "height", Width: "width" }, function(name, type) {
            var clientProp = "client" + name,
                scrollProp = "scroll" + name,
                offsetProp = "offset" + name;

            // innerHeight and innerWidth
            jQuery.fn["inner" + name] = function() {
                var elem = this[0];
                return elem ?
                    elem.style ?
                        parseFloat(jQuery.css(elem, type, "padding")) :
                        this[type]() :
                    null;
            };

            // outerHeight and outerWidth
            jQuery.fn["outer" + name] = function(margin) {
                var elem = this[0];
                return elem ?
                    elem.style ?
                        parseFloat(jQuery.css(elem, type, margin ? "margin" : "border")) :
                        this[type]() :
                    null;
            };

            jQuery.fn[type] = function(value) {
                return jQuery.access(this, function(elem, type, value) {
                    var doc, docElemProp, orig, ret;

                    if (jQuery.isWindow(elem)) {
                        // 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
                        doc = elem.document;
                        docElemProp = doc.documentElement[clientProp];
                        return jQuery.support.boxModel && docElemProp ||
                            doc.body && doc.body[clientProp] || docElemProp;
                    }

                    // Get document width or height
                    if (elem.nodeType === 9) {
                        // Either scroll[Width/Height] or offset[Width/Height], whichever is greater
                        doc = elem.documentElement;

                        // when a window > document, IE6 reports a offset[Width/Height] > client[Width/Height]
                        // so we can't use max, as it'll choose the incorrect offset[Width/Height]
                        // instead we use the correct client[Width/Height]
                        // support:IE6
                        if (doc[clientProp] >= doc[scrollProp]) {
                            return doc[clientProp];
                        }

                        return Math.max(
                            elem.body[scrollProp], doc[scrollProp],
                            elem.body[offsetProp], doc[offsetProp]
                        );
                    }

                    // Get width or height on the element
                    if (value === undefined) {
                        orig = jQuery.css(elem, type);
                        ret = parseFloat(orig);
                        return jQuery.isNumeric(ret) ? ret : orig;
                    }

                    // Set the width or height on the element
                    jQuery(elem).css(type, value);
                }, type, value, arguments.length, null);
            };
        });


        // Expose jQuery to the global object
        window.jQuery = window.$ = jQuery;

        // Expose jQuery as an AMD module, but only for AMD loaders that
        // understand the issues with loading multiple versions of jQuery
        // in a page that all might call define(). The loader will indicate
        // they have special allowances for multiple jQuery versions by
        // specifying define.amd.jQuery = true. Register as a named module,
        // since jQuery can be concatenated with other files that may use define,
        // but not use a proper concatenation script that understands anonymous
        // AMD modules. A named AMD is safest and most robust way to register.
        // Lowercase jquery is used because AMD module names are derived from
        // file names, and jQuery is normally delivered in a lowercase file name.
        // Do this after creating the global so that if an AMD module wants to call
        // noConflict to hide this version of jQuery, it will work.
        if (typeof define === "function" && define.amd && define.amd.jQuery) {
            define("jquery", [], function() { return jQuery; });
        }


    })(window);
}/*
jQuery UI.
Modified by ATDW.

DO NOT OVERRIDE THIS WITH THE LATEST JQUERY UI WITHOUT MERGING OUR CHANGES IN.
This is because not all of our changes have been contributed to the jQuery UI project (some of them are ATDW specific).

Mark ATDW modifications with a comment that includes the string "ATDW".
eg. // ATDW modification - consistent calendar display across months of varied lengths

*/

/*!
* jQuery UI 1.8.22
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* This file has been modified by ATDW prior to minification.
*
* http://docs.jquery.com/UI
*/
(function ($, undefined) {

    // prevent duplicate loading
    // this is only a problem because we proxy existing functions
    // and we don't want to double proxy them
    $.ui = $.ui || {};
    // ATDW modification - require minimum jQuery UI version of 1.8
    if ($.ui.version && parseFloat($.ui.version) >= 1.8) {
        return;
    }

    $.extend($.ui, {
        version: "1.8.22",

        keyCode: {
            ALT: 18,
            BACKSPACE: 8,
            CAPS_LOCK: 20,
            COMMA: 188,
            COMMAND: 91,
            COMMAND_LEFT: 91, // COMMAND
            COMMAND_RIGHT: 93,
            CONTROL: 17,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            INSERT: 45,
            LEFT: 37,
            MENU: 93, // COMMAND_RIGHT
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            WINDOWS: 91 // COMMAND
        }
    });

    // plugins
    $.fn.extend({
        propAttr: $.fn.prop || $.fn.attr,

        _focus: $.fn.focus,
        focus: function (delay, fn) {
            return typeof delay === "number" ?
			this.each(function () {
			    var elem = this;
			    setTimeout(function () {
			        $(elem).focus();
			        if (fn) {
			            fn.call(elem);
			        }
			    }, delay);
			}) :
			this._focus.apply(this, arguments);
        },

        scrollParent: function () {
            var scrollParent;
            if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
                scrollParent = this.parents().filter(function () {
                    return (/(relative|absolute|fixed)/).test($.curCSS(this, 'position', 1)) && (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
                }).eq(0);
            } else {
                scrollParent = this.parents().filter(function () {
                    return (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
                }).eq(0);
            }

            return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
        },

        zIndex: function (zIndex) {
            if (zIndex !== undefined) {
                return this.css("zIndex", zIndex);
            }

            if (this.length) {
                var elem = $(this[0]), position, value;
                while (elem.length && elem[0] !== document) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser
                    // This makes behavior of this function consistent across browsers
                    // WebKit always returns auto if the element is positioned
                    position = elem.css("position");
                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        // IE returns 0 when zIndex is not specified
                        // other browsers return a string
                        // we ignore the case of nested elements with an explicit value of 0
                        // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt(elem.css("zIndex"), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }

            return 0;
        },

        disableSelection: function () {
            return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
			".ui-disableSelection", function (event) {
			    event.preventDefault();
			});
        },

        enableSelection: function () {
            return this.unbind(".ui-disableSelection");
        }
    });

    // support: jQuery <1.8
    if (!$("<a>").outerWidth(1).jquery) {
        $.each(["Width", "Height"], function (i, name) {
            var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
			type = name.toLowerCase(),
			orig = {
			    innerWidth: $.fn.innerWidth,
			    innerHeight: $.fn.innerHeight,
			    outerWidth: $.fn.outerWidth,
			    outerHeight: $.fn.outerHeight
			};

            function reduce(elem, size, border, margin) {
                $.each(side, function () {
                    size -= parseFloat($.curCSS(elem, "padding" + this, true)) || 0;
                    if (border) {
                        size -= parseFloat($.curCSS(elem, "border" + this + "Width", true)) || 0;
                    }
                    if (margin) {
                        size -= parseFloat($.curCSS(elem, "margin" + this, true)) || 0;
                    }
                });
                return size;
            }

            $.fn["inner" + name] = function (size) {
                if (size === undefined) {
                    return orig["inner" + name].call(this);
                }

                return this.each(function () {
                    $(this).css(type, reduce(this, size) + "px");
                });
            };

            $.fn["outer" + name] = function (size, margin) {
                if (typeof size !== "number") {
                    return orig["outer" + name].call(this, size);
                }

                return this.each(function () {
                    $(this).css(type, reduce(this, size, true, margin) + "px");
                });
            };
        });
    }

    // selectors
    function focusable(element, isTabIndexNotNaN) {
        var nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            var map = element.parentNode,
			mapName = map.name,
			img;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName)
		? !element.disabled
		: "a" == nodeName
			? element.href || isTabIndexNotNaN
			: isTabIndexNotNaN)
        // the element and all of its ancestors must be visible
		&& visible(element);
    }

    function visible(element) {
        return !$(element).parents().andSelf().filter(function () {
            return $.curCSS(this, "visibility") === "hidden" ||
			$.expr.filters.hidden(this);
        }).length;
    }

    $.extend($.expr[":"], {
        data: $.expr.createPseudo ?
		$.expr.createPseudo(function (dataName) {
		    return function (elem) {
		        return !!$.data(elem, dataName);
		    };
		}) :
        // support: jQuery <1.8
		function (elem, i, match) {
		    return !!$.data(elem, match[3]);
		},

        focusable: function (element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },

        tabbable: function (element) {
            var tabIndex = $.attr(element, "tabindex"),
			isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });

    // support
    $(function () {
        var body = document.body,
		div = body.appendChild(div = document.createElement("div"));

        // access offsetHeight before setting the style to prevent a layout bug
        // in IE 9 which causes the elemnt to continue to take up space even
        // after it is removed from the DOM (#8026)
        div.offsetHeight;

        $.extend(div.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        });

        $.support.minHeight = div.offsetHeight === 100;
        $.support.selectstart = "onselectstart" in div;

        // set display to none to avoid a layout bug in IE
        // http://dev.jquery.com/ticket/4014
        body.removeChild(div).style.display = "none";
    });

    // jQuery <1.4.3 uses curCSS, in 1.4.3 - 1.7.2 curCSS = css, 1.8+ only has css
    if (!$.curCSS) {
        $.curCSS = $.css;
    }





    // deprecated
    $.extend($.ui, {
        // $.ui.plugin is deprecated.  Use the proxy pattern instead.
        plugin: {
            add: function (module, option, set) {
                var proto = $.ui[module].prototype;
                for (var i in set) {
                    proto.plugins[i] = proto.plugins[i] || [];
                    proto.plugins[i].push([option, set[i]]);
                }
            },
            call: function (instance, name, args) {
                var set = instance.plugins[name];
                if (!set || !instance.element[0].parentNode) {
                    return;
                }

                for (var i = 0; i < set.length; i++) {
                    if (instance.options[set[i][0]]) {
                        set[i][1].apply(instance.element, args);
                    }
                }
            }
        },

        // will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
        contains: function (a, b) {
            return document.compareDocumentPosition ?
			a.compareDocumentPosition(b) & 16 :
			a !== b && a.contains(b);
        },

        // only used by resizable
        hasScroll: function (el, a) {

            //If overflow is hidden, the element might have extra content, but the user wants to hide it
            if ($(el).css("overflow") === "hidden") {
                return false;
            }

            var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop",
			has = false;

            if (el[scroll] > 0) {
                return true;
            }

            // TODO: determine which cases actually cause this to happen
            // if the element doesn't have the scroll set, see if it's possible to
            // set the scroll
            el[scroll] = 1;
            has = (el[scroll] > 0);
            el[scroll] = 0;
            return has;
        },

        // these are odd functions, fix the API or move into individual plugins
        isOverAxis: function (x, reference, size) {
            //Determines when x coordinate is over "b" element axis
            return (x > reference) && (x < (reference + size));
        },
        isOver: function (y, x, top, left, height, width) {
            //Determines when x, y coordinates is over "b" element
            return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
        }
    });

})(jQuery);
/*!
* jQuery UI Widget 1.8.22
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Widget
*/
(function ($, undefined) {

    // jQuery 1.4+
    if ($.cleanData) {
        var _cleanData = $.cleanData;
        $.cleanData = function (elems) {
            for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                try {
                    $(elem).triggerHandler("remove");
                    // http://bugs.jquery.com/ticket/8235
                } catch (e) { }
            }
            _cleanData(elems);
        };
    } else {
        var _remove = $.fn.remove;
        $.fn.remove = function (selector, keepData) {
            return this.each(function () {
                if (!keepData) {
                    if (!selector || $.filter(selector, [this]).length) {
                        $("*", this).add([this]).each(function () {
                            try {
                                $(this).triggerHandler("remove");
                                // http://bugs.jquery.com/ticket/8235
                            } catch (e) { }
                        });
                    }
                }
                return _remove.call($(this), selector, keepData);
            });
        };
    }

    $.widget = function (name, base, prototype) {
        var namespace = name.split(".")[0],
		fullName;
        name = name.split(".")[1];
        fullName = namespace + "-" + name;

        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }

        // create selector for plugin
        $.expr[":"][fullName] = function (elem) {
            return !!$.data(elem, name);
        };

        $[namespace] = $[namespace] || {};
        $[namespace][name] = function (options, element) {
            // allow instantiation without initializing for simple inheritance
            if (arguments.length) {
                this._createWidget(options, element);
            }
        };

        var basePrototype = new base();
        // we need to make the options hash a property directly on the new instance
        // otherwise we'll modify the options hash on the prototype that we're
        // inheriting from
        //	$.each( basePrototype, function( key, val ) {
        //		if ( $.isPlainObject(val) ) {
        //			basePrototype[ key ] = $.extend( {}, val );
        //		}
        //	});
        basePrototype.options = $.extend(true, {}, basePrototype.options);
        $[namespace][name].prototype = $.extend(true, basePrototype, {
            namespace: namespace,
            widgetName: name,
            widgetEventPrefix: $[namespace][name].prototype.widgetEventPrefix || name,
            widgetBaseClass: fullName
        }, prototype);

        $.widget.bridge(name, $[namespace][name]);
    };

    $.widget.bridge = function (name, object) {
        $.fn[name] = function (options) {
            var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call(arguments, 1),
			returnValue = this;

            // allow multiple hashes to be passed on init
            options = !isMethodCall && args.length ?
			$.extend.apply(null, [true, options].concat(args)) :
			options;

            // prevent calls to internal methods
            if (isMethodCall && options.charAt(0) === "_") {
                return returnValue;
            }

            if (isMethodCall) {
                this.each(function () {
                    var instance = $.data(this, name),
					methodValue = instance && $.isFunction(instance[options]) ?
						instance[options].apply(instance, args) :
						instance;
                    // TODO: add this back in 1.9 and use $.error() (see #5972)
                    //				if ( !instance ) {
                    //					throw "cannot call methods on " + name + " prior to initialization; " +
                    //						"attempted to call method '" + options + "'";
                    //				}
                    //				if ( !$.isFunction( instance[options] ) ) {
                    //					throw "no such method '" + options + "' for " + name + " widget instance";
                    //				}
                    //				var methodValue = instance[ options ].apply( instance, args );
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function () {
                    var instance = $.data(this, name);
                    if (instance) {
                        instance.option(options || {})._init();
                    } else {
                        $.data(this, name, new object(options, this));
                    }
                });
            }

            return returnValue;
        };
    };

    $.Widget = function (options, element) {
        // allow instantiation without initializing for simple inheritance
        if (arguments.length) {
            this._createWidget(options, element);
        }
    };

    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        options: {
            disabled: false
        },
        _createWidget: function (options, element) {
            // $.widget.bridge stores the plugin instance, but we do it anyway
            // so that it's stored even before the _create function runs
            $.data(element, this.widgetName, this);
            this.element = $(element);
            this.options = $.extend(true, {},
			this.options,
			this._getCreateOptions(),
			options);

            var self = this;
            this.element.bind("remove." + this.widgetName, function () {
                self.destroy();
            });

            this._create();
            this._trigger("create");
            this._init();
        },
        _getCreateOptions: function () {
            return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
        },
        _create: function () { },
        _init: function () { },

        destroy: function () {
            this.element
			.unbind("." + this.widgetName)
			.removeData(this.widgetName);
            this.widget()
			.unbind("." + this.widgetName)
			.removeAttr("aria-disabled")
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled");
        },

        widget: function () {
            return this.element;
        },

        option: function (key, value) {
            var options = key;

            if (arguments.length === 0) {
                // don't return a reference to the internal hash
                return $.extend({}, this.options);
            }

            if (typeof key === "string") {
                if (value === undefined) {
                    return this.options[key];
                }
                options = {};
                options[key] = value;
            }

            this._setOptions(options);

            return this;
        },
        _setOptions: function (options) {
            var self = this;
            $.each(options, function (key, value) {
                self._setOption(key, value);
            });

            return this;
        },
        _setOption: function (key, value) {
            this.options[key] = value;

            if (key === "disabled") {
                this.widget()
				[value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled")
				.attr("aria-disabled", value);
            }

            return this;
        },

        enable: function () {
            return this._setOption("disabled", false);
        },
        disable: function () {
            return this._setOption("disabled", true);
        },

        _trigger: function (type, event, data) {
            var prop, orig,
			callback = this.options[type];

            data = data || {};
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type).toLowerCase();
            // the original event may come from any element
            // so we need to reset the target on the new event
            event.target = this.element[0];

            // copy original event properties over to the new event
            orig = event.originalEvent;
            if (orig) {
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }

            this.element.trigger(event, data);

            return !($.isFunction(callback) &&
			callback.call(this.element[0], event, data) === false ||
			event.isDefaultPrevented());
        }
    };

})(jQuery);
/*!
* jQuery UI Position 1.8.22
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Position
*/
(function ($, undefined) {

    $.ui = $.ui || {};

    var horizontalPositions = /left|center|right/,
	verticalPositions = /top|center|bottom/,
	center = "center",
	support = {},
	_position = $.fn.position,
	_offset = $.fn.offset;

    $.fn.position = function (options) {
        if (!options || !options.of) {
            return _position.apply(this, arguments);
        }

        // make a copy, we don't want to modify arguments
        options = $.extend({}, options);

        var target = $(options.of),
		targetElem = target[0],
		collision = (options.collision || "flip").split(" "),
		offset = options.offset ? options.offset.split(" ") : [0, 0],
		targetWidth,
		targetHeight,
		basePosition;

        if (targetElem.nodeType === 9) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = { top: 0, left: 0 };
            // TODO: use $.isWindow() in 1.9
        } else if (targetElem.setTimeout) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
        } else if (targetElem.preventDefault) {
            // force left top to allow flipping
            options.at = "left top";
            targetWidth = targetHeight = 0;
            basePosition = { top: options.of.pageY, left: options.of.pageX };
        } else {
            targetWidth = target.outerWidth();
            targetHeight = target.outerHeight();
            basePosition = target.offset();
        }

        // force my and at to have valid horizontal and veritcal positions
        // if a value is missing or invalid, it will be converted to center 
        $.each(["my", "at"], function () {
            var pos = (options[this] || "").split(" ");
            if (pos.length === 1) {
                pos = horizontalPositions.test(pos[0]) ?
				pos.concat([center]) :
				verticalPositions.test(pos[0]) ?
					[center].concat(pos) :
					[center, center];
            }
            pos[0] = horizontalPositions.test(pos[0]) ? pos[0] : center;
            pos[1] = verticalPositions.test(pos[1]) ? pos[1] : center;
            options[this] = pos;
        });

        // normalize collision option
        if (collision.length === 1) {
            collision[1] = collision[0];
        }

        // normalize offset option
        offset[0] = parseInt(offset[0], 10) || 0;
        if (offset.length === 1) {
            offset[1] = offset[0];
        }
        offset[1] = parseInt(offset[1], 10) || 0;

        if (options.at[0] === "right") {
            basePosition.left += targetWidth;
        } else if (options.at[0] === center) {
            basePosition.left += targetWidth / 2;
        }

        if (options.at[1] === "bottom") {
            basePosition.top += targetHeight;
        } else if (options.at[1] === center) {
            basePosition.top += targetHeight / 2;
        }

        basePosition.left += offset[0];
        basePosition.top += offset[1];

        return this.each(function () {
            var elem = $(this),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseInt($.curCSS(this, "marginLeft", true)) || 0,
			marginTop = parseInt($.curCSS(this, "marginTop", true)) || 0,
			collisionWidth = elemWidth + marginLeft +
				(parseInt($.curCSS(this, "marginRight", true)) || 0),
			collisionHeight = elemHeight + marginTop +
				(parseInt($.curCSS(this, "marginBottom", true)) || 0),
			position = $.extend({}, basePosition),
			collisionPosition;

            if (options.my[0] === "right") {
                position.left -= elemWidth;
            } else if (options.my[0] === center) {
                position.left -= elemWidth / 2;
            }

            if (options.my[1] === "bottom") {
                position.top -= elemHeight;
            } else if (options.my[1] === center) {
                position.top -= elemHeight / 2;
            }

            // prevent fractions if jQuery version doesn't support them (see #5280)
            if (!support.fractions) {
                position.left = Math.round(position.left);
                position.top = Math.round(position.top);
            }

            collisionPosition = {
                left: position.left - marginLeft,
                top: position.top - marginTop
            };

            $.each(["left", "top"], function (i, dir) {
                if ($.ui.position[collision[i]]) {
                    $.ui.position[collision[i]][dir](position, {
                        targetWidth: targetWidth,
                        targetHeight: targetHeight,
                        elemWidth: elemWidth,
                        elemHeight: elemHeight,
                        collisionPosition: collisionPosition,
                        collisionWidth: collisionWidth,
                        collisionHeight: collisionHeight,
                        offset: offset,
                        my: options.my,
                        at: options.at
                    });
                }
            });

            if ($.fn.bgiframe) {
                elem.bgiframe();
            }
            elem.offset($.extend(position, { using: options.using }));
        });
    };

    $.ui.position = {
        fit: {
            left: function (position, data) {
                var win = $(window),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft();
                position.left = over > 0 ? position.left - over : Math.max(position.left - data.collisionPosition.left, position.left);
            },
            top: function (position, data) {
                var win = $(window),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop();
                position.top = over > 0 ? position.top - over : Math.max(position.top - data.collisionPosition.top, position.top);
            }
        },

        flip: {
            left: function (position, data) {
                if (data.at[0] === center) {
                    return;
                }
                var win = $(window),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft(),
				myOffset = data.my[0] === "left" ?
					-data.elemWidth :
					data.my[0] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[0] === "left" ?
					data.targetWidth :
					-data.targetWidth,
				offset = -2 * data.offset[0];
                position.left += data.collisionPosition.left < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
            },
            top: function (position, data) {
                if (data.at[1] === center) {
                    return;
                }
                var win = $(window),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop(),
				myOffset = data.my[1] === "top" ?
					-data.elemHeight :
					data.my[1] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[1] === "top" ?
					data.targetHeight :
					-data.targetHeight,
				offset = -2 * data.offset[1];
                position.top += data.collisionPosition.top < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
            }
        }
    };

    // offset setter from jQuery 1.4
    if (!$.offset.setOffset) {
        $.offset.setOffset = function (elem, options) {
            // set position first, in-case top/left are set even on static elem
            if (/static/.test($.curCSS(elem, "position"))) {
                elem.style.position = "relative";
            }
            var curElem = $(elem),
			curOffset = curElem.offset(),
			curTop = parseInt($.curCSS(elem, "top", true), 10) || 0,
			curLeft = parseInt($.curCSS(elem, "left", true), 10) || 0,
			props = {
			    top: (options.top - curOffset.top) + curTop,
			    left: (options.left - curOffset.left) + curLeft
			};

            if ('using' in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        };

        $.fn.offset = function (options) {
            var elem = this[0];
            if (!elem || !elem.ownerDocument) { return null; }
            if (options) {
                if ($.isFunction(options)) {
                    return this.each(function (i) {
                        $(this).offset(options.call(this, i, $(this).offset()));
                    });
                }
                return this.each(function () {
                    $.offset.setOffset(this, options);
                });
            }
            return _offset.call(this);
        };
    }

    // fraction support test (older versions of jQuery don't support fractions)
    (function () {
        var body = document.getElementsByTagName("body")[0],
		div = document.createElement("div"),
		testElement, testElementParent, testElementStyle, offset, offsetTotal;

        //Create a "fake body" for testing based on method used in jQuery.support
        testElement = document.createElement(body ? "div" : "body");
        testElementStyle = {
            visibility: "hidden",
            width: 0,
            height: 0,
            border: 0,
            margin: 0,
            background: "none"
        };
        if (body) {
            $.extend(testElementStyle, {
                position: "absolute",
                left: "-1000px",
                top: "-1000px"
            });
        }
        for (var i in testElementStyle) {
            testElement.style[i] = testElementStyle[i];
        }
        testElement.appendChild(div);
        testElementParent = body || document.documentElement;
        testElementParent.insertBefore(testElement, testElementParent.firstChild);

        div.style.cssText = "position: absolute; left: 10.7432222px; top: 10.432325px; height: 30px; width: 201px;";

        offset = $(div).offset(function (_, offset) {
            return offset;
        }).offset();

        testElement.innerHTML = "";
        testElementParent.removeChild(testElement);

        offsetTotal = offset.top + offset.left + (body ? 2000 : 0);
        support.fractions = offsetTotal > 21 && offsetTotal < 22;
    })();

} (jQuery));
/*!
* jQuery UI Autocomplete 1.8.22
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Autocomplete
*
* Depends:
*	jquery.ui.core.js
*	jquery.ui.widget.js
*	jquery.ui.position.js
*/
(function ($, undefined) {

    // used to prevent race conditions with remote data sources
    var requestIndex = 0;

    $.widget("ui.autocomplete", {
        options: {
            appendTo: "body",
            autoFocus: false,
            delay: 300,
            minLength: 1,
            position: {
                my: "left top",
                at: "left bottom",
                collision: "none"
            },
            source: null
        },

        pending: 0,

        _create: function () {
            var self = this,
			doc = this.element[0].ownerDocument,
			suppressKeyPress;
            this.isMultiLine = this.element.is("textarea");

            this.element
			.addClass("ui-autocomplete-input")
			.attr("autocomplete", "off")
            // TODO verify these actually work as intended
			.attr({
			    role: "textbox",
			    "aria-autocomplete": "list",
			    "aria-haspopup": "true"
			})
			.bind("keydown.autocomplete", function (event) {
			    if (self.options.disabled || self.element.propAttr("readOnly")) {
			        return;
			    }

			    suppressKeyPress = false;
			    var keyCode = $.ui.keyCode;
			    switch (event.keyCode) {
			        case keyCode.PAGE_UP:
			            self._move("previousPage", event);
			            break;
			        case keyCode.PAGE_DOWN:
			            self._move("nextPage", event);
			            break;
			        case keyCode.UP:
			            self._keyEvent("previous", event);
			            break;
			        case keyCode.DOWN:
			            self._keyEvent("next", event);
			            break;
			        case keyCode.ENTER:
			        case keyCode.NUMPAD_ENTER:
			            // when menu is open and has focus
			            if (self.menu.active) {
			                // #6055 - Opera still allows the keypress to occur
			                // which causes forms to submit
			                suppressKeyPress = true;
			                event.preventDefault();
			            }
			            //passthrough - ENTER and TAB both select the current element
			        case keyCode.TAB:
			            if (!self.menu.active) {
			                return;
			            }
			            self.menu.select(event);
			            break;
			        case keyCode.ESCAPE:
			            self.element.val(self.term);
			            self.close(event);
			            break;
			        default:
			            // keypress is triggered before the input value is changed
			            clearTimeout(self.searching);
			            self.searching = setTimeout(function () {
			                // only search if the value has changed
			                if (self.term != self.element.val()) {
			                    self.selectedItem = null;
			                    self.search(null, event);
			                }
			            }, self.options.delay);
			            break;
			    }
			})
			.bind("keypress.autocomplete", function (event) {
			    if (suppressKeyPress) {
			        suppressKeyPress = false;
			        event.preventDefault();
			    }
			})
			.bind("focus.autocomplete", function () {
			    if (self.options.disabled) {
			        return;
			    }

			    self.selectedItem = null;
			    self.previous = self.element.val();
			})
			.bind("blur.autocomplete", function (event) {
			    if (self.options.disabled) {
			        return;
			    }

			    clearTimeout(self.searching);
			    // clicks on the menu (or a button to trigger a search) will cause a blur event
			    self.closing = setTimeout(function () {
			        self.close(event);
			        self._change(event);
			    }, 150);
			});
            this._initSource();
            this.menu = $("<ul></ul>")
			.addClass("ui-autocomplete")
			.appendTo($(this.options.appendTo || "body", doc)[0])
            // prevent the close-on-blur in case of a "slow" click on the menu (long mousedown)
			.mousedown(function (event) {
			    // clicking on the scrollbar causes focus to shift to the body
			    // but we can't detect a mouseup or a click immediately afterward
			    // so we have to track the next mousedown and close the menu if
			    // the user clicks somewhere outside of the autocomplete
			    var menuElement = self.menu.element[0];
			    if (!$(event.target).closest(".ui-menu-item").length) {
			        setTimeout(function () {
			            $(document).one('mousedown', function (event) {
			                if (event.target !== self.element[0] &&
								event.target !== menuElement &&
								!$.ui.contains(menuElement, event.target)) {
			                    self.close();
			                }
			            });
			        }, 1);
			    }

			    // use another timeout to make sure the blur-event-handler on the input was already triggered
			    setTimeout(function () {
			        clearTimeout(self.closing);
			    }, 13);
			})
			.menu({
			    focus: function (event, ui) {
			        var item = ui.item.data("item.autocomplete");
			        if (false !== self._trigger("focus", event, { item: item })) {
			            // use value to match what will end up in the input, if it was a key event
			            if (/^key/.test(event.originalEvent.type)) {
			                self.element.val(item.value);
			            }
			        }
			    },
			    selected: function (event, ui) {
			        var item = ui.item.data("item.autocomplete"),
						previous = self.previous;

			        // only trigger when focus was lost (click on menu)
			        if (self.element[0] !== doc.activeElement) {
			            self.element.focus();
			            self.previous = previous;
			            // #6109 - IE triggers two focus events and the second
			            // is asynchronous, so we need to reset the previous
			            // term synchronously and asynchronously :-(
			            setTimeout(function () {
			                self.previous = previous;
			                self.selectedItem = item;
			            }, 1);
			        }

			        if (false !== self._trigger("select", event, { item: item })) {
                        // set the value of the input to the item label (to display)
			            self.element.val(item.label);
                        // set the value of data-value attribute to item value (for search)
			            self.element.data('value', item.value);
			        }
			        // reset the term after the select event
			        // this allows custom select handling to work properly
			        self.term = self.element.val();

			        self.close(event);
			        self.selectedItem = item;
			    },
			    blur: function (event, ui) {
			        // don't set the value of the text field if it's already correct
			        // this prevents moving the cursor unnecessarily
			        if (self.menu.element.is(":visible") &&
						(self.element.val() !== self.term)) {
			            self.element.val(self.term);
			        }
			    }
			})
			.zIndex(this.element.zIndex() + 1)
            // workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
			.css({ top: 0, left: 0 })
			.hide()
			.data("menu");
            if ($.fn.bgiframe) {
                this.menu.element.bgiframe();
            }
            // turning off autocomplete prevents the browser from remembering the
            // value when navigating through history, so we re-enable autocomplete
            // if the page is unloaded before the widget is destroyed. #7790
            self.beforeunloadHandler = function () {
                self.element.removeAttr("autocomplete");
            };
            $(window).bind("beforeunload", self.beforeunloadHandler);
        },

        destroy: function () {
            this.element
			.removeClass("ui-autocomplete-input")
			.removeAttr("autocomplete")
			.removeAttr("role")
			.removeAttr("aria-autocomplete")
			.removeAttr("aria-haspopup");
            this.menu.element.remove();
            $(window).unbind("beforeunload", this.beforeunloadHandler);
            $.Widget.prototype.destroy.call(this);
        },

        _setOption: function (key, value) {
            $.Widget.prototype._setOption.apply(this, arguments);
            if (key === "source") {
                this._initSource();
            }
            if (key === "appendTo") {
                this.menu.element.appendTo($(value || "body", this.element[0].ownerDocument)[0])
            }
            if (key === "disabled" && value && this.xhr) {
                this.xhr.abort();
            }
        },

        _initSource: function () {
            var self = this,
			array,
			url;
            if ($.isArray(this.options.source)) {
                array = this.options.source;
                this.source = function (request, response) {
                    response($.ui.autocomplete.filter(array, request.term));
                };
            } else if (typeof this.options.source === "string") {
                url = this.options.source;
                this.source = function (request, response) {
                    if (self.xhr) {
                        self.xhr.abort();
                    }
                    self.xhr = $.ajax({
                        url: url,
                        data: request,
                        dataType: "json",
                        success: function (data, status) {
                            response(data);
                        },
                        error: function () {
                            response([]);
                        }
                    });
                };
            } else {
                this.source = this.options.source;
            }
        },

        search: function (value, event) {
            value = value != null ? value : this.element.val();

            // always save the actual value, not the one passed as an argument
            this.term = this.element.val();

            if (value.length < this.options.minLength) {
                return this.close(event);
            }

            clearTimeout(this.closing);
            if (this._trigger("search", event) === false) {
                return;
            }

            return this._search(value);
        },

        _search: function (value) {
            this.pending++;
            this.element.addClass("ui-autocomplete-loading");

            this.source({ term: value }, this._response());
        },

        _response: function () {
            var that = this,
			index = ++requestIndex;

            return function (content) {
                if (index === requestIndex) {
                    that.__response(content);
                }

                that.pending--;
                if (!that.pending) {
                    that.element.removeClass("ui-autocomplete-loading");
                }
            };
        },

        __response: function (content) {
            if (!this.options.disabled && content && content.length) {
                content = this._normalize(content);
                this._suggest(content);
                this._trigger("open");
            } else {
                this.close();
            }
        },

        close: function (event) {
            clearTimeout(this.closing);
            if (this.menu.element.is(":visible")) {
                this.menu.element.hide();
                this.menu.deactivate();
                this._trigger("close", event);
            }
        },

        _change: function (event) {
            if (this.previous !== this.element.val()) {
                this._trigger("change", event, { item: this.selectedItem });
            }
        },

        _normalize: function (items) {
            // assume all items have the right format when the first item is complete
            if (items.length && items[0].label && items[0].value) {
                return items;
            }
            return $.map(items, function (item) {
                if (typeof item === "string") {
                    return {
                        label: item,
                        value: item
                    };
                }
                return $.extend({
                    label: item.label || item.value,
                    value: item.value || item.label
                }, item);
            });
        },

        _suggest: function (items) {
            var ul = this.menu.element
			.empty()
			.zIndex(this.element.zIndex() + 1);
            this._renderMenu(ul, items);
            // TODO refresh should check if the active item is still in the dom, removing the need for a manual deactivate
            this.menu.deactivate();
            this.menu.refresh();

            // size and position menu
            ul.show();
            this._resizeMenu();
            ul.position($.extend({
                of: this.element
            }, this.options.position));

            if (this.options.autoFocus) {
                this.menu.next(new $.Event("mouseover"));
            }
        },

        _resizeMenu: function () {
            var ul = this.menu.element;
            ul.outerWidth(Math.max(
            // Firefox wraps long text (possibly a rounding bug)
            // so we add 1px to avoid the wrapping (#7513)
			ul.width("").outerWidth() + 1,
			this.element.outerWidth()
		));
        },

        _renderMenu: function (ul, items) {
            var self = this;
            $.each(items, function (index, item) {
                self._renderItem(ul, item);
            });
        },

        _renderItem: function (ul, item) {
            return $("<li></li>")
			.data("item.autocomplete", item)
			.append($("<a></a>").html(item.label))
			.appendTo(ul);
        },

        _move: function (direction, event) {
            if (!this.menu.element.is(":visible")) {
                this.search(null, event);
                return;
            }
            if (this.menu.first() && /^previous/.test(direction) ||
				this.menu.last() && /^next/.test(direction)) {
                this.element.val(this.term);
                this.menu.deactivate();
                return;
            }
            this.menu[direction](event);
        },

        widget: function () {
            return this.menu.element;
        },
        _keyEvent: function (keyEvent, event) {
            if (!this.isMultiLine || this.menu.element.is(":visible")) {
                this._move(keyEvent, event);

                // prevents moving cursor to beginning/end of the text field in some browsers
                event.preventDefault();
            }
        }
    });

    $.extend($.ui.autocomplete, {
        escapeRegex: function (value) {
            return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        },
        filter: function (array, term) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
            return $.grep(array, function (value) {
                return matcher.test(value.label || value.value || value);
            });
        }
    });

} (jQuery));

/*
* jQuery UI Menu (not officially released)
* 
* This widget isn't yet finished and the API is subject to change. We plan to finish
* it for the next release. You're welcome to give it a try anyway and give us feedback,
* as long as you're okay with migrating your code later on. We can help with that, too.
*
* Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Menu
*
* Depends:
*	jquery.ui.core.js
*  jquery.ui.widget.js
*/
(function ($) {

    $.widget("ui.menu", {
        _create: function () {
            var self = this;
            this.element
			.addClass("ui-menu ui-widget ui-widget-content ui-corner-all")
			.attr({
			    role: "listbox",
			    "aria-activedescendant": "ui-active-menuitem"
			})
			.click(function (event) {
			    if (!$(event.target).closest(".ui-menu-item a").length) {
			        return;
			    }
			    // temporary
			    event.preventDefault();
			    self.select(event);
			});
            this.refresh();
        },

        refresh: function () {
            var self = this;

            // don't refresh list items that are already adapted
            var items = this.element.children("li:not(.ui-menu-item):has(a)")
			.addClass("ui-menu-item")
			.attr("role", "menuitem");

            items.children("a")
			.addClass("ui-corner-all")
			.attr("tabindex", -1)
            // mouseenter doesn't work with event delegation
			.mouseenter(function (event) {
			    self.activate(event, $(this).parent());
			})
			.mouseleave(function () {
			    self.deactivate();
			});
        },

        activate: function (event, item) {
            this.deactivate();
            if (this.hasScroll()) {
                var offset = item.offset().top - this.element.offset().top,
				scroll = this.element.scrollTop(),
				elementHeight = this.element.height();
                if (offset < 0) {
                    this.element.scrollTop(scroll + offset);
                } else if (offset >= elementHeight) {
                    this.element.scrollTop(scroll + offset - elementHeight + item.height());
                }
            }
            this.active = item.eq(0)
			.children("a")
				.addClass("ui-state-hover")
				.attr("id", "ui-active-menuitem")
			.end();
            this._trigger("focus", event, { item: item });
        },

        deactivate: function () {
            if (!this.active) { return; }

            this.active.children("a")
			.removeClass("ui-state-hover")
			.removeAttr("id");
            this._trigger("blur");
            this.active = null;
        },

        next: function (event) {
            this.move("next", ".ui-menu-item:first", event);
        },

        previous: function (event) {
            this.move("prev", ".ui-menu-item:last", event);
        },

        first: function () {
            return this.active && !this.active.prevAll(".ui-menu-item").length;
        },

        last: function () {
            return this.active && !this.active.nextAll(".ui-menu-item").length;
        },

        move: function (direction, edge, event) {
            if (!this.active) {
                this.activate(event, this.element.children(edge));
                return;
            }
            var next = this.active[direction + "All"](".ui-menu-item").eq(0);
            if (next.length) {
                this.activate(event, next);
            } else {
                this.activate(event, this.element.children(edge));
            }
        },

        // TODO merge with previousPage
        nextPage: function (event) {
            if (this.hasScroll()) {
                // TODO merge with no-scroll-else
                if (!this.active || this.last()) {
                    this.activate(event, this.element.children(".ui-menu-item:first"));
                    return;
                }
                var base = this.active.offset().top,
				height = this.element.height(),
				result = this.element.children(".ui-menu-item").filter(function () {
				    var close = $(this).offset().top - base - height + $(this).height();
				    // TODO improve approximation
				    return close < 10 && close > -10;
				});

                // TODO try to catch this earlier when scrollTop indicates the last page anyway
                if (!result.length) {
                    result = this.element.children(".ui-menu-item:last");
                }
                this.activate(event, result);
            } else {
                this.activate(event, this.element.children(".ui-menu-item")
				.filter(!this.active || this.last() ? ":first" : ":last"));
            }
        },

        // TODO merge with nextPage
        previousPage: function (event) {
            if (this.hasScroll()) {
                // TODO merge with no-scroll-else
                if (!this.active || this.first()) {
                    this.activate(event, this.element.children(".ui-menu-item:last"));
                    return;
                }

                var base = this.active.offset().top,
				height = this.element.height(),
				result = this.element.children(".ui-menu-item").filter(function () {
				    var close = $(this).offset().top - base + height - $(this).height();
				    // TODO improve approximation
				    return close < 10 && close > -10;
				});

                // TODO try to catch this earlier when scrollTop indicates the last page anyway
                if (!result.length) {
                    result = this.element.children(".ui-menu-item:first");
                }
                this.activate(event, result);
            } else {
                this.activate(event, this.element.children(".ui-menu-item")
				.filter(!this.active || this.first() ? ":last" : ":first"));
            }
        },

        hasScroll: function () {
            return this.element.height() < this.element[$.fn.prop ? "prop" : "attr"]("scrollHeight");
        },

        select: function (event) {
            this._trigger("selected", event, { item: this.active });
        }
    });

} (jQuery));
/*!
* jQuery UI Datepicker 1.8.22
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Datepicker
*
* Depends:
*	jquery.ui.core.js
*/
(function ($, undefined) {

    $.extend($.ui, { datepicker: { version: "1.8.22"} });

    var PROP_NAME = 'datepicker';
    var dpuuid = new Date().getTime();
    var instActive;

    /* Date picker manager.
    Use the singleton instance of this class, $.datepicker, to interact with the date picker.
    Settings for (groups of) date pickers are maintained in an instance object,
    allowing multiple different settings on the same page. */

    function Datepicker() {
        this.debug = false; // Change this to true to start debugging
        this._curInst = null; // The current instance in use
        this._keyEvent = false; // If the last event was a key event
        this._disabledInputs = []; // List of date picker inputs that have been disabled
        this._datepickerShowing = false; // True if the popup picker is showing , false if not
        this._inDialog = false; // True if showing within a "dialog", false if not
        this._mainDivId = 'ui-datepicker-div'; // The ID of the main datepicker division
        this._inlineClass = 'ui-datepicker-inline'; // The name of the inline marker class
        this._appendClass = 'ui-datepicker-append'; // The name of the append marker class
        this._triggerClass = 'ui-datepicker-trigger'; // The name of the trigger marker class
        this._dialogClass = 'ui-datepicker-dialog'; // The name of the dialog marker class
        this._disableClass = 'ui-datepicker-disabled'; // The name of the disabled covering marker class
        this._unselectableClass = 'ui-datepicker-unselectable'; // The name of the unselectable cell marker class
        this._currentClass = 'ui-datepicker-current-day'; // The name of the current day marker class
        this._dayOverClass = 'ui-datepicker-days-cell-over'; // The name of the day hover marker class
        this.regional = []; // Available regional settings, indexed by language code
        this.regional[''] = { // Default regional settings
            closeText: 'Done', // Display text for close link
            prevText: 'Prev', // Display text for previous month link
            nextText: 'Next', // Display text for next month link
            currentText: 'Today', // Display text for current month link
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'], // Names of months for drop-down and formatting
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // For formatting
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // For formatting
            dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Column headings for days starting at Sunday
            weekHeader: 'Wk', // Column header for week of the year
            dateFormat: 'mm/dd/yy', // See format options on parseDate
            firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
            isRTL: false, // True if right-to-left language, false if left-to-right
            showMonthAfterYear: false, // True if the year select precedes month, false for month then year
            yearSuffix: '' // Additional text to append to the year in the month headers
        };
        this._defaults = { // Global defaults for all the date picker instances
            showOn: 'focus', // 'focus' for popup on focus,
            // 'button' for trigger button, or 'both' for either
            showAnim: 'fadeIn', // Name of jQuery animation for popup
            showOptions: {}, // Options for enhanced animations
            defaultDate: null, // Used when field is blank: actual date,
            // +/-number for offset from today, null for today
            appendText: '', // Display text following the input box, e.g. showing the format
            buttonText: '...', // Text for trigger button
            buttonImage: '', // URL for trigger button image
            buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
            hideIfNoPrevNext: false, // True to hide next/previous month links
            // if not applicable, false to just disable them
            navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
            gotoCurrent: false, // True if today link goes back to current selection instead
            changeMonth: false, // True if month can be selected directly, false if only prev/next
            changeYear: false, // True if year can be selected directly, false if only prev/next
            yearRange: 'c-10:c+10', // Range of years to display in drop-down,
            // either relative to today's year (-nn:+nn), relative to currently displayed year
            // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
            showOtherMonths: false, // True to show dates in other months, false to leave blank
            selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
            showWeek: false, // True to show week of the year, false to not show it
            calculateWeek: this.iso8601Week, // How to calculate the week of the year,
            // takes a Date and returns the number of the week for it
            shortYearCutoff: '+10', // Short year values < this are in the current century,
            // > this are in the previous century,
            // string value starting with '+' for current year + value
            minDate: null, // The earliest selectable date, or null for no limit
            maxDate: null, // The latest selectable date, or null for no limit
            duration: 'fast', // Duration of display/closure
            beforeShowDay: null, // Function that takes a date and returns an array with
            // [0] = true if selectable, false if not, [1] = custom CSS class name(s) or '',
            // [2] = cell title (optional), e.g. $.datepicker.noWeekends
            beforeShow: null, // Function that takes an input field and
            // returns a set of custom settings for the date picker
            onSelect: null, // Define a callback function when a date is selected
            onChangeMonthYear: null, // Define a callback function when the month or year is changed
            onClose: null, // Define a callback function when the datepicker is closed
            numberOfMonths: 1, // Number of months to show at a time
            showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
            stepMonths: 1, // Number of months to step back/forward
            stepBigMonths: 12, // Number of months to step back/forward for the big links
            altField: '', // Selector for an alternate field to store selected dates into
            altFormat: '', // The date format to use for the alternate field
            constrainInput: true, // The input is constrained by the current date format
            showButtonPanel: false, // True to show button panel, false to not show it
            autoSize: false, // True to size the input for the date format, false to leave as is
            disabled: false // The initial disabled state
        };
        $.extend(this._defaults, this.regional['']);
        this.dpDiv = bindHover($('<div id="' + this._mainDivId + '" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'));
    }

    $.extend(Datepicker.prototype, {
        /* Class name added to elements to indicate already configured with a date picker. */
        markerClassName: 'hasDatepicker',

        //Keep track of the maximum number of rows displayed (see #7043)
        maxRows: 4,

        /* Debug logging (if enabled). */
        log: function () {
            if (this.debug)
                console.log.apply('', arguments);
        },

        // TODO rename to "widget" when switching to widget factory
        _widgetDatepicker: function () {
            return this.dpDiv;
        },

        /* Override the default settings for all instances of the date picker.
        @param  settings  object - the new settings to use as defaults (anonymous object)
        @return the manager object */
        setDefaults: function (settings) {
            extendRemove(this._defaults, settings || {});
            return this;
        },

        /* Attach the date picker to a jQuery selection.
        @param  target    element - the target input field or division or span
        @param  settings  object - the new settings to use for this date picker instance (anonymous) */
        _attachDatepicker: function (target, settings) {
            // check for settings on the control itself - in namespace 'date:'
            var inlineSettings = null;
            for (var attrName in this._defaults) {
                var attrValue = target.getAttribute('date:' + attrName);
                if (attrValue) {
                    inlineSettings = inlineSettings || {};
                    try {
                        inlineSettings[attrName] = eval(attrValue);
                    } catch (err) {
                        inlineSettings[attrName] = attrValue;
                    }
                }
            }
            var nodeName = target.nodeName.toLowerCase();
            var inline = (nodeName == 'div' || nodeName == 'span');
            if (!target.id) {
                this.uuid += 1;
                target.id = 'dp' + this.uuid;
            }
            var inst = this._newInst($(target), inline);
            inst.settings = $.extend({}, settings || {}, inlineSettings || {});
            if (nodeName == 'input') {
                this._connectDatepicker(target, inst);
            } else if (inline) {
                this._inlineDatepicker(target, inst);
            }
        },

        /* Create a new instance object. */
        _newInst: function (target, inline) {
            var id = target[0].id.replace(/([^A-Za-z0-9_-])/g, '\\\\$1'); // escape jQuery meta chars
            return { id: id, input: target, // associated target
                selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
                drawMonth: 0, drawYear: 0, // month being drawn
                inline: inline, // is datepicker inline or not
                dpDiv: (!inline ? this.dpDiv : // presentation div
			bindHover($('<div class="' + this._inlineClass + ' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')))
            };
        },

        /* Attach the date picker to an input field. */
        _connectDatepicker: function (target, inst) {
            var input = $(target);
            inst.append = $([]);
            inst.trigger = $([]);
            if (input.hasClass(this.markerClassName))
                return;
            this._attachments(input, inst);
            input.addClass(this.markerClassName).keydown(this._doKeyDown).
			keypress(this._doKeyPress).keyup(this._doKeyUp).
			bind("setData.datepicker", function (event, key, value) {
			    inst.settings[key] = value;
			}).bind("getData.datepicker", function (event, key) {
			    return this._get(inst, key);
			});
            this._autoSize(inst);
            $.data(target, PROP_NAME, inst);
            //If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
            if (inst.settings.disabled) {
                this._disableDatepicker(target);
            }
        },

        /* Make attachments based on settings. */
        _attachments: function (input, inst) {
            var appendText = this._get(inst, 'appendText');
            var isRTL = this._get(inst, 'isRTL');
            if (inst.append)
                inst.append.remove();
            if (appendText) {
                inst.append = $('<span class="' + this._appendClass + '">' + appendText + '</span>');
                input[isRTL ? 'before' : 'after'](inst.append);
            }
            input.unbind('focus', this._showDatepicker);
            if (inst.trigger)
                inst.trigger.remove();
            var showOn = this._get(inst, 'showOn');
            if (showOn == 'focus' || showOn == 'both') // pop-up date picker when in the marked field
                input.focus(this._showDatepicker);
            if (showOn == 'button' || showOn == 'both') { // pop-up date picker when button clicked
                var buttonText = this._get(inst, 'buttonText');
                var buttonImage = this._get(inst, 'buttonImage');
                inst.trigger = $(this._get(inst, 'buttonImageOnly') ?
				$('<img/>').addClass(this._triggerClass).
					attr({ src: buttonImage, alt: buttonText, title: buttonText }) :
				$('<button type="button"></button>').addClass(this._triggerClass).
					html(buttonImage == '' ? buttonText : $('<img/>').attr(
					{ src: buttonImage, alt: buttonText, title: buttonText })));
                input[isRTL ? 'before' : 'after'](inst.trigger);
                inst.trigger.click(function () {
                    if ($.datepicker._datepickerShowing && $.datepicker._lastInput == input[0])
                        $.datepicker._hideDatepicker();
                    else if ($.datepicker._datepickerShowing && $.datepicker._lastInput != input[0]) {
                        $.datepicker._hideDatepicker();
                        $.datepicker._showDatepicker(input[0]);
                    } else
                        $.datepicker._showDatepicker(input[0]);
                    return false;
                });
            }
        },

        /* Apply the maximum length for the date format. */
        _autoSize: function (inst) {
            if (this._get(inst, 'autoSize') && !inst.inline) {
                var date = new Date(2009, 12 - 1, 20); // Ensure double digits
                var dateFormat = this._get(inst, 'dateFormat');
                if (dateFormat.match(/[DM]/)) {
                    var findMax = function (names) {
                        var max = 0;
                        var maxI = 0;
                        for (var i = 0; i < names.length; i++) {
                            if (names[i].length > max) {
                                max = names[i].length;
                                maxI = i;
                            }
                        }
                        return maxI;
                    };
                    date.setMonth(findMax(this._get(inst, (dateFormat.match(/MM/) ?
					'monthNames' : 'monthNamesShort'))));
                    date.setDate(findMax(this._get(inst, (dateFormat.match(/DD/) ?
					'dayNames' : 'dayNamesShort'))) + 20 - date.getDay());
                }
                inst.input.attr('size', this._formatDate(inst, date).length);
            }
        },

        /* Attach an inline date picker to a div. */
        _inlineDatepicker: function (target, inst) {
            var divSpan = $(target);
            if (divSpan.hasClass(this.markerClassName))
                return;
            divSpan.addClass(this.markerClassName).append(inst.dpDiv).
			bind("setData.datepicker", function (event, key, value) {
			    inst.settings[key] = value;
			}).bind("getData.datepicker", function (event, key) {
			    return this._get(inst, key);
			});
            $.data(target, PROP_NAME, inst);
            this._setDate(inst, this._getDefaultDate(inst), true);
            this._updateDatepicker(inst);
            this._updateAlternate(inst);
            //If disabled option is true, disable the datepicker before showing it (see ticket #5665)
            if (inst.settings.disabled) {
                this._disableDatepicker(target);
            }
            // Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
            // http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
            inst.dpDiv.css("display", "block");
        },

        /* Pop-up the date picker in a "dialog" box.
        @param  input     element - ignored
        @param  date      string or Date - the initial date to display
        @param  onSelect  function - the function to call when a date is selected
        @param  settings  object - update the dialog date picker instance's settings (anonymous object)
        @param  pos       int[2] - coordinates for the dialog's position within the screen or
        event - with x/y coordinates or
        leave empty for default (screen centre)
        @return the manager object */
        _dialogDatepicker: function (input, date, onSelect, settings, pos) {
            var inst = this._dialogInst; // internal instance
            if (!inst) {
                this.uuid += 1;
                var id = 'dp' + this.uuid;
                this._dialogInput = $('<input type="text" id="' + id +
				'" style="position: absolute; top: -100px; width: 0px;"/>');
                this._dialogInput.keydown(this._doKeyDown);
                $('body').append(this._dialogInput);
                inst = this._dialogInst = this._newInst(this._dialogInput, false);
                inst.settings = {};
                $.data(this._dialogInput[0], PROP_NAME, inst);
            }
            extendRemove(inst.settings, settings || {});
            date = (date && date.constructor == Date ? this._formatDate(inst, date) : date);
            this._dialogInput.val(date);

            this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
            if (!this._pos) {
                var browserWidth = document.documentElement.clientWidth;
                var browserHeight = document.documentElement.clientHeight;
                var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                this._pos = // should use actual width/height below
				[(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
            }

            // move input on screen for focus, but hidden behind dialog
            this._dialogInput.css('left', (this._pos[0] + 20) + 'px').css('top', this._pos[1] + 'px');
            inst.settings.onSelect = onSelect;
            this._inDialog = true;
            this.dpDiv.addClass(this._dialogClass);
            this._showDatepicker(this._dialogInput[0]);
            if ($.blockUI)
                $.blockUI(this.dpDiv);
            $.data(this._dialogInput[0], PROP_NAME, inst);
            return this;
        },

        /* Detach a datepicker from its control.
        @param  target    element - the target input field or division or span */
        _destroyDatepicker: function (target) {
            var $target = $(target);
            var inst = $.data(target, PROP_NAME);
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            var nodeName = target.nodeName.toLowerCase();
            $.removeData(target, PROP_NAME);
            if (nodeName == 'input') {
                inst.append.remove();
                inst.trigger.remove();
                $target.removeClass(this.markerClassName).
				unbind('focus', this._showDatepicker).
				unbind('keydown', this._doKeyDown).
				unbind('keypress', this._doKeyPress).
				unbind('keyup', this._doKeyUp);
            } else if (nodeName == 'div' || nodeName == 'span')
                $target.removeClass(this.markerClassName).empty();
        },

        /* Enable the date picker to a jQuery selection.
        @param  target    element - the target input field or division or span */
        _enableDatepicker: function (target) {
            var $target = $(target);
            var inst = $.data(target, PROP_NAME);
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            var nodeName = target.nodeName.toLowerCase();
            if (nodeName == 'input') {
                target.disabled = false;
                inst.trigger.filter('button').
				each(function () { this.disabled = false; }).end().
				filter('img').css({ opacity: '1.0', cursor: '' });
            }
            else if (nodeName == 'div' || nodeName == 'span') {
                var inline = $target.children('.' + this._inlineClass);
                inline.children().removeClass('ui-state-disabled');
                inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
				removeAttr("disabled");
            }
            this._disabledInputs = $.map(this._disabledInputs,
			function (value) { return (value == target ? null : value); }); // delete entry
        },

        /* Disable the date picker to a jQuery selection.
        @param  target    element - the target input field or division or span */
        _disableDatepicker: function (target) {
            var $target = $(target);
            var inst = $.data(target, PROP_NAME);
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            var nodeName = target.nodeName.toLowerCase();
            if (nodeName == 'input') {
                target.disabled = true;
                inst.trigger.filter('button').
				each(function () { this.disabled = true; }).end().
				filter('img').css({ opacity: '0.5', cursor: 'default' });
            }
            else if (nodeName == 'div' || nodeName == 'span') {
                var inline = $target.children('.' + this._inlineClass);
                inline.children().addClass('ui-state-disabled');
                inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
				attr("disabled", "disabled");
            }
            this._disabledInputs = $.map(this._disabledInputs,
			function (value) { return (value == target ? null : value); }); // delete entry
            this._disabledInputs[this._disabledInputs.length] = target;
        },

        /* Is the first field in a jQuery collection disabled as a datepicker?
        @param  target    element - the target input field or division or span
        @return boolean - true if disabled, false if enabled */
        _isDisabledDatepicker: function (target) {
            if (!target) {
                return false;
            }
            for (var i = 0; i < this._disabledInputs.length; i++) {
                if (this._disabledInputs[i] == target)
                    return true;
            }
            return false;
        },

        /* Retrieve the instance data for the target control.
        @param  target  element - the target input field or division or span
        @return  object - the associated instance data
        @throws  error if a jQuery problem getting data */
        _getInst: function (target) {
            try {
                return $.data(target, PROP_NAME);
            }
            catch (err) {
                throw 'Missing instance data for this datepicker';
            }
        },

        /* Update or retrieve the settings for a date picker attached to an input field or division.
        @param  target  element - the target input field or division or span
        @param  name    object - the new settings to update or
        string - the name of the setting to change or retrieve,
        when retrieving also 'all' for all instance settings or
        'defaults' for all global defaults
        @param  value   any - the new value for the setting
        (omit if above is an object or to retrieve a value) */
        _optionDatepicker: function (target, name, value) {
            var inst = this._getInst(target);
            if (arguments.length == 2 && typeof name == 'string') {
                return (name == 'defaults' ? $.extend({}, $.datepicker._defaults) :
				(inst ? (name == 'all' ? $.extend({}, inst.settings) :
				this._get(inst, name)) : null));
            }
            var settings = name || {};
            if (typeof name == 'string') {
                settings = {};
                settings[name] = value;
            }
            if (inst) {
                if (this._curInst == inst) {
                    this._hideDatepicker();
                }
                var date = this._getDateDatepicker(target, true);
                var minDate = this._getMinMaxDate(inst, 'min');
                var maxDate = this._getMinMaxDate(inst, 'max');
                extendRemove(inst.settings, settings);
                // reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
                if (minDate !== null && settings['dateFormat'] !== undefined && settings['minDate'] === undefined)
                    inst.settings.minDate = this._formatDate(inst, minDate);
                if (maxDate !== null && settings['dateFormat'] !== undefined && settings['maxDate'] === undefined)
                    inst.settings.maxDate = this._formatDate(inst, maxDate);
                this._attachments($(target), inst);
                this._autoSize(inst);
                this._setDate(inst, date);
                this._updateAlternate(inst);
                this._updateDatepicker(inst);
            }
        },

        // change method deprecated
        _changeDatepicker: function (target, name, value) {
            this._optionDatepicker(target, name, value);
        },

        /* Redraw the date picker attached to an input field or division.
        @param  target  element - the target input field or division or span */
        _refreshDatepicker: function (target) {
            var inst = this._getInst(target);
            if (inst) {
                this._updateDatepicker(inst);
            }
        },

        /* Set the dates for a jQuery selection.
        @param  target   element - the target input field or division or span
        @param  date     Date - the new date */
        _setDateDatepicker: function (target, date) {
            var inst = this._getInst(target);
            if (inst) {
                this._setDate(inst, date);
                this._updateDatepicker(inst);
                this._updateAlternate(inst);
            }
        },

        /* Get the date(s) for the first entry in a jQuery selection.
        @param  target     element - the target input field or division or span
        @param  noDefault  boolean - true if no default date is to be used
        @return Date - the current date */
        _getDateDatepicker: function (target, noDefault) {
            var inst = this._getInst(target);
            if (inst && !inst.inline)
                this._setDateFromField(inst, noDefault);
            return (inst ? this._getDate(inst) : null);
        },

        /* Handle keystrokes. */
        _doKeyDown: function (event) {
            var inst = $.datepicker._getInst(event.target);
            var handled = true;
            var isRTL = inst.dpDiv.is('.ui-datepicker-rtl');
            inst._keyEvent = true;
            if ($.datepicker._datepickerShowing)
                switch (event.keyCode) {
                case 9: $.datepicker._hideDatepicker();
                    handled = false;
                    break; // hide on tab out
                case 13: var sel = $('td.' + $.datepicker._dayOverClass + ':not(.' +
									$.datepicker._currentClass + ')', inst.dpDiv);
                    if (sel[0])
                        $.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel[0]);
                    var onSelect = $.datepicker._get(inst, 'onSelect');
                    if (onSelect) {
                        var dateStr = $.datepicker._formatDate(inst);

                        // trigger custom callback
                        onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
                    }
                    else
                        $.datepicker._hideDatepicker();
                    return false; // don't submit the form
                    break; // select the value on enter
                case 27: $.datepicker._hideDatepicker();
                    break; // hide on escape
                case 33: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							-$.datepicker._get(inst, 'stepBigMonths') :
							-$.datepicker._get(inst, 'stepMonths')), 'M');
                    break; // previous month/year on page up/+ ctrl
                case 34: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							+$.datepicker._get(inst, 'stepBigMonths') :
							+$.datepicker._get(inst, 'stepMonths')), 'M');
                    break; // next month/year on page down/+ ctrl
                case 35: if (event.ctrlKey || event.metaKey) $.datepicker._clearDate(event.target);
                    handled = event.ctrlKey || event.metaKey;
                    break; // clear on ctrl or command +end
                case 36: if (event.ctrlKey || event.metaKey) $.datepicker._gotoToday(event.target);
                    handled = event.ctrlKey || event.metaKey;
                    break; // current on ctrl or command +home
                case 37: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), 'D');
                    handled = event.ctrlKey || event.metaKey;
                    // -1 day on ctrl or command +left
                    if (event.originalEvent.altKey) $.datepicker._adjustDate(event.target, (event.ctrlKey ?
									-$.datepicker._get(inst, 'stepBigMonths') :
									-$.datepicker._get(inst, 'stepMonths')), 'M');
                    // next month/year on alt +left on Mac
                    break;
                case 38: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, -7, 'D');
                    handled = event.ctrlKey || event.metaKey;
                    break; // -1 week on ctrl or command +up
                case 39: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), 'D');
                    handled = event.ctrlKey || event.metaKey;
                    // +1 day on ctrl or command +right
                    if (event.originalEvent.altKey) $.datepicker._adjustDate(event.target, (event.ctrlKey ?
									+$.datepicker._get(inst, 'stepBigMonths') :
									+$.datepicker._get(inst, 'stepMonths')), 'M');
                    // next month/year on alt +right
                    break;
                case 40: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, +7, 'D');
                    handled = event.ctrlKey || event.metaKey;
                    break; // +1 week on ctrl or command +down
                default: handled = false;
            }
            else if (event.keyCode == 36 && event.ctrlKey) // display the date picker on ctrl+home
                $.datepicker._showDatepicker(this);
            else {
                handled = false;
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }
        },

        /* Filter entered characters - based on date format. */
        _doKeyPress: function (event) {
            var inst = $.datepicker._getInst(event.target);
            if ($.datepicker._get(inst, 'constrainInput')) {
                var chars = $.datepicker._possibleChars($.datepicker._get(inst, 'dateFormat'));
                var chr = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
                return event.ctrlKey || event.metaKey || (chr < ' ' || !chars || chars.indexOf(chr) > -1);
            }
        },

        /* Synchronise manual entry and field/alternate field. */
        _doKeyUp: function (event) {
            var inst = $.datepicker._getInst(event.target);
            if (inst.input.val() != inst.lastVal) {
                try {
                    var date = $.datepicker.parseDate($.datepicker._get(inst, 'dateFormat'),
					(inst.input ? inst.input.val() : null),
					$.datepicker._getFormatConfig(inst));
                    if (date) { // only if valid
                        $.datepicker._setDateFromField(inst);
                        $.datepicker._updateAlternate(inst);
                        $.datepicker._updateDatepicker(inst);
                    }
                }
                catch (err) {
                    $.datepicker.log(err);
                }
            }
            return true;
        },

        /* Pop-up the date picker for a given input field.
        If false returned from beforeShow event handler do not show. 
        @param  input  element - the input field attached to the date picker or
        event - if triggered by focus */
        _showDatepicker: function (input) {
            input = input.target || input;
            if (input.nodeName.toLowerCase() != 'input') // find from button/image trigger
                input = $('input', input.parentNode)[0];
            if ($.datepicker._isDisabledDatepicker(input) || $.datepicker._lastInput == input) // already here
                return;
            var inst = $.datepicker._getInst(input);
            if ($.datepicker._curInst && $.datepicker._curInst != inst) {
                $.datepicker._curInst.dpDiv.stop(true, true);
                if (inst && $.datepicker._datepickerShowing) {
                    $.datepicker._hideDatepicker($.datepicker._curInst.input[0]);
                }
            }
            var beforeShow = $.datepicker._get(inst, 'beforeShow');
            var beforeShowSettings = beforeShow ? beforeShow.apply(input, [input, inst]) : {};
            if (beforeShowSettings === false) {
                //false
                return;
            }
            extendRemove(inst.settings, beforeShowSettings);
            inst.lastVal = null;
            $.datepicker._lastInput = input;
            $.datepicker._setDateFromField(inst);
            if ($.datepicker._inDialog) // hide cursor
                input.value = '';
            if (!$.datepicker._pos) { // position below input
                $.datepicker._pos = $.datepicker._findPos(input);
                $.datepicker._pos[1] += input.offsetHeight; // add the height
            }
            var isFixed = false;
            $(input).parents().each(function () {
                isFixed |= $(this).css('position') == 'fixed';
                return !isFixed;
            });
            if (isFixed && $.browser.opera) { // correction for Opera when fixed and scrolled
                $.datepicker._pos[0] -= document.documentElement.scrollLeft;
                $.datepicker._pos[1] -= document.documentElement.scrollTop;
            }
            var offset = { left: $.datepicker._pos[0], top: $.datepicker._pos[1] };
            $.datepicker._pos = null;
            //to avoid flashes on Firefox
            inst.dpDiv.empty();
            // determine sizing offscreen
            inst.dpDiv.css({ position: 'absolute', display: 'block', top: '-1000px' });
            $.datepicker._updateDatepicker(inst);
            // fix width for dynamic number of date pickers
            // and adjust position before showing
            offset = $.datepicker._checkOffset(inst, offset, isFixed);
            inst.dpDiv.css({ position: ($.datepicker._inDialog && $.blockUI ?
			'static' : (isFixed ? 'fixed' : 'absolute')), display: 'none',
                left: offset.left + 'px', top: offset.top + 'px'
            });
            if (!inst.inline) {
                var showAnim = $.datepicker._get(inst, 'showAnim');
                var duration = $.datepicker._get(inst, 'duration');
                var postProcess = function () {
                    var cover = inst.dpDiv.find('iframe.ui-datepicker-cover'); // IE6- only
                    if (!!cover.length) {
                        var borders = $.datepicker._getBorders(inst.dpDiv);
                        cover.css({ left: -borders[0], top: -borders[1],
                            width: inst.dpDiv.outerWidth(), height: inst.dpDiv.outerHeight()
                        });
                    }
                };
                inst.dpDiv.zIndex($(input).zIndex() + 1);
                $.datepicker._datepickerShowing = true;
                if ($.effects && $.effects[showAnim])
                    inst.dpDiv.show(showAnim, $.datepicker._get(inst, 'showOptions'), duration, postProcess);
                else
                    inst.dpDiv[showAnim || 'show']((showAnim ? duration : null), postProcess);
                if (!showAnim || !duration)
                    postProcess();
                if (inst.input.is(':visible') && !inst.input.is(':disabled'))
                    inst.input.focus();
                $.datepicker._curInst = inst;
            }
        },

        /* Generate the date picker content. */
        _updateDatepicker: function (inst) {
            var self = this;
            self.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
            var borders = $.datepicker._getBorders(inst.dpDiv);
            instActive = inst; // for delegate hover events
            inst.dpDiv.empty().append(this._generateHTML(inst));
            this._attachHandlers(inst);
            var cover = inst.dpDiv.find('iframe.ui-datepicker-cover'); // IE6- only
            if (!!cover.length) { //avoid call to outerXXXX() when not in IE6
                cover.css({ left: -borders[0], top: -borders[1], width: inst.dpDiv.outerWidth(), height: inst.dpDiv.outerHeight() })
            }
            inst.dpDiv.find('.' + this._dayOverClass + ' a').mouseover();
            var numMonths = this._getNumberOfMonths(inst);
            var cols = numMonths[1];
            var width = 17;
            inst.dpDiv.removeClass('ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4').width('');
            // ATDW modification - consistent styling on myEvents acquisition across calendars
            /* if (cols > 1)
            inst.dpDiv.addClass('ui-datepicker-multi-' + cols).css('width', (width * cols) + 'em'); */
            inst.dpDiv[(numMonths[0] != 1 || numMonths[1] != 1 ? 'add' : 'remove') +
			'Class']('ui-datepicker-multi');
            inst.dpDiv[(this._get(inst, 'isRTL') ? 'add' : 'remove') +
			'Class']('ui-datepicker-rtl');
            if (inst == $.datepicker._curInst && $.datepicker._datepickerShowing && inst.input &&
            // #6694 - don't focus the input if it's already focused
            // this breaks the change event in IE
				inst.input.is(':visible') && !inst.input.is(':disabled') && inst.input[0] != document.activeElement)
                inst.input.focus();
            // deffered render of the years select (to avoid flashes on Firefox) 
            if (inst.yearshtml) {
                var origyearshtml = inst.yearshtml;
                setTimeout(function () {
                    //assure that inst.yearshtml didn't change.
                    if (origyearshtml === inst.yearshtml && inst.yearshtml) {
                        inst.dpDiv.find('select.ui-datepicker-year:first').replaceWith(inst.yearshtml);
                    }
                    origyearshtml = inst.yearshtml = null;
                }, 0);
            }
        },

        /* Retrieve the size of left and top borders for an element.
        @param  elem  (jQuery object) the element of interest
        @return  (number[2]) the left and top borders */
        _getBorders: function (elem) {
            var convert = function (value) {
                return { thin: 1, medium: 2, thick: 3}[value] || value;
            };
            return [parseFloat(convert(elem.css('border-left-width'))),
			parseFloat(convert(elem.css('border-top-width')))];
        },

        /* Check positioning to remain on screen. */
        _checkOffset: function (inst, offset, isFixed) {
            var dpWidth = inst.dpDiv.outerWidth();
            var dpHeight = inst.dpDiv.outerHeight();
            var inputWidth = inst.input ? inst.input.outerWidth() : 0;
            var inputHeight = inst.input ? inst.input.outerHeight() : 0;
            var viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : $(document).scrollLeft());
            var viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : $(document).scrollTop());

            offset.left -= (this._get(inst, 'isRTL') ? (dpWidth - inputWidth) : 0);
            offset.left -= (isFixed && offset.left == inst.input.offset().left) ? $(document).scrollLeft() : 0;
            offset.top -= (isFixed && offset.top == (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

            // now check if datepicker is showing outside window viewport - move to a better place if so.
            offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
			Math.abs(offset.left + dpWidth - viewWidth) : 0);
            offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
			Math.abs(dpHeight + inputHeight) : 0);

            return offset;
        },

        /* Find an object's position on the screen. */
        _findPos: function (obj) {
            var inst = this._getInst(obj);
            var isRTL = this._get(inst, 'isRTL');
            while (obj && (obj.type == 'hidden' || obj.nodeType != 1 || $.expr.filters.hidden(obj))) {
                obj = obj[isRTL ? 'previousSibling' : 'nextSibling'];
            }
            var position = $(obj).offset();
            return [position.left, position.top];
        },

        /* Hide the date picker from view.
        @param  input  element - the input field attached to the date picker */
        _hideDatepicker: function (input) {
            var inst = this._curInst;
            if (!inst || (input && inst != $.data(input, PROP_NAME)))
                return;
            if (this._datepickerShowing) {
                var showAnim = this._get(inst, 'showAnim');
                var duration = this._get(inst, 'duration');
                var postProcess = function () {
                    $.datepicker._tidyDialog(inst);
                };
                if ($.effects && $.effects[showAnim])
                    inst.dpDiv.hide(showAnim, $.datepicker._get(inst, 'showOptions'), duration, postProcess);
                else
                    inst.dpDiv[(showAnim == 'slideDown' ? 'slideUp' :
					(showAnim == 'fadeIn' ? 'fadeOut' : 'hide'))]((showAnim ? duration : null), postProcess);
                if (!showAnim)
                    postProcess();
                this._datepickerShowing = false;
                var onClose = this._get(inst, 'onClose');
                if (onClose)
                    onClose.apply((inst.input ? inst.input[0] : null),
					[(inst.input ? inst.input.val() : ''), inst]);
                this._lastInput = null;
                if (this._inDialog) {
                    this._dialogInput.css({ position: 'absolute', left: '0', top: '-100px' });
                    if ($.blockUI) {
                        $.unblockUI();
                        $('body').append(this.dpDiv);
                    }
                }
                this._inDialog = false;
            }
        },

        /* Tidy up after a dialog display. */
        _tidyDialog: function (inst) {
            inst.dpDiv.removeClass(this._dialogClass).unbind('.ui-datepicker-calendar');
        },

        /* Close date picker if clicked elsewhere. */
        _checkExternalClick: function (event) {
            if (!$.datepicker._curInst)
                return;

            var $target = $(event.target),
			inst = $.datepicker._getInst($target[0]);

            if ((($target[0].id != $.datepicker._mainDivId &&
				$target.parents('#' + $.datepicker._mainDivId).length == 0 &&
				!$target.hasClass($.datepicker.markerClassName) &&
				!$target.closest("." + $.datepicker._triggerClass).length &&
				$.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI))) ||
			($target.hasClass($.datepicker.markerClassName) && $.datepicker._curInst != inst))
                $.datepicker._hideDatepicker();
        },

        /* Adjust one of the date sub-fields. */
        _adjustDate: function (id, offset, period) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            if (this._isDisabledDatepicker(target[0])) {
                return;
            }
            this._adjustInstDate(inst, offset +
			(period == 'M' ? this._get(inst, 'showCurrentAtPos') : 0), // undo positioning
			period);
            this._updateDatepicker(inst);
        },

        /* Action for current link. */
        _gotoToday: function (id) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            if (this._get(inst, 'gotoCurrent') && inst.currentDay) {
                inst.selectedDay = inst.currentDay;
                inst.drawMonth = inst.selectedMonth = inst.currentMonth;
                inst.drawYear = inst.selectedYear = inst.currentYear;
            }
            else {
                var date = new Date();
                inst.selectedDay = date.getDate();
                inst.drawMonth = inst.selectedMonth = date.getMonth();
                inst.drawYear = inst.selectedYear = date.getFullYear();
            }
            this._notifyChange(inst);
            this._adjustDate(target);
        },

        /* Action for selecting a new month/year. */
        _selectMonthYear: function (id, select, period) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            inst['selected' + (period == 'M' ? 'Month' : 'Year')] =
		inst['draw' + (period == 'M' ? 'Month' : 'Year')] =
			parseInt(select.options[select.selectedIndex].value, 10);
            this._notifyChange(inst);
            this._adjustDate(target);
        },

        /* Action for selecting a day. */
        _selectDay: function (id, month, year, td) {
            var target = $(id);
            if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
                return;
            }
            var inst = this._getInst(target[0]);
            inst.selectedDay = inst.currentDay = $('a', td).html();
            inst.selectedMonth = inst.currentMonth = month;
            inst.selectedYear = inst.currentYear = year;
            this._selectDate(id, this._formatDate(inst,
			inst.currentDay, inst.currentMonth, inst.currentYear));
        },

        /* Erase the input field and hide the date picker. */
        _clearDate: function (id) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            this._selectDate(target, '');
        },

        /* Update the input field with the selected date. */
        _selectDate: function (id, dateStr) {
            var target = $(id);
            var inst = this._getInst(target[0]);
            dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
            if (inst.input)
                inst.input.val(dateStr);
            this._updateAlternate(inst);
            var onSelect = this._get(inst, 'onSelect');
            if (onSelect)
                onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);  // trigger custom callback
            else if (inst.input)
                inst.input.trigger('change'); // fire the change event
            if (inst.inline)
                this._updateDatepicker(inst);
            else {
                this._hideDatepicker();
                this._lastInput = inst.input[0];
                if (typeof (inst.input[0]) != 'object')
                    inst.input.focus(); // restore focus
                this._lastInput = null;
            }
        },

        /* Update any alternate field to synchronise with the main field. */
        _updateAlternate: function (inst) {
            var altField = this._get(inst, 'altField');
            if (altField) { // update alternate field too
                var altFormat = this._get(inst, 'altFormat') || this._get(inst, 'dateFormat');
                var date = this._getDate(inst);
                var dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
                $(altField).each(function () { $(this).val(dateStr); });
            }
        },

        /* Set as beforeShowDay function to prevent selection of weekends.
        @param  date  Date - the date to customise
        @return [boolean, string] - is this date selectable?, what is its CSS class? */
        noWeekends: function (date) {
            var day = date.getDay();
            return [(day > 0 && day < 6), ''];
        },

        /* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
        @param  date  Date - the date to get the week for
        @return  number - the number of the week within the year that contains this date */
        iso8601Week: function (date) {
            var checkDate = new Date(date.getTime());
            // Find Thursday of this week starting on Monday
            checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
            var time = checkDate.getTime();
            checkDate.setMonth(0); // Compare with Jan 1
            checkDate.setDate(1);
            return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        },

        /* Parse a string value into a date object.
        See formatDate below for the possible formats.

        @param  format    string - the expected format of the date
        @param  value     string - the date in the above format
        @param  settings  Object - attributes include:
        shortYearCutoff  number - the cutoff year for determining the century (optional)
        dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
        dayNames         string[7] - names of the days from Sunday (optional)
        monthNamesShort  string[12] - abbreviated names of the months (optional)
        monthNames       string[12] - names of the months (optional)
        @return  Date - the extracted date value or null if value is blank */
        parseDate: function (format, value, settings) {
            if (format == null || value == null)
                throw 'Invalid arguments';
            value = (typeof value == 'object' ? value.toString() : value + '');
            if (value == '')
                return null;
            var shortYearCutoff = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff;
            shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
				new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
            var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
            var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
            var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
            var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
            var year = -1;
            var month = -1;
            var day = -1;
            var doy = -1;
            var literal = false;
            // Check whether a format character is doubled
            var lookAhead = function (match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches)
                    iFormat++;
                return matches;
            };
            // Extract a number from the string value
            var getNumber = function (match) {
                var isDoubled = lookAhead(match);
                var size = (match == '@' ? 14 : (match == '!' ? 20 :
				(match == 'y' && isDoubled ? 4 : (match == 'o' ? 3 : 2))));
                var digits = new RegExp('^\\d{1,' + size + '}');
                var num = value.substring(iValue).match(digits);
                if (!num)
                    throw 'Missing number at position ' + iValue;
                iValue += num[0].length;
                return parseInt(num[0], 10);
            };
            // Extract a name from the string value and convert to an index
            var getName = function (match, shortNames, longNames) {
                var names = $.map(lookAhead(match) ? longNames : shortNames, function (v, k) {
                    return [[k, v]];
                }).sort(function (a, b) {
                    return -(a[1].length - b[1].length);
                });
                var index = -1;
                $.each(names, function (i, pair) {
                    var name = pair[1];
                    if (value.substr(iValue, name.length).toLowerCase() == name.toLowerCase()) {
                        index = pair[0];
                        iValue += name.length;
                        return false;
                    }
                });
                if (index != -1)
                    return index + 1;
                else
                    throw 'Unknown name at position ' + iValue;
            };
            // Confirm that a literal character matches the string value
            var checkLiteral = function () {
                if (value.charAt(iValue) != format.charAt(iFormat))
                    throw 'Unexpected literal at position ' + iValue;
                iValue++;
            };
            var iValue = 0;
            for (var iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal)
                    if (format.charAt(iFormat) == "'" && !lookAhead("'"))
                        literal = false;
                    else
                        checkLiteral();
                else
                    switch (format.charAt(iFormat)) {
                    case 'd':
                        day = getNumber('d');
                        break;
                    case 'D':
                        getName('D', dayNamesShort, dayNames);
                        break;
                    case 'o':
                        doy = getNumber('o');
                        break;
                    case 'm':
                        month = getNumber('m');
                        break;
                    case 'M':
                        month = getName('M', monthNamesShort, monthNames);
                        break;
                    case 'y':
                        year = getNumber('y');
                        break;
                    case '@':
                        var date = new Date(getNumber('@'));
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case '!':
                        var date = new Date((getNumber('!') - this._ticksTo1970) / 10000);
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "'":
                        if (lookAhead("'"))
                            checkLiteral();
                        else
                            literal = true;
                        break;
                    default:
                        checkLiteral();
                }
            }
            if (iValue < value.length) {
                throw "Extra/unparsed characters found in date: " + value.substring(iValue);
            }
            if (year == -1)
                year = new Date().getFullYear();
            else if (year < 100)
                year += new Date().getFullYear() - new Date().getFullYear() % 100 +
				(year <= shortYearCutoff ? 0 : -100);
            if (doy > -1) {
                month = 1;
                day = doy;
                do {
                    var dim = this._getDaysInMonth(year, month - 1);
                    if (day <= dim)
                        break;
                    month++;
                    day -= dim;
                } while (true);
            }
            var date = this._daylightSavingAdjust(new Date(year, month - 1, day));
            if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day)
                throw 'Invalid date'; // E.g. 31/02/00
            return date;
        },

        /* Standard date formats. */
        ATOM: 'yy-mm-dd', // RFC 3339 (ISO 8601)
        COOKIE: 'D, dd M yy',
        ISO_8601: 'yy-mm-dd',
        RFC_822: 'D, d M y',
        RFC_850: 'DD, dd-M-y',
        RFC_1036: 'D, d M y',
        RFC_1123: 'D, d M yy',
        RFC_2822: 'D, d M yy',
        RSS: 'D, d M y', // RFC 822
        TICKS: '!',
        TIMESTAMP: '@',
        W3C: 'yy-mm-dd', // ISO 8601

        _ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
		Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

        /* Format a date object into a string value.
        The format can be combinations of the following:
        d  - day of month (no leading zero)
        dd - day of month (two digit)
        o  - day of year (no leading zeros)
        oo - day of year (three digit)
        D  - day name short
        DD - day name long
        m  - month of year (no leading zero)
        mm - month of year (two digit)
        M  - month name short
        MM - month name long
        y  - year (two digit)
        yy - year (four digit)
        @ - Unix timestamp (ms since 01/01/1970)
        ! - Windows ticks (100ns since 01/01/0001)
        '...' - literal text
        '' - single quote

        @param  format    string - the desired format of the date
        @param  date      Date - the date value to format
        @param  settings  Object - attributes include:
        dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
        dayNames         string[7] - names of the days from Sunday (optional)
        monthNamesShort  string[12] - abbreviated names of the months (optional)
        monthNames       string[12] - names of the months (optional)
        @return  string - the date in the above format */
        formatDate: function (format, date, settings) {
            if (!date)
                return '';
            var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
            var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
            var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
            var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
            // Check whether a format character is doubled
            var lookAhead = function (match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches)
                    iFormat++;
                return matches;
            };
            // Format a number, with leading zero if necessary
            var formatNumber = function (match, value, len) {
                var num = '' + value;
                if (lookAhead(match))
                    while (num.length < len)
                        num = '0' + num;
                return num;
            };
            // Format a name, short or long as requested
            var formatName = function (match, value, shortNames, longNames) {
                return (lookAhead(match) ? longNames[value] : shortNames[value]);
            };
            var output = '';
            var literal = false;
            if (date)
                for (var iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal)
                        if (format.charAt(iFormat) == "'" && !lookAhead("'"))
                            literal = false;
                        else
                            output += format.charAt(iFormat);
                    else
                        switch (format.charAt(iFormat)) {
                        case 'd':
                            output += formatNumber('d', date.getDate(), 2);
                            break;
                        case 'D':
                            output += formatName('D', date.getDay(), dayNamesShort, dayNames);
                            break;
                        case 'o':
                            output += formatNumber('o',
								Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                            break;
                        case 'm':
                            output += formatNumber('m', date.getMonth() + 1, 2);
                            break;
                        case 'M':
                            output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
                            break;
                        case 'y':
                            output += (lookAhead('y') ? date.getFullYear() :
								(date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                            break;
                        case '@':
                            output += date.getTime();
                            break;
                        case '!':
                            output += date.getTime() * 10000 + this._ticksTo1970;
                            break;
                        case "'":
                            if (lookAhead("'"))
                                output += "'";
                            else
                                literal = true;
                            break;
                        default:
                            output += format.charAt(iFormat);
                    }
                }
            return output;
        },

        /* Extract all possible characters from the date format. */
        _possibleChars: function (format) {
            var chars = '';
            var literal = false;
            // Check whether a format character is doubled
            var lookAhead = function (match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches)
                    iFormat++;
                return matches;
            };
            for (var iFormat = 0; iFormat < format.length; iFormat++)
                if (literal)
                    if (format.charAt(iFormat) == "'" && !lookAhead("'"))
                        literal = false;
                    else
                        chars += format.charAt(iFormat);
                else
                    switch (format.charAt(iFormat)) {
                    case 'd': case 'm': case 'y': case '@':
                        chars += '0123456789';
                        break;
                    case 'D': case 'M':
                        return null; // Accept anything
                    case "'":
                        if (lookAhead("'"))
                            chars += "'";
                        else
                            literal = true;
                        break;
                    default:
                        chars += format.charAt(iFormat);
                }
            return chars;
        },

        /* Get a setting value, defaulting if necessary. */
        _get: function (inst, name) {
            return inst.settings[name] !== undefined ?
			inst.settings[name] : this._defaults[name];
        },

        /* Parse existing date and initialise date picker. */
        _setDateFromField: function (inst, noDefault) {
            if (inst.input.val() == inst.lastVal) {
                return;
            }
            var dateFormat = this._get(inst, 'dateFormat');
            var dates = inst.lastVal = inst.input ? inst.input.val() : null;
            var date, defaultDate;
            date = defaultDate = this._getDefaultDate(inst);
            var settings = this._getFormatConfig(inst);
            try {
                date = this.parseDate(dateFormat, dates, settings) || defaultDate;
            } catch (event) {
                this.log(event);
                dates = (noDefault ? '' : dates);
            }
            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            inst.currentDay = (dates ? date.getDate() : 0);
            inst.currentMonth = (dates ? date.getMonth() : 0);
            inst.currentYear = (dates ? date.getFullYear() : 0);
            this._adjustInstDate(inst);
        },

        /* Retrieve the default date shown on opening. */
        _getDefaultDate: function (inst) {
            return this._restrictMinMax(inst,
			this._determineDate(inst, this._get(inst, 'defaultDate'), new Date()));
        },

        /* A date may be specified as an exact value or a relative one. */
        _determineDate: function (inst, date, defaultDate) {
            var offsetNumeric = function (offset) {
                var date = new Date();
                date.setDate(date.getDate() + offset);
                return date;
            };
            var offsetString = function (offset) {
                try {
                    return $.datepicker.parseDate($.datepicker._get(inst, 'dateFormat'),
					offset, $.datepicker._getFormatConfig(inst));
                }
                catch (e) {
                    // Ignore
                }
                var date = (offset.toLowerCase().match(/^c/) ?
				$.datepicker._getDate(inst) : null) || new Date();
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDate();
                var pattern = /([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g;
                var matches = pattern.exec(offset);
                while (matches) {
                    switch (matches[2] || 'd') {
                        case 'd': case 'D':
                            day += parseInt(matches[1], 10); break;
                        case 'w': case 'W':
                            day += parseInt(matches[1], 10) * 7; break;
                        case 'm': case 'M':
                            month += parseInt(matches[1], 10);
                            day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
                            break;
                        case 'y': case 'Y':
                            year += parseInt(matches[1], 10);
                            day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
                            break;
                    }
                    matches = pattern.exec(offset);
                }
                return new Date(year, month, day);
            };
            var newDate = (date == null || date === '' ? defaultDate : (typeof date == 'string' ? offsetString(date) :
			(typeof date == 'number' ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : new Date(date.getTime()))));
            newDate = (newDate && newDate.toString() == 'Invalid Date' ? defaultDate : newDate);
            if (newDate) {
                newDate.setHours(0);
                newDate.setMinutes(0);
                newDate.setSeconds(0);
                newDate.setMilliseconds(0);
            }
            return this._daylightSavingAdjust(newDate);
        },

        /* Handle switch to/from daylight saving.
        Hours may be non-zero on daylight saving cut-over:
        > 12 when midnight changeover, but then cannot generate
        midnight datetime, so jump to 1AM, otherwise reset.
        @param  date  (Date) the date to check
        @return  (Date) the corrected date */
        _daylightSavingAdjust: function (date) {
            if (!date) return null;
            date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
            return date;
        },

        /* Set the date(s) directly. */
        _setDate: function (inst, date, noChange) {
            var clear = !date;
            var origMonth = inst.selectedMonth;
            var origYear = inst.selectedYear;
            var newDate = this._restrictMinMax(inst, this._determineDate(inst, date, new Date()));
            inst.selectedDay = inst.currentDay = newDate.getDate();
            inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
            inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
            if ((origMonth != inst.selectedMonth || origYear != inst.selectedYear) && !noChange)
                this._notifyChange(inst);
            this._adjustInstDate(inst);
            if (inst.input) {
                inst.input.val(clear ? '' : this._formatDate(inst));
            }
        },

        /* Retrieve the date(s) directly. */
        _getDate: function (inst) {
            var startDate = (!inst.currentYear || (inst.input && inst.input.val() == '') ? null :
			this._daylightSavingAdjust(new Date(
			inst.currentYear, inst.currentMonth, inst.currentDay)));
            return startDate;
        },

        /* Attach the onxxx handlers.  These are declared statically so
        * they work with static code transformers like Caja.
        */
        _attachHandlers: function (inst) {
            var stepMonths = this._get(inst, 'stepMonths');
            var id = '#' + inst.id;
            inst.dpDiv.find('[data-handler]').map(function () {
                var handler = {
                    prev: function () {
                        window['DP_jQuery_' + dpuuid].datepicker._adjustDate(id, -stepMonths, 'M');
                    },
                    next: function () {
                        window['DP_jQuery_' + dpuuid].datepicker._adjustDate(id, +stepMonths, 'M');
                    },
                    hide: function () {
                        window['DP_jQuery_' + dpuuid].datepicker._hideDatepicker();
                    },
                    today: function () {
                        window['DP_jQuery_' + dpuuid].datepicker._gotoToday(id);
                    },
                    selectDay: function () {
                        window['DP_jQuery_' + dpuuid].datepicker._selectDay(id, +this.getAttribute('data-month'), +this.getAttribute('data-year'), this);
                        return false;
                    },
                    selectMonth: function () {
                        window['DP_jQuery_' + dpuuid].datepicker._selectMonthYear(id, this, 'M');
                        return false;
                    },
                    selectYear: function () {
                        window['DP_jQuery_' + dpuuid].datepicker._selectMonthYear(id, this, 'Y');
                        return false;
                    }
                };
                $(this).bind(this.getAttribute('data-event'), handler[this.getAttribute('data-handler')]);
            });
        },

        /* Generate the HTML for the current state of the date picker. */
        _generateHTML: function (inst) {
            var today = new Date();
            today = this._daylightSavingAdjust(
			new Date(today.getFullYear(), today.getMonth(), today.getDate())); // clear time
            var isRTL = this._get(inst, 'isRTL');
            var showButtonPanel = this._get(inst, 'showButtonPanel');
            var hideIfNoPrevNext = this._get(inst, 'hideIfNoPrevNext');
            var navigationAsDateFormat = this._get(inst, 'navigationAsDateFormat');
            var numMonths = this._getNumberOfMonths(inst);
            var showCurrentAtPos = this._get(inst, 'showCurrentAtPos');
            var stepMonths = this._get(inst, 'stepMonths');
            var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
            var currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
			new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
            var minDate = this._getMinMaxDate(inst, 'min');
            var maxDate = this._getMinMaxDate(inst, 'max');
            var drawMonth = inst.drawMonth - showCurrentAtPos;
            var drawYear = inst.drawYear;
            if (drawMonth < 0) {
                drawMonth += 12;
                drawYear--;
            }
            if (maxDate) {
                var maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
				maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
                maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
                while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
                    drawMonth--;
                    if (drawMonth < 0) {
                        drawMonth = 11;
                        drawYear--;
                    }
                }
            }
            inst.drawMonth = drawMonth;
            inst.drawYear = drawYear;
            var prevText = this._get(inst, 'prevText');
            prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
			this._getFormatConfig(inst)));
            var prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
			'<a class="ui-datepicker-prev ui-corner-all" data-handler="prev" data-event="click"' +
			' title="' + prevText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>' :
			(hideIfNoPrevNext ? '' : '<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="' + prevText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>'));
            var nextText = this._get(inst, 'nextText');
            nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
			this._getFormatConfig(inst)));
            var next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
			'<a class="ui-datepicker-next ui-corner-all" data-handler="next" data-event="click"' +
			' title="' + nextText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>' :
			(hideIfNoPrevNext ? '' : '<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="' + nextText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>'));
            var currentText = this._get(inst, 'currentText');
            var gotoDate = (this._get(inst, 'gotoCurrent') && inst.currentDay ? currentDate : today);
            currentText = (!navigationAsDateFormat ? currentText :
			this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));
            var controls = (!inst.inline ? '<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">' +
			this._get(inst, 'closeText') + '</button>' : '');
            var buttonPanel = (showButtonPanel) ? '<div class="ui-datepicker-buttonpane ui-widget-content">' + (isRTL ? controls : '') +
			(this._isInRange(inst, gotoDate) ? '<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" data-handler="today" data-event="click"' +
			'>' + currentText + '</button>' : '') + (isRTL ? '' : controls) + '</div>' : '';
            var firstDay = parseInt(this._get(inst, 'firstDay'), 10);
            firstDay = (isNaN(firstDay) ? 0 : firstDay);
            var showWeek = this._get(inst, 'showWeek');
            var dayNames = this._get(inst, 'dayNames');
            var dayNamesShort = this._get(inst, 'dayNamesShort');
            var dayNamesMin = this._get(inst, 'dayNamesMin');
            var monthNames = this._get(inst, 'monthNames');
            var monthNamesShort = this._get(inst, 'monthNamesShort');
            var beforeShowDay = this._get(inst, 'beforeShowDay');
            var showOtherMonths = this._get(inst, 'showOtherMonths');
            var selectOtherMonths = this._get(inst, 'selectOtherMonths');
            var calculateWeek = this._get(inst, 'calculateWeek') || this.iso8601Week;
            var defaultDate = this._getDefaultDate(inst);
            var html = '';
            for (var row = 0; row < numMonths[0]; row++) {
                var group = '';
                this.maxRows = 4;
                for (var col = 0; col < numMonths[1]; col++) {
                    var selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
                    var cornerClass = ' ui-corner-all';
                    var calender = '';
                    if (isMultiMonth) {
                        calender += '<div class="ui-datepicker-group';
                        if (numMonths[1] > 1)
                            switch (col) {
                            case 0: calender += ' ui-datepicker-group-first';
                                cornerClass = ' ui-corner-' + (isRTL ? 'right' : 'left'); break;
                            case numMonths[1] - 1: calender += ' ui-datepicker-group-last';
                                cornerClass = ' ui-corner-' + (isRTL ? 'left' : 'right'); break;
                            default: calender += ' ui-datepicker-group-middle'; cornerClass = ''; break;
                        }
                        calender += '">';
                    }
                    calender += '<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix' + cornerClass + '">' +
					(/all|left/.test(cornerClass) && row == 0 ? (isRTL ? next : prev) : '') +
					(/all|right/.test(cornerClass) && row == 0 ? (isRTL ? prev : next) : '') +
					this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
					row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
					'</div><table class="ui-datepicker-calendar"><thead>' +
					'<tr>';
                    var thead = (showWeek ? '<th class="ui-datepicker-week-col">' + this._get(inst, 'weekHeader') + '</th>' : '');
                    for (var dow = 0; dow < 7; dow++) { // days of the week
                        var day = (dow + firstDay) % 7;
                        thead += '<th' + ((dow + firstDay + 6) % 7 >= 5 ? ' class="ui-datepicker-week-end"' : '') + '>' +
						'<span title="' + dayNames[day] + '">' + dayNamesMin[day] + '</span></th>';
                    }
                    calender += thead + '</tr></thead><tbody>';
                    var daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                    if (drawYear == inst.selectedYear && drawMonth == inst.selectedMonth)
                        inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
                    // ATDW modification - consistent calendar display across months of varied lengths
                    var leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                    var curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
                    this.maxRows = Math.max(this.maxRows, curRows); // update maxRows, for the largest number of rows (biggest month)
                    var printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
                    for (var dRow = 0; dRow < curRows; dRow++) { // create date picker rows
                        calender += '<tr>';
                        var tbody = (!showWeek ? '' : '<td class="ui-datepicker-week-col">' +
						this._get(inst, 'calculateWeek')(printDate) + '</td>');
                        for (var dow = 0; dow < 7; dow++) { // create date picker days
                            var daySettings = (beforeShowDay ?
							beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, '']);
                            var otherMonth = (printDate.getMonth() != drawMonth);
                            var unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
							(minDate && printDate < minDate) || (maxDate && printDate > maxDate);
                            tbody += '<td class="' +
							((dow + firstDay + 6) % 7 >= 5 ? ' ui-datepicker-week-end' : '') + // highlight weekends
							(otherMonth ? ' ui-datepicker-other-month' : '') + // highlight days from other months
							((printDate.getTime() == selectedDate.getTime() && drawMonth == inst.selectedMonth && inst._keyEvent) || // user pressed key
							(defaultDate.getTime() == printDate.getTime() && defaultDate.getTime() == selectedDate.getTime()) ?
                            // or defaultDate is current printedDate and defaultDate is selectedDate
							' ' + this._dayOverClass : '') + // highlight selected day
							(unselectable ? ' ' + this._unselectableClass + ' ui-state-disabled' : '') +  // highlight unselectable days
							(otherMonth && !showOtherMonths ? '' : ' ' + daySettings[1] + // highlight custom dates
							(printDate.getTime() == currentDate.getTime() ? ' ' + this._currentClass : '') + // highlight selected day
							(printDate.getTime() == today.getTime() ? ' ui-datepicker-today' : '')) + '"' + // highlight today (if different)
							((!otherMonth || showOtherMonths) && daySettings[2] ? ' title="' + daySettings[2] + '"' : '') + // cell title
							(unselectable ? '' : ' data-handler="selectDay" data-event="click" data-month="' + printDate.getMonth() + '" data-year="' + printDate.getFullYear() + '"') + '>' + // actions
							(otherMonth && !showOtherMonths ? '&#xa0;' : // display for other months
							(unselectable ? '<span class="ui-state-default">' + printDate.getDate() + '</span>' : '<a class="ui-state-default' +
							(printDate.getTime() == today.getTime() ? ' ui-state-highlight' : '') +
							(printDate.getTime() == currentDate.getTime() ? ' ui-state-active' : '') + // highlight selected day
							(otherMonth ? ' ui-priority-secondary' : '') + // distinguish dates from other months
							'" href="#">' + printDate.getDate() + '</a>')) + '</td>'; // display selectable date
                            printDate.setDate(printDate.getDate() + 1);
                            printDate = this._daylightSavingAdjust(printDate);
                        }
                        calender += tbody + '</tr>';
                    }
                    drawMonth++;
                    if (drawMonth > 11) {
                        drawMonth = 0;
                        drawYear++;
                    }
                    calender += '</tbody></table>' + (isMultiMonth ? '</div>' +
							((numMonths[0] > 0 && col == numMonths[1] - 1) ? '<div class="ui-datepicker-row-break"></div>' : '') : '');
                    group += calender;
                }
                html += group;
            }
            html += buttonPanel + ($.browser.msie && parseInt($.browser.version, 10) < 7 && !inst.inline ?
			'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>' : '');
            inst._keyEvent = false;
            return html;
        },

        /* Generate the month and year header. */
        _generateMonthYearHeader: function (inst, drawMonth, drawYear, minDate, maxDate,
			secondary, monthNames, monthNamesShort) {
            var changeMonth = this._get(inst, 'changeMonth');
            var changeYear = this._get(inst, 'changeYear');
            var showMonthAfterYear = this._get(inst, 'showMonthAfterYear');
            var html = '<div class="ui-datepicker-title">';
            var monthHtml = '';
            // month selection
            if (secondary || !changeMonth)
                monthHtml += '<span class="ui-datepicker-month">' + monthNames[drawMonth] + '</span>';
            else {
                var inMinYear = (minDate && minDate.getFullYear() == drawYear);
                var inMaxYear = (maxDate && maxDate.getFullYear() == drawYear);
                monthHtml += '<select class="ui-datepicker-month" data-handler="selectMonth" data-event="change">';
                for (var month = 0; month < 12; month++) {
                    if ((!inMinYear || month >= minDate.getMonth()) &&
						(!inMaxYear || month <= maxDate.getMonth()))
                        monthHtml += '<option value="' + month + '"' +
						(month == drawMonth ? ' selected="selected"' : '') +
						'>' + monthNamesShort[month] + '</option>';
                }
                monthHtml += '</select>';
            }
            if (!showMonthAfterYear)
                html += monthHtml + (secondary || !(changeMonth && changeYear) ? '&#xa0;' : '');
            // year selection
            if (!inst.yearshtml) {
                inst.yearshtml = '';
                if (secondary || !changeYear)
                    html += '<span class="ui-datepicker-year">' + drawYear + '</span>';
                else {
                    // determine range of years to display
                    var years = this._get(inst, 'yearRange').split(':');
                    var thisYear = new Date().getFullYear();
                    var determineYear = function (value) {
                        var year = (value.match(/c[+-].*/) ? drawYear + parseInt(value.substring(1), 10) :
						(value.match(/[+-].*/) ? thisYear + parseInt(value, 10) :
						parseInt(value, 10)));
                        return (isNaN(year) ? thisYear : year);
                    };
                    var year = determineYear(years[0]);
                    var endYear = Math.max(year, determineYear(years[1] || ''));
                    year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
                    endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
                    inst.yearshtml += '<select class="ui-datepicker-year" data-handler="selectYear" data-event="change">';
                    for (; year <= endYear; year++) {
                        inst.yearshtml += '<option value="' + year + '"' +
						(year == drawYear ? ' selected="selected"' : '') +
						'>' + year + '</option>';
                    }
                    inst.yearshtml += '</select>';

                    html += inst.yearshtml;
                    inst.yearshtml = null;
                }
            }
            html += this._get(inst, 'yearSuffix');
            if (showMonthAfterYear)
                html += (secondary || !(changeMonth && changeYear) ? '&#xa0;' : '') + monthHtml;
            html += '</div>'; // Close datepicker_header
            return html;
        },

        /* Adjust one of the date sub-fields. */
        _adjustInstDate: function (inst, offset, period) {
            var year = inst.drawYear + (period == 'Y' ? offset : 0);
            var month = inst.drawMonth + (period == 'M' ? offset : 0);
            var day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) +
			(period == 'D' ? offset : 0);
            var date = this._restrictMinMax(inst,
			this._daylightSavingAdjust(new Date(year, month, day)));
            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            if (period == 'M' || period == 'Y')
                this._notifyChange(inst);
        },

        /* Ensure a date is within any min/max bounds. */
        _restrictMinMax: function (inst, date) {
            var minDate = this._getMinMaxDate(inst, 'min');
            var maxDate = this._getMinMaxDate(inst, 'max');
            var newDate = (minDate && date < minDate ? minDate : date);
            newDate = (maxDate && newDate > maxDate ? maxDate : newDate);
            return newDate;
        },

        /* Notify change of month/year. */
        _notifyChange: function (inst) {
            var onChange = this._get(inst, 'onChangeMonthYear');
            if (onChange)
                onChange.apply((inst.input ? inst.input[0] : null),
				[inst.selectedYear, inst.selectedMonth + 1, inst]);
        },

        /* Determine the number of months to show. */
        _getNumberOfMonths: function (inst) {
            var numMonths = this._get(inst, 'numberOfMonths');
            return (numMonths == null ? [1, 1] : (typeof numMonths == 'number' ? [1, numMonths] : numMonths));
        },

        /* Determine the current maximum date - ensure no time components are set. */
        _getMinMaxDate: function (inst, minMax) {
            return this._determineDate(inst, this._get(inst, minMax + 'Date'), null);
        },

        /* Find the number of days in a given month. */
        _getDaysInMonth: function (year, month) {
            return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();
        },

        /* Find the day of the week of the first of a month. */
        _getFirstDayOfMonth: function (year, month) {
            return new Date(year, month, 1).getDay();
        },

        /* Determines if we should allow a "next/prev" month display change. */
        _canAdjustMonth: function (inst, offset, curYear, curMonth) {
            var numMonths = this._getNumberOfMonths(inst);
            var date = this._daylightSavingAdjust(new Date(curYear,
			curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1));
            if (offset < 0)
                date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
            return this._isInRange(inst, date);
        },

        /* Is the given date in the accepted range? */
        _isInRange: function (inst, date) {
            var minDate = this._getMinMaxDate(inst, 'min');
            var maxDate = this._getMinMaxDate(inst, 'max');
            return ((!minDate || date.getTime() >= minDate.getTime()) &&
			(!maxDate || date.getTime() <= maxDate.getTime()));
        },

        /* Provide the configuration settings for formatting/parsing. */
        _getFormatConfig: function (inst) {
            var shortYearCutoff = this._get(inst, 'shortYearCutoff');
            shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
			new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
            return { shortYearCutoff: shortYearCutoff,
                dayNamesShort: this._get(inst, 'dayNamesShort'), dayNames: this._get(inst, 'dayNames'),
                monthNamesShort: this._get(inst, 'monthNamesShort'), monthNames: this._get(inst, 'monthNames')
            };
        },

        /* Format the given date for display. */
        _formatDate: function (inst, day, month, year) {
            if (!day) {
                inst.currentDay = inst.selectedDay;
                inst.currentMonth = inst.selectedMonth;
                inst.currentYear = inst.selectedYear;
            }
            var date = (day ? (typeof day == 'object' ? day :
			this._daylightSavingAdjust(new Date(year, month, day))) :
			this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
            return this.formatDate(this._get(inst, 'dateFormat'), date, this._getFormatConfig(inst));
        }
    });

    /*
    * Bind hover events for datepicker elements.
    * Done via delegate so the binding only occurs once in the lifetime of the parent div.
    * Global instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
    */
    function bindHover(dpDiv) {
        var selector = 'button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';
        return dpDiv.bind('mouseout', function (event) {
            var elem = $(event.target).closest(selector);
            if (!elem.length) {
                return;
            }
            elem.removeClass("ui-state-hover ui-datepicker-prev-hover ui-datepicker-next-hover");
        })
		.bind('mouseover', function (event) {
		    var elem = $(event.target).closest(selector);
		    if ($.datepicker._isDisabledDatepicker(instActive.inline ? dpDiv.parent()[0] : instActive.input[0]) ||
					!elem.length) {
		        return;
		    }
		    elem.parents('.ui-datepicker-calendar').find('a').removeClass('ui-state-hover');
		    elem.addClass('ui-state-hover');
		    if (elem.hasClass('ui-datepicker-prev')) elem.addClass('ui-datepicker-prev-hover');
		    if (elem.hasClass('ui-datepicker-next')) elem.addClass('ui-datepicker-next-hover');
		});
    }

    /* jQuery extend now ignores nulls! */
    function extendRemove(target, props) {
        $.extend(target, props);
        for (var name in props)
            if (props[name] == null || props[name] == undefined)
                target[name] = props[name];
        return target;
    };

    /* Determine whether an object is an array. */
    function isArray(a) {
        return (a && (($.browser.safari && typeof a == 'object' && a.length) ||
		(a.constructor && a.constructor.toString().match(/\Array\(\)/))));
    };

    /* Invoke the datepicker functionality.
    @param  options  string - a command, optionally followed by additional parameters or
    Object - settings for attaching new datepicker functionality
    @return  jQuery object */
    $.fn.datepicker = function (options) {

        /* Verify an empty collection wasn't passed - Fixes #6976 */
        if (!this.length) {
            return this;
        }

        /* Initialise the date picker. */
        if (!$.datepicker.initialized) {
            $(document).mousedown($.datepicker._checkExternalClick).
			find('body').append($.datepicker.dpDiv);
            $.datepicker.initialized = true;
        }

        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options == 'string' && (options == 'isDisabled' || options == 'getDate' || options == 'widget'))
            return $.datepicker['_' + options + 'Datepicker'].
			apply($.datepicker, [this[0]].concat(otherArgs));
        if (options == 'option' && arguments.length == 2 && typeof arguments[1] == 'string')
            return $.datepicker['_' + options + 'Datepicker'].
			apply($.datepicker, [this[0]].concat(otherArgs));
        return this.each(function () {
            typeof options == 'string' ?
			$.datepicker['_' + options + 'Datepicker'].
				apply($.datepicker, [this].concat(otherArgs)) :
			$.datepicker._attachDatepicker(this, options);
        });
    };

    $.datepicker = new Datepicker(); // singleton instance
    $.datepicker.initialized = false;
    $.datepicker.uuid = new Date().getTime();
    $.datepicker.version = "1.8.22";

    // Workaround for #4055
    // Add another global to avoid noConflict issues with inline event handlers
    window['DP_jQuery_' + dpuuid] = $;

})(jQuery);
/*
* MultiDatesPicker v1.6.1
* http://multidatespickr.sourceforge.net/
* 
* Copyright 2011, Luca Lauretta
* Dual licensed under the MIT or GPL version 2 licenses.
*/
(function ($) {
    $.extend($.ui, { multiDatesPicker: { version: "1.6.1"} });

    $.fn.multiDatesPicker = function (method) {
        var mdp_arguments = arguments;
        var ret = this;
        var today_date = new Date();
        var day_zero = new Date(0);
        var mdp_events = {};

        function removeDate(date, type) {
            if (!type) type = 'picked';
            date = dateConvert.call(this, date);
            for (var i in this.multiDatesPicker.dates[type])
                if (!methods.compareDates(this.multiDatesPicker.dates[type][i], date))
                    return this.multiDatesPicker.dates[type].splice(i, 1).pop();
        }
        function removeIndex(index, type) {
            if (!type) type = 'picked';
            return this.multiDatesPicker.dates[type].splice(index, 1).pop();
        }
        function addDate(date, type, no_sort) {
            if (!type) type = 'picked';
            date = dateConvert.call(this, date);

            // @todo: use jQuery UI datepicker method instead
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            if (methods.gotDate.call(this, date, type) === false) {
                this.multiDatesPicker.dates[type].push(date);
                if (!no_sort) this.multiDatesPicker.dates[type].sort(methods.compareDates);
            }
        }
        function sortDates(type) {
            if (!type) type = 'picked';
            this.multiDatesPicker.dates[type].sort(methods.compareDates);
        }
        function dateConvert(date, desired_type, date_format) {
            if (!desired_type) desired_type = 'object'; /*
			if(!date_format && (typeof date == 'string')) {
				date_format = $(this).datepicker('option', 'dateFormat');
				if(!date_format) date_format = $.datepicker._defaults.dateFormat;
			}
			*/
            return methods.dateConvert.call(this, date, desired_type, date_format);
        }

        var methods = {
            init: function (options) {
                var $this = $(this);
                this.multiDatesPicker.changed = false;

                var mdp_events = {
                    beforeShow: function (input, inst) {
                        this.multiDatesPicker.changed = false;
                        if (this.multiDatesPicker.originalBeforeShow)
                            this.multiDatesPicker.originalBeforeShow.call(this, input, inst);
                    },
                    onSelect: function (dateText, inst) {
                        var $this = $(this);
                        this.multiDatesPicker.changed = true;

                        if (dateText) {
                            $this.multiDatesPicker('toggleDate', dateText);
                        }

                        if (this.multiDatesPicker.mode == 'normal' && this.multiDatesPicker.dates.picked.length > 0 && this.multiDatesPicker.pickableRange) {
                            var min_date = this.multiDatesPicker.dates.picked[0],
								max_date = new Date(min_date.getTime());

                            methods.sumDays(max_date, this.multiDatesPicker.pickableRange - 1);

                            // counts the number of disabled dates in the range
                            if (this.multiDatesPicker.adjustRangeToDisabled) {
                                var c_disabled,
									disabled = this.multiDatesPicker.dates.disabled.slice(0);
                                do {
                                    c_disabled = 0;
                                    for (var i = 0; i < disabled.length; i++) {
                                        if (disabled[i].getTime() <= max_date.getTime()) {
                                            if ((min_date.getTime() <= disabled[i].getTime()) && (disabled[i].getTime() <= max_date.getTime())) {
                                                c_disabled++;
                                            }
                                            disabled.splice(i, 1);
                                            i--;
                                        }
                                    }
                                    max_date.setDate(max_date.getDate() + c_disabled);
                                } while (c_disabled != 0);
                            }

                            if (this.multiDatesPicker.maxDate && (max_date > this.multiDatesPicker.maxDate))
                                max_date = this.multiDatesPicker.maxDate;

                            $this
								.datepicker("option", "minDate", min_date)
								.datepicker("option", "maxDate", max_date);
                        } else {
                            $this
								.datepicker("option", "minDate", this.multiDatesPicker.minDate)
								.datepicker("option", "maxDate", this.multiDatesPicker.maxDate);
                        }

                        if (this.tagName == 'INPUT') { // for inputs
                            $this.val(
								$this.multiDatesPicker('getDates', 'string')
							);
                        }

                        if (this.multiDatesPicker.originalOnSelect && dateText)
                            this.multiDatesPicker.originalOnSelect.call(this, dateText, inst);

                        // thanks to bibendus83 -> http://sourceforge.net/tracker/?func=detail&atid=1495384&aid=3403159&group_id=358205
                        if ($this.datepicker('option', 'altField') != undefined && $this.datepicker('option', 'altField') != "") {
                            $($this.datepicker('option', 'altField')).val(
								$this.multiDatesPicker('getDates', 'string')
							);
                        }
                    },
                    beforeShowDay: function (date) {
                        var $this = $(this),
							gotThisDate = $this.multiDatesPicker('gotDate', date) !== false,
							isDisabledCalendar = $this.datepicker('option', 'disabled'),
							isDisabledDate = $this.multiDatesPicker('gotDate', date, 'disabled') !== false,
							areAllSelected = this.multiDatesPicker.maxPicks == this.multiDatesPicker.dates.picked.length;

                        var custom = [true, ''];
                        if (this.multiDatesPicker.originalBeforeShowDay)
                            custom = this.multiDatesPicker.originalBeforeShowDay.call(this, date);

                        var highlight_class = gotThisDate ? 'ui-state-highlight' : custom[1];
                        var selectable_date = !(isDisabledCalendar || isDisabledDate || (areAllSelected && !highlight_class));
                        return [selectable_date && custom[0], highlight_class];
                    },
                    onClose: function (dateText, inst) {
                        if (this.tagName == 'INPUT' && this.multiDatesPicker.changed) {
                            $(inst.dpDiv[0]).stop(false, true);
                            setTimeout('$("#' + inst.id + '").datepicker("show")', 50);
                        }
                        if (this.multiDatesPicker.originalOnClose) this.multiDatesPicker.originalOnClose.call(this, dateText, inst);
                    }
                };

                if (options) {
                    this.multiDatesPicker.originalBeforeShow = options.beforeShow;
                    this.multiDatesPicker.originalOnSelect = options.onSelect;
                    this.multiDatesPicker.originalBeforeShowDay = options.beforeShowDay;
                    this.multiDatesPicker.originalOnClose = options.onClose;

                    $this.datepicker(options);

                    this.multiDatesPicker.minDate = $.datepicker._determineDate(this, options.minDate, null);
                    this.multiDatesPicker.maxDate = $.datepicker._determineDate(this, options.maxDate, null);

                    if (options.addDates) methods.addDates.call(this, options.addDates);
                    if (options.addDisabledDates)
                        methods.addDates.call(this, options.addDisabledDates, 'disabled');

                    methods.setMode.call(this, options);
                } else {
                    $this.datepicker();
                }

                $this.datepicker('option', mdp_events);

                if (this.tagName == 'INPUT') $this.val($this.multiDatesPicker('getDates', 'string'));

                // Fixes the altField filled with defaultDate by default
                var altFieldOption = $this.datepicker('option', 'altField');
                if (altFieldOption) $(altFieldOption).val($this.multiDatesPicker('getDates', 'string'));
            },
            compareDates: function (date1, date2) {
                date1 = dateConvert.call(this, date1);
                date2 = dateConvert.call(this, date2);
                // return > 0 means date1 is later than date2 
                // return == 0 means date1 is the same day as date2 
                // return < 0 means date1 is earlier than date2 
                var diff = date1.getFullYear() - date2.getFullYear();
                if (!diff) {
                    diff = date1.getMonth() - date2.getMonth();
                    if (!diff)
                        diff = date1.getDate() - date2.getDate();
                }
                return diff;
            },
            sumDays: function (date, n_days) {
                var origDateType = typeof date;
                obj_date = dateConvert.call(this, date);
                obj_date.setDate(obj_date.getDate() + n_days);
                return dateConvert.call(this, obj_date, origDateType);
            },
            dateConvert: function (date, desired_format, dateFormat) {
                var from_format = typeof date;

                if (from_format == desired_format) {
                    if (from_format == 'object') {
                        try {
                            date.getTime();
                        } catch (e) {
                            $.error('Received date is in a non supported format!');
                            return false;
                        }
                    }
                    return date;
                }

                var $this = $(this);
                if (typeof date == 'undefined') date = new Date(0);

                if (desired_format != 'string' && desired_format != 'object' && desired_format != 'number')
                    $.error('Date format "' + desired_format + '" not supported!');

                if (!dateFormat) {
                    dateFormat = $.datepicker._defaults.dateFormat;

                    // thanks to bibendus83 -> http://sourceforge.net/tracker/index.php?func=detail&aid=3213174&group_id=358205&atid=1495382
                    var dp_dateFormat = $this.datepicker('option', 'dateFormat');
                    if (dp_dateFormat) {
                        dateFormat = dp_dateFormat;
                    }
                }

                // converts to object as a neutral format
                switch (from_format) {
                    case 'object': break;
                    case 'string': date = $.datepicker.parseDate(dateFormat, date); break;
                    case 'number': date = new Date(date); break;
                    default: $.error('Conversion from "' + desired_format + '" format not allowed on jQuery.multiDatesPicker');
                }
                // then converts to the desired format
                switch (desired_format) {
                    case 'object': return date;
                    case 'string': return $.datepicker.formatDate(dateFormat, date);
                    case 'number': return date.getTime();
                    default: $.error('Conversion to "' + desired_format + '" format not allowed on jQuery.multiDatesPicker');
                }
                return false;
            },
            gotDate: function (date, type) {
                if (!type) type = 'picked';
                for (var i = 0; i < this.multiDatesPicker.dates[type].length; i++) {
                    if (methods.compareDates.call(this, this.multiDatesPicker.dates[type][i], date) === 0) {
                        return i;
                    }
                }
                return false;
            },
            getDates: function (format, type) {
                if (!format) format = 'string';
                if (!type) type = 'picked';
                switch (format) {
                    case 'object':
                        return this.multiDatesPicker.dates[type];
                    case 'string':
                    case 'number':
                        var o_dates = new Array();
                        for (var i in this.multiDatesPicker.dates[type])
                            o_dates.push(
								dateConvert.call(
									this,
									this.multiDatesPicker.dates[type][i],
									format
								)
							);
                        return o_dates;

                    default: $.error('Format "' + format + '" not supported!');
                }
            },
            addDates: function (dates, type) {
                if (dates.length > 0) {
                    if (!type) type = 'picked';
                    switch (typeof dates) {
                        case 'object':
                        case 'array':
                            if (dates.length) {
                                for (var i in dates)
                                    addDate.call(this, dates[i], type, true);
                                sortDates.call(this, type);
                                break;
                            } // else does the same as 'string'
                        case 'string':
                        case 'number':
                            addDate.call(this, dates, type);
                            break;
                        default:
                            $.error('Date format "' + typeof dates + '" not allowed on jQuery.multiDatesPicker');
                    }
                    $(this).datepicker('refresh');
                } else {
                    $.error('Empty array of dates received.');
                }
            },
            removeDates: function (dates, type) {
                if (!type) type = 'picked';
                var removed = [];
                if (Object.prototype.toString.call(dates) === '[object Array]') {
                    for (var i in dates.sort(function (a, b) { return b - a })) {
                        removed.push(removeDate.call(this, dates[i], type));
                    }
                } else {
                    removed.push(removeDate.call(this, dates, type));
                }
                $(this).datepicker('refresh');
                return removed;
            },
            removeIndexes: function (indexes, type) {
                if (!type) type = 'picked';
                var removed = [];
                if (Object.prototype.toString.call(indexes) === '[object Array]') {
                    for (var i in indexes.sort(function (a, b) { return b - a })) {
                        removed.push(removeIndex.call(this, indexes[i], type));
                    }
                } else {
                    removed.push(removeIndex.call(this, indexes, type));
                }
                $(this).datepicker('refresh');
                return removed;
            },
            resetDates: function (type) {
                if (!type) type = 'picked';
                this.multiDatesPicker.dates[type] = [];
                $(this).datepicker('refresh');
            },
            toggleDate: function (date, type) {
                if (!type) type = 'picked';

                switch (this.multiDatesPicker.mode) {
                    case 'daysRange':
                        this.multiDatesPicker.dates[type] = []; // deletes all picked/disabled dates
                        var end = this.multiDatesPicker.autoselectRange[1];
                        var begin = this.multiDatesPicker.autoselectRange[0];
                        if (end < begin) { // switch
                            end = this.multiDatesPicker.autoselectRange[0];
                            begin = this.multiDatesPicker.autoselectRange[1];
                        }
                        for (var i = begin; i < end; i++)
                            methods.addDates.call(this, methods.sumDays(date, i), type);
                        break;
                    default:
                        if (methods.gotDate.call(this, date) === false) // adds dates
                            methods.addDates.call(this, date, type);
                        else // removes dates
                            methods.removeDates.call(this, date, type);
                        break;
                }
            },
            setMode: function (options) {
                var $this = $(this);
                if (options.mode) this.multiDatesPicker.mode = options.mode;

                switch (this.multiDatesPicker.mode) {
                    case 'normal':
                        for (option in options)
                            switch (option) {
                            case 'maxPicks':
                            case 'minPicks':
                            case 'pickableRange':
                            case 'adjustRangeToDisabled':
                                this.multiDatesPicker[option] = options[option];
                                break;
                            //default: $.error('Option ' + option + ' ignored for mode "'.options.mode.'".'); 
                        }
                        break;
                    case 'daysRange':
                    case 'weeksRange':
                        var mandatory = 1;
                        for (option in options)
                            switch (option) {
                            case 'autoselectRange':
                                mandatory--;
                            case 'pickableRange':
                            case 'adjustRangeToDisabled':
                                this.multiDatesPicker[option] = options[option];
                                break;
                            //default: $.error('Option ' + option + ' does not exist for setMode on jQuery.multiDatesPicker'); 
                        }
                        if (mandatory > 0) $.error('Some mandatory options not specified!');
                        break;
                }

                /*
                if(options.pickableRange) {
                $this.datepicker("option", "maxDate", options.pickableRange);
                $this.datepicker("option", "minDate", this.multiDatesPicker.minDate);
                }
                */

                if (mdp_events.onSelect)
                    mdp_events.onSelect();
                $this.datepicker('refresh');
            }
        };

        this.each(function () {
            if (!this.multiDatesPicker) {
                this.multiDatesPicker = {
                    dates: {
                        picked: [],
                        disabled: []
                    },
                    mode: 'normal',
                    adjustRangeToDisabled: true
                };
            }

            if (methods[method]) {
                var exec_result = methods[method].apply(this, Array.prototype.slice.call(mdp_arguments, 1));
                switch (method) {
                    case 'getDates':
                    case 'removeDates':
                    case 'gotDate':
                    case 'sumDays':
                    case 'compareDates':
                    case 'dateConvert':
                        ret = exec_result;
                }
                return exec_result;
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, mdp_arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.multiDatesPicker');
            }
            return false;
        });

        if (method != 'gotDate' && method != 'getDates') {
            aaaa = 1;
        }

        return ret;
    };

    var PROP_NAME = 'multiDatesPicker';
    var dpuuid = new Date().getTime();
    var instActive;

    $.multiDatesPicker = { version: false };
    //$.multiDatesPicker = new MultiDatesPicker(); // singleton instance
    $.multiDatesPicker.initialized = false;
    $.multiDatesPicker.uuid = new Date().getTime();
    $.multiDatesPicker.version = $.ui.multiDatesPicker.version;

    // Workaround for #4055
    // Add another global to avoid noConflict issues with inline event handlers
    window['DP_jQuery_' + dpuuid] = $;
})(jQuery);/*!
* CacheJS - implements a key/val store with expiry.
* Swappable storage modules (array, cookie, localstorage)
* Homepage: http://code.google.com/p/cachejs
*/
var cache = function () {

    /* public */
    var my = {
        /**
        * Sets the storage object to use.
        * On invalid store being passed, current store is not affected.
        * @param new_store store.
        * @return boolean true if new_store implements the required methods and was set to this cache's store. else false
        */
        setStore: function (new_store) {
            if (typeof new_store == "function") {
                new_store = new_store();
                if (new_store.get && new_store.set && new_store.kill && new_store.killall && new_store.has) {
                    store = new_store;
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        /**
        * Returns true if cache contains the key, else false
        * @param key string the key to search for
        * @return boolean
        */
        has: function (key) {
            return store.has(key);
        },
        /**
        * Removes a key from the cache
        * @param key string the key to remove for
        * @return boolean
        */
        kill: function (key) {
            store.kill(key);
            return store.has(key);
        },
        /**
        * AG: ATDW addition
        * Removes all keys from the cache
        * @return the store
        */
        killall: function () {
            store.killall();
            return store;
        },
        /**
        * AG: ATDW addition
        * Checks if cache is empty
        * @return boolean: true if empty
        */
        empty: function () {
            return store.empty();
        },
        /**
        * Gets the expiry date for given key
        * @param key string. The key to get
        * @return mixed, value for key or NULL if no such key
        */
        getExpiry: function (key) {
            var exp = get(key, EXPIRES);
            if (exp != false && exp != null) {
                exp = new Date(exp);
            }
            return exp;
        },
        /**
        * Sets the expiry date for given key
        * @param key string. The key to set
        * @param expiry; RFC1123 date or false for no expiry
        * @return mixed, value for key or NULL if no such key
        */
        setExpiry: function (key, expiry) {
            if (store.has(key)) {
                storedVal = store.get(key);
                if (!expiry)
                    expiry = DEFAULT_EXPIRY;
                storedVal[EXPIRES] = makeValidExpiry(expiry);
                store.set(key, storedVal);
                return my.getExpiry(key);
            } else {
                return NOSUCHKEY;
            }
        },
        /**
        * AG: ATDW addition
        * Sets the default expiry date on additions to the cache
        * @return true if the action was successful, false if not (eg. invalid date)
        */
        setDefaultExpiry: function (date) {
            var d = new Date(date);
            // if a javascript Date is invalid, the year returns NaN
            if (isNaN(d.getFullYear()))
                return false;

            DEFAULT_EXPIRY = d;
            return true;
        },
        /**
        * Gets a value from the cache
        * @param key string. The key to fetch
        * @return mixed or NULL if no such key
        */
        get: function (key) {
            return get(key, VALUE);
        },
        /**
        * Sets a value in the cache, returns true on sucess, false on failure.
        * @param key string. the name of this cache object
        * @param val mixed. the value to return when querying against this key value
        * @param expiry RFC1123 date, optional. If not set and is a new key, or set to false, this key never expires
        *                       If not set and is pre-existing key, no change is made to expiry date
        *                       If set to date, key expires on that date.
        */
        set: function (key, val, expiry) {

            if (!expiry)
                expiry = DEFAULT_EXPIRY;

            if (!store.has(key)) {
                // key did not exist; create it
                storedVal = Array();
                storedVal[EXPIRES] = makeValidExpiry(expiry);
                store.set(key, storedVal);
            } else {
                // key did already exist
                storedVal = store.get(key);
                if (typeof expiry != "undefined") {
                    // If we've been given an expiry, set it
                    storedVal[EXPIRES] = makeValidExpiry(expiry);
                } // else do not change the existent expiry
            }

            // always set the value
            storedVal[VALUE] = val;
            store.set(key, storedVal);

            return my.get(key);
        }
    };
    /* /public */

    /* private */
    var store = arrayStore();
    var NOSUCHKEY = null;
    var VALUE = 0;
    var EXPIRES = 1;
    var d = new Date();
    var DEFAULT_EXPIRY = d.setTime(d.getTime() + (1000 * 300)); // five minutes

    function get(key, part) {
        if (store.has(key)) {
            // this key exists:

            // get the value
            storedVal = store.get(key);

            var now = new Date();
            if (storedVal[EXPIRES] && Date.parse(storedVal[EXPIRES]) <= now) {
                // key has expired
                // remove from memory
                store.kill(key);
                // return NOSUCHKEY
                return NOSUCHKEY;
            } else if (typeof storedVal[part] != "undefined") {
                // not expired or never expires, and part exists in store[key]
                return storedVal[part];
            } else {
                // part is not a member of store[key]
                return NOSUCHKEY;
            }
        } else {
            // no such key
            return NOSUCHKEY;
        }
    }

    function makeValidExpiry(expiry) {
        if (!expiry) {
            // no expiry given; change from "undefined" to false - this value does not expire.
            expiry = false;
        } else {
            // force to date type
            expiry = new Date(expiry);
        }

        return expiry;
    }

    /* /private */

    return my;
};/*!
* stores.js
* http://code.google.com/p/cachejs
* wraps JSON so we can use a JSON encoder which uses toString and fromString or parse and stringify
*/
var JSONWrapper = function () {
    var my = {
        /**
        * passes control to the JSON object; defaults to JSON.stringify
        */
        toString: function () {
            return JSON.stringify(arguments);
        },
        /**
        * passes control to the JSON object; defaults to JSON.parse
        */
        fromString: function () {
            return JSON.parse(arguments);
        },
        /**
        * sets toString handler
        * @param func reference to toString function, eg this.set_toString(JSON.stringify);
        */
        set_toString: function (func) {
            my.toString = function () {
                // send all arguments to the desired function as an array
                var args = Array.prototype.slice.call(arguments);
                return func(args);
            };
        },
        /**
        * sets fromString handler
        * @param func reference to fromString function, eg this.set_toString(JSON.parse);
        */
        set_fromString: function (func) {
            my.fromString = function () {
                // send all arguments to the desired function as an array
                var args = Array.prototype.slice.call(arguments);
                return func(args);
            };
        }
    };

    return my;
};

/**
* arrayStore - the default Cache storage
*/
var arrayStore = function () {
    var myStore = [];

    var my = {
        has: function (key) {
            return (typeof myStore[key] != "undefined");
        },
        get: function (key) {
            return myStore[key];
        },
        set: function (key, val) {
            myStore[key] = val;
        },
        kill: function (key) {
            delete myStore[key];
        },
        killall: function () {
            myStore = [];
            // normally we'd set mystore.length = 0
            // but in this case cache.js does not set array values traditionally (array.push())
            // instead it basically treats the array like an object. so just create a new one here.
        },
        empty: function () {
            if (myStore.length === 0) {

                // cache.js stores values on the array's keys (instead of indicies - no idea why)
                return Object.keys(myStore).length === 0;
            }
            else {
                return false;
            }
        }
    };

    return my;
};

/**
* localStorageStore.
*/
var localStorageStore = function () {
    var prefix = "atdw_cache_"; // change this if you're developing and want to kill everything ;0)

    var my = {
        has: function (key) {
            return (window.localStorage[prefix + key] != null);
        },
        get: function (key) {
            if (!my.has(key)) {
                return undefined;
            } else {
                return JSON.parse(window.localStorage[prefix + key]);
            }
        },
        set: function (key, val) {
            if (val === undefined) {
                my.kill(key);
            } else {
                window.localStorage[prefix + key] = JSON.stringify(val);
            }
        },
        kill: function (key) {
            window.localStorage.removeItem(prefix + key);
        },
        killall: function () {
            window.localStorage.clear();
        },
        empty: function () {
            if (window.localStorage) {
                return window.localStorage.length === 0;
            } else {
                return true;
            }
        }
    };

    return my;
};

/**
* Cookie Monster Want Cookies.
* I don't recommend the use of this store really; cookies have limited length, and you can only have a limited number of cookies per domain
* It's really only included to show how flexible the pluggable storage system is.
*/
var cookieStore = function () {
    // uses cookie functions from http://www.quirksmode.org/js/cookies.html
    var prefix = "atdw_cache_";
    var nameEQ = prefix + "=";

    var get_expiry_and_path = function (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        return "; expires=" + date.toGMTString() + "; path=/";
    };

    var my = {
        has: function (key) {
            return (my.get(key) !== undefined);
        },
        get: function (key) {
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0) {
                    // found our cookie; split it out for the specified key
                    cookieContents = JSON.parse(c.substring(nameEQ.length, c.length));
                    if (key) {
                        return cookieContents[key];
                    } else {
                        return cookieContents;
                    }
                }
            }
            return undefined;
        },
        set: function (key, val, days) {
            cookieContents = my.get();
            if (cookieContents == null) {
                cookieContents = Object();
            }
            cookieContents[key] = val;
            var stringify = JSON.stringify(cookieContents);
            var cookie = nameEQ + stringify + get_expiry_and_path(days ? days : 1);
            document.cookie = cookie;
        },
        kill: function (key) {
            my.set(key, undefined, -1);
        },
        killall: function () {
            // iterate over all document cookies and kill those with our prefix
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var c = cookies[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0) {
                    // this is one of our cookies, so remove it
                    cookieContents = JSON.parse(c.substring(nameEQ.length, c.length));
                    for (var prop in cookieContents) {
                        if (cookieContents.hasOwnProperty(prop)) {
                            my.kill(prop);
                        }
                    }

                }
            }
        },
        empty: function () {
            // iterate over all document cookies; return true if none of them have our prefix
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var c = cookies[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0) {
                    // this is one of our cookies, so return false as the store is not "empty"

                    return false;
                }
            }
            return true;
        }
    };

    return my;
};

(function () {
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) {
        Object.keys = (function() {
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function(obj) {
                if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object')

                var result = [];

                for (var prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) result.push(prop)
                }

                if (hasDontEnumBug) {
                    for (var i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i])
                    }
                }
                return result;
            };
        })();
    }
    ;
})();//fgnass.github.com/spin.js#v1.2.5
(function (window, document, undefined) {

    /**
    * Copyright (c) 2011 Felix Gnass [fgnass at neteye dot de]
    * Licensed under the MIT license
    */

    var prefixes = ['webkit', 'Moz', 'ms', 'O']; /* Vendor prefixes */
    var animations = {}; /* Animation rules keyed by their name */
    var useCssAnimations;

    /**
    * Utility function to create elements. If no tag name is given,
    * a DIV is created. Optionally properties can be passed.
    */
    function createEl(tag, prop) {
        var el = document.createElement(tag || 'div');
        var n;

        for (n in prop) {
            el[n] = prop[n];
        }
        return el;
    }

    /**
    * Appends children and returns the parent.
    */
    function ins(parent /* child1, child2, ...*/) {
        for (var i = 1, n = arguments.length; i < n; i++) {
            parent.appendChild(arguments[i]);
        }
        return parent;
    }

    /**
    * Insert a new stylesheet to hold the @keyframe or VML rules.
    */
    var sheet = function () {
        var el = createEl('style');
        ins(document.getElementsByTagName('head')[0], el);
        return el.sheet || el.styleSheet;
    } ();

    /**
    * Creates an opacity keyframe animation rule and returns its name.
    * Since most mobile Webkits have timing issues with animation-delay,
    * we create separate rules for each line/segment.
    */
    function addAnimation(alpha, trail, i, lines) {
        var name = ['opacity', trail, ~ ~(alpha * 100), i, lines].join('-');
        var start = 0.01 + i / lines * 100;
        var z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha);
        var prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase();
        var pre = prefix && '-' + prefix + '-' || '';

        if (!animations[name]) {
            sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start + 0.01) + '%{opacity:1}' +
        (start + trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', 0);
            animations[name] = 1;
        }
        return name;
    }

    /**
    * Tries various vendor prefixes and returns the first supported property.
    **/
    function vendor(el, prop) {
        var s = el.style;
        var pp;
        var i;

        if (s[prop] !== undefined) return prop;
        prop = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (i = 0; i < prefixes.length; i++) {
            pp = prefixes[i] + prop;
            if (s[pp] !== undefined) return pp;
        }
    }

    /**
    * Sets multiple style properties at once.
    */
    function css(el, prop) {
        for (var n in prop) {
            el.style[vendor(el, n) || n] = prop[n];
        }
        return el;
    }

    /**
    * Fills in default values.
    */
    function merge(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var def = arguments[i];
            for (var n in def) {
                if (obj[n] === undefined) obj[n] = def[n];
            }
        }
        return obj;
    }

    /**
    * Returns the absolute page-offset of the given element.
    */
    function pos(el) {
        var o = { x: el.offsetLeft, y: el.offsetTop };
        while ((el = el.offsetParent)) {
            o.x += el.offsetLeft;
            o.y += el.offsetTop;
        }
        return o;
    }

    var defaults = {
        lines: 12,            // The number of lines to draw
        length: 7,            // The length of each line
        width: 5,             // The line thickness
        radius: 10,           // The radius of the inner circle
        rotate: 0,            // rotation offset
        color: '#000',        // #rgb or #rrggbb
        speed: 1,             // Rounds per second
        trail: 100,           // Afterglow percentage
        opacity: 1 / 4,         // Opacity of the lines
        fps: 20,              // Frames per second when using setTimeout()
        zIndex: 2e9,          // Use a high z-index by default
        className: 'spinner', // CSS class to assign to the element
        top: 'auto',          // center vertically
        left: 'auto'          // center horizontally
    };

    /** The constructor */
    var Spinner = function Spinner(o) {
        if (!this.spin) return new Spinner(o);
        this.opts = merge(o || {}, Spinner.defaults, defaults);
    };

    Spinner.defaults = {};
    merge(Spinner.prototype, {
        spin: function (target) {
            this.stop();
            var self = this;
            var o = self.opts;
            var el = self.el = css(createEl(0, { className: o.className }), { position: 'relative', zIndex: o.zIndex });
            var mid = o.radius + o.length + o.width;
            var ep; // element position
            var tp; // target position

            if (target) {
                target.insertBefore(el, target.firstChild || null);
                tp = pos(target);
                ep = pos(el);
                css(el, {
                    left: (o.left == 'auto' ? tp.x - ep.x + (target.offsetWidth >> 1) : o.left + mid) + 'px',
                    top: (o.top == 'auto' ? tp.y - ep.y + (target.offsetHeight >> 1) : o.top + mid) + 'px'
                });
            }

            el.setAttribute('aria-role', 'progressbar');
            self.lines(el, self.opts);

            if (!useCssAnimations) {
                // No CSS animation support, use setTimeout() instead
                var i = 0;
                var fps = o.fps;
                var f = fps / o.speed;
                var ostep = (1 - o.opacity) / (f * o.trail / 100);
                var astep = f / o.lines;

                !function anim() {
                    i++;
                    for (var s = o.lines; s; s--) {
                        var alpha = Math.max(1 - (i + s * astep) % f * ostep, o.opacity);
                        self.opacity(el, o.lines - s, alpha, o);
                    }
                    self.timeout = self.el && setTimeout(anim, ~ ~(1000 / fps));
                } ();
            }
            return self;
        },
        stop: function () {
            var el = this.el;
            if (el) {
                clearTimeout(this.timeout);
                if (el.parentNode) el.parentNode.removeChild(el);
                this.el = undefined;
            }
            return this;
        },
        lines: function (el, o) {
            var i = 0;
            var seg;

            function fill(color, shadow) {
                return css(createEl(), {
                    position: 'absolute',
                    width: (o.length + o.width) + 'px',
                    height: o.width + 'px',
                    background: color,
                    boxShadow: shadow,
                    transformOrigin: 'left',
                    transform: 'rotate(' + ~ ~(360 / o.lines * i + o.rotate) + 'deg) translate(' + o.radius + 'px' + ',0)',
                    borderRadius: (o.width >> 1) + 'px'
                });
            }
            for (; i < o.lines; i++) {
                seg = css(createEl(), {
                    position: 'absolute',
                    top: 1 + ~(o.width / 2) + 'px',
                    transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
                    opacity: o.opacity,
                    animation: useCssAnimations && addAnimation(o.opacity, o.trail, i, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
                });
                if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), { top: 2 + 'px' }));
                ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')));
            }
            return el;
        },
        opacity: function (el, i, val) {
            if (i < el.childNodes.length) el.childNodes[i].style.opacity = val;
        }
    });

    /////////////////////////////////////////////////////////////////////////
    // VML rendering for IE
    /////////////////////////////////////////////////////////////////////////

    /**
    * Check and init VML support
    */
    !function () {

        function vml(tag, attr) {
            return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr);
        }

        var s = css(createEl('group'), { behavior: 'url(#default#VML)' });

        if (!vendor(s, 'transform') && s.adj) {

            // VML support detected. Insert CSS rule ...
            sheet.addRule('.spin-vml', 'behavior:url(#default#VML)');

            Spinner.prototype.lines = function (el, o) {
                var r = o.length + o.width;
                var s = 2 * r;

                function grp() {
                    return css(vml('group', { coordsize: s + ' ' + s, coordorigin: -r + ' ' + -r }), { width: s, height: s });
                }

                var margin = -(o.width + o.length) * 2 + 'px';
                var g = css(grp(), { position: 'absolute', top: margin, left: margin });

                var i;

                function seg(i, dx, filter) {
                    ins(g,
            ins(css(grp(), { rotation: 360 / o.lines * i + 'deg', left: ~ ~dx }),
              ins(css(vml('roundrect', { arcsize: 1 }), {
                  width: r,
                  height: o.width,
                  left: o.radius,
                  top: -o.width >> 1,
                  filter: filter
              }),
                vml('fill', { color: o.color, opacity: o.opacity }),
                vml('stroke', { opacity: 0 }) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          );
                }

                if (o.shadow) {
                    for (i = 1; i <= o.lines; i++) {
                        seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)');
                    }
                }
                for (i = 1; i <= o.lines; i++) seg(i);
                return ins(el, g);
            };
            Spinner.prototype.opacity = function (el, i, val, o) {
                var c = el.firstChild;
                o = o.shadow && o.lines || 0;
                if (c && i + o < c.childNodes.length) {
                    c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild;
                    if (c) c.opacity = val;
                }
            };
        }
        else {
            useCssAnimations = vendor(s, 'animation');
        }
    } ();

    window.Spinner = Spinner;

})(window, document);/*!
* atdw.helpers.js
* helpers for ATDW javascript applications
*/
window.atdw = window.atdw || {};
window.atdw.helpers = window.atdw.helpers || (function () {

    var helpers = {};

    /*
    * PUBLIC FUNCTIONS
    ------------------------------------------------------------------------------*/



    // take a state abbreviation code
    // return its full name
    helpers.stateFromAbbreviation = function (abbreviation) {
        switch (abbreviation) {
            case 'VIC':
                return "Victoria";
            case 'NSW':
                return "New South Wales";
            case 'QLD':
                return "Queensland";
            case 'TAS':
                return "Tasmania";
            case 'SA':
                return "South Australia";
            case 'NT':
                return "Northern Territory";
            case 'ACT':
            case 'ACTC':
                return "Australian Capital Territory";
            case 'WA':
                return "Western Australia";
        }

        return null;
    };

    // get the default date for white label site searches
    helpers.buildSearchDateRange = function (selectedDateRange) {
        selectedDateRange = selectedDateRange || "All";

        var d = new Date();
        var dnext = new Date();
        var startString; // the starting date, as formatted for a web service search: 2012-04-21
        var display = d.outputForPrinting(); // the date range, as formatted for search results display: Monday April 21st, 2012 to Friday April 6th, 2012
        var days;
        switch (selectedDateRange) {
            case "All":
                display += ' onwards';
                startString = d.getFullYear() + '-' + d.getMonthForAPISearch() + '-' + d.getDateForAPISearch();
                return [{ range: "Date Range", displayDate: display, start: startString, days: 365}];   // load a year's worth

            case "Today":
                startString = d.getFullYear() + '-' + d.getMonthForAPISearch() + '-' + d.getDateForAPISearch();
                return [{ range: selectedDateRange, displayDate: display, start: startString, days: 1}]; // today

            case "This Weekend":
                d = d.getThisWeekendStartDate();
                startString = d.getFullYear() + '-' + d.getMonthForAPISearch() + '-' + d.getDateForAPISearch();

                dnext.setDate(d.getDate() + 1);
                display = d.outputForPrinting() + ' to ' + dnext.outputForPrinting();

                return [{ range: selectedDateRange, displayDate: display, start: startString, days: 2}]; // today if saturday, yesterday if sunday, otherwise next weekend

            case "This Week":
                //get start date = today
                var startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                var endDate = new Date(startDate);
                //set end date to following sunday (start of next week minus 1 day)
                endDate.setDate(endDate.getNextWeekStartDate().getDate() - 1);
                //calculate difference in days by comparing times (millisecond count) and dividing by number of milliseconds in a day, add 1 day to get number of days required for search
                days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
                startString = startDate.getFullYear() + '-' + startDate.getMonthForAPISearch() + '-' + startDate.getDateForAPISearch();

                display += ' to ' + endDate.outputForPrinting();

                return [{ range: selectedDateRange, displayDate: display, start: startString, days: days}]; // until the upcoming sunday

            case "Next Week":
                d = d.getNextWeekStartDate();
                startString = d.getFullYear() + '-' + d.getMonthForAPISearch() + '-' + d.getDateForAPISearch();

                dnext.setDate(d.getDate() + 7);
                display = d.outputForPrinting() + ' to ' + dnext.outputForPrinting();

                return [{ range: selectedDateRange, displayDate: display, start: startString, days: 7}]; // seven days from next monday

            case "This Month":
                startString = d.getFullYear() + '-' + d.getMonthForAPISearch() + '-' + d.getDateForAPISearch();
                //get number of days in month
                var monthDays = d.getNumberOfDaysInMonth();
                //get the number of inclusive days until end of month
                days = monthDays - d.getDate() + 1;
                dnext.setDate(d.getDate() + days);
                display = d.outputForPrinting() + ' to ' + dnext.outputForPrinting();

                return [{ range: selectedDateRange, displayDate: display, start: startString, days: days}];  // until the end of this month

            default:
                return null;
        }
    };

    //Parses string formatted as YYYY-MM-DD to a Date object.
    //If the supplied string does not match the format, an invalid Date (value NaN) is returned.
    //dateStringInRange: format YYYY-MM-DD, with year in range of 0000-9999, inclusive.
    //returns: Date object representing the string.
    helpers.parseDateForCalendar = function (dateStringInRange) {
        var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,
            date = new Date(NaN), month,
            parts = isoExp.exec(dateStringInRange);

        if (parts) {
            month = +parts[2];
            date.setFullYear(parts[1], month - 1, parts[3]);
            if (month != date.getMonth() + 1) {
                date.setTime(NaN);
            }
        }
        return date;
    };

    // converts "20120412" to a date object (y: 2012, m: april (03), d: 12)
    helpers.dateFromWebService = function (input) {
        input = input.replace(/-/g, "");
        var year = parseInt(input.substring(0, 4), 10);
        var month = parseInt(input.substring(4, 6), 10);
        var day = parseInt(input.substring(6, 8), 10);
        return new Date(year, --month, day); // subtract one from month. js dates are zero-indexed, while those returned from the service are not.
    };

    // converts "2012-04-12" to a date object (y: 2012, m: april (03), d: 12)
    helpers.dateFromCalendar = function (input) {
        var year = parseInt(input.substring(0, 4), 10);
        var month = parseInt(input.substring(5, 7), 10);
        var day = parseInt(input.substring(8, 10), 10);
        return new Date(year, --month, day); // subtract one from month. js dates are zero-indexed, while those returned from the service are not.
    };

    // check if html5 localstorage is supported
    helpers.localStorageSupported = function () {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    };

    // http://stackoverflow.com/a/3700369/641293
    // &#039;Drip&#039; - Nicole Tattersall &#038; Megan Dell Duo Show --> 'Drip' - Nicole Tattersall & Megan Dell Duo Show
    helpers.decode = function (text) {
        var div = document.createElement('div');
        div.innerHTML = text;
        return div.firstChild.nodeValue;
    };

    return helpers;
} ());

// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray#Compatibility
// pre-IE9 compatability
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) == '[object Array]';
    };
}

// extension methods
(function () {

    String.prototype.format = String.prototype.f = function() {
        var s = this,
        i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    Date.prototype.getNumberOfDaysInMonth = function () {
        switch (this.getMonth()) {
            case 1:
                var year = this.getFullYear();
                if (year % 4 == 0) {
                    if (year % 100 != 0 || year % 400 == 0) {
                        return 29; // http://en.wikipedia.org/wiki/Leap_year#Algorithm
                    }
                }
                return 28;
            case 3:
            case 5:
            case 8:
            case 10:
                return 30;
            default:
                return 31;
        }
    };

    Date.prototype.getMonthForAPISearch = function () {
        var month = (this.getMonth()) + 1;
        return month < 10 ? "0" + month : month;
    };

    Date.prototype.getDateForAPISearch = function () {
        var date = this.getDate();
        return date < 10 ? "0" + (date) : date;
    };

    Date.prototype.getThisWeekendStartDate = function () {
        var today = this.getDay();
        if (today == 6) {
            return this; // saturday - return today
        } else if (today == 0) {
            this.setDate(this.getDate()-1);
            return this; // sunday - return yesterday
        } else {
        // return next saturday
        var daysToNextSaturday = 6 - today;
        // if today is tuesday (index 2), saturday is in 4 days (6 - 2 = 4)
        // if today is friday (index 5), saturday is in 1 day (6 - 5 = 1)

        this.setDate(this.getDate()+daysToNextSaturday);
        return this;
        }
    };

    // get the date of the next monday for the "next week" date range
    Date.prototype.getNextWeekStartDate = function () {
        var daysToNextMonday;

        var currentDay = this.getDay();

        // if today is sunday, "next week" starts tomorrow
        if (currentDay == 0)
            daysToNextMonday = 1;
        // if today is tuesday (index 2), "next week" starts in 6 days (8 - 2 = 6)
        // if today is friday (index 5), "next week starts in 3 days (8 - 5 = 3)
        else
            daysToNextMonday = 8 - currentDay;

        this.setDate(this.getDate()+daysToNextMonday);
        return this;
    };

    Date.prototype.getMonthName = function () {
        return months[this.getMonth()];
    };
    Date.prototype.getDayName = function () {
        return days[this.getDay()];
    };

    function getDateForOutput (date) {
        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; // months are zero based
        var curr_year = date.getFullYear();
        if (curr_month < 10)
            curr_month = "0" + curr_month;
        if (curr_date < 10)
            curr_date = "0" + curr_date;

        return {year: curr_year.toString(), month: curr_month.toString(), date: curr_date.toString()};
    };

    Date.prototype.outputForService = function () {
        var d = getDateForOutput(this);
        return d.year + d.month + d.date;                
    };

    Date.prototype.outputForDatePicker = function () {
        var d = getDateForOutput(this);
        return d.year  + "-" +  d.month  + "-" + d.date;    
    };

    Date.prototype.outputForPrinting = function () {
        return this.getDayName() + ' ' + this.getMonthName() + ' ' + this.getDate() + this.getDateOrdinal() + ', ' + this.getFullYear();
    };

    Date.prototype.getDateOrdinal = function () {
        var hundredRemainder = this.getDate() % 100;
        // if this is a teen number (eg. sixteenth)
        if (hundredRemainder >= 10 && hundredRemainder <= 20) {
            return 'th';
        }

        // if not a teen number, get ordinal as normal
        var tenRemainder = this.getDate() % 10;
        switch (tenRemainder)
        {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };
})();
/*!
* atdw.distribution.api.js
* client for the myEvents distribution web service
*/
window.atdw = window.atdw || {};
window.atdw.myevents = window.atdw.myevents || {};
window.atdw.myevents.distribution = window.atdw.myevents.distribution || (function () {

    var distribution = {};

    /*
    * PUBLIC PROPERTIES - DEFAULT VALUES
    ------------------------------------------------------------------------------*/

    distribution.webServiceBaseUrl = '';

    /*
    * PUBLIC FUNCTIONS
    ------------------------------------------------------------------------------*/

    // call this to initialise the distribution API
    // sets the web service URL to call for server-client interaction
    distribution.setBaseUrl = function (base) {
        //distribution.webServiceBaseUrl = base + '/DistributionService/MyEventsService';
        distribution.webServiceBaseUrl = base + '/myevents';
    };

    // performs an event search using the specified parameters
    // arTags: [tag, tag, tag]
    // arDates: [{start: startDate, days: numberOfDays}]
    // arLocations: [location, location] OR { regions: [], councils: [], postcodes: [], venues: [] }
    // objLocRestrictions: { councils: [], postcodes: [], regions: [] } (other fields aren't used)
    // result is either "success", "empty", or "error", and response is either an array of event listings, nothing (if there are no search results), 
    // or the error message from the service
    // this object is passed on to a printSearchOutput(response) function which should format the output appropriately
    // eg. {result: "success", response: [... {event} ...], resultcount: { TotalMatches: response.TotalMatches, PageNumber: intPageNumber, ResultsPerPage: intResultsPerPage }};
    distribution.eventSearch = function (outputPrintingCallback, strNameVenueTag, arTags, arDates, arObjLocations, boolFreeEntry, boolLeisure, boolBusiness, intPageNumber, intResultsPerPage, apiKey, objLocRestrictions, resUsername, arTypes) {
        var url = distribution.webServiceBaseUrl + '/MyEvents?';

        var tags = arrayToHyphenDelimitedString(arTags);

        var types = arrayToHyphenDelimitedString(arTypes);

        var locations = getLocations(arObjLocations, true);

        var restrictions = getRestrictedLocations(objLocRestrictions, true);

        var resUsernames = arrayToHyphenDelimitedString(resUsername);

        var free = boolFreeEntry ? 'true' : 'false';

        var records = getRecordsForService(intPageNumber, intResultsPerPage);

        var eventCategories = getEventCategories(boolLeisure, boolBusiness);

        var events = {};

        var dateRanges = '';

        if (arDates && arDates.length > 0) {
            for (var i = 0; i < arDates.length; i++) {
                dateRanges += arDates[i].start.replace(/-/g, "") + '-' + arDates[i].days + '~';
            }
        }

        $.ajax({
            type: "GET",
            url: url +
            'term=' + encodeURIComponent(strNameVenueTag) +
            '&dateRanges=' + dateRanges +
            '&category=' + eventCategories +
            '&tags=' + tags +
            '&types=' + types +
            locations +
            '&free=' + free +
            '&records=' + records +
            '&apikey=' + apiKey +
            restrictions +
            '&resUsername=' + resUsernames +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function (response) {
                var products = response.Products;
                var eventDates = response.EventDates;

                var eventList = [];

                if (eventDates && eventDates.length > 0) {

                    $.each(eventDates, function (eventDatesIndex, eventDate) {

                        var product = products[eventDate.Index];

                        eventList.push({
                            ID: product.ProductID,
                            Date: eventDate.Date,
                            Name: product.ProductName,
                            Attribute: product.Attribute,
                            Multimedia: product.MultimediaItems,
                            Description: product.ProductDescription,
                            Tags: product.Tags,
                            Type: product.Type,
                            Venues: product.Venues,
                            Free: product.FreeEntry
                        });
                    });

                    events.result = "success";
                    events.response = eventList;
                    events.resultcount = { TotalMatches: response.TotalMatches, PageNumber: intPageNumber, ResultsPerPage: intResultsPerPage };

                    outputPrintingCallback(events);
                } else {
                    events.result = "empty";
                    events.resultcount = { TotalMatches: 0, PageNumber: intPageNumber, ResultsPerPage: intResultsPerPage };

                    outputPrintingCallback(events);
                }
            },
            error: function (msg) {
                events.result = "error";
                events.response = msg;
                events.resultcount = { TotalMatches: 0, PageNumber: intPageNumber, ResultsPerPage: intResultsPerPage };

                outputPrintingCallback(events);
            }
        });
    };

    // get a list of dates which have events that meet the criteria specified occuring on them
    // arTags: [tag, tag, tag]
    // arDates: [{start: startDate, days: numberOfDays}]
    // objLocations: { regions: [], councils: [], postcodes: [] }
    // sends a callback to the specified function with the result object, which contains a list of dates
    distribution.eventDates = function (outputPrintingCallback, arTags, arDates, objLocations, boolFreeEntry, boolLeisure, boolBusiness, apiKey, arTypes) {
        var url = distribution.webServiceBaseUrl + '/MyEventDates?',
            tags = arrayToHyphenDelimitedString(arTags),
            locations = getLocations(objLocations, true),
            free = boolFreeEntry ? 'true' : 'false',
            eventCategory = getEventCategories(boolLeisure, boolBusiness),
            types = arrayToHyphenDelimitedString(arTypes);


        var dateRanges = '';
        if (arDates && arDates.length > 0) {
            for (var i = 0; i < arDates.length; i++) {
                dateRanges += arDates[i].start.replace(/-/g, "") + '-' + arDates[i].days + '~';
            }
        }

        $.ajax({
            type: 'GET',
            url: url +
            'term=' +
            '&dateRanges=' + dateRanges +
            '&category=' + eventCategory +
            '&tags=' + tags +
            '&types=' + types +
            locations +
            '&free=' + free +
            '&apikey=' + apiKey +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function (response) {
                outputPrintingCallback(response);
            },
            error: function (msg) {
                outputPrintingCallback(msg);
            }
        });
    };

    // gets an event with the specified ID
    // passes an object containing event data to the specified callback
    distribution.getEvent = function (outputPrintingCallback, intEventId, apiKey) {
        var url = distribution.webServiceBaseUrl + '/MyEvent?';

        $.ajax({
            type: 'GET',
            url: url +
            'id=' + intEventId.toString() +
            '&apikey=' + apiKey +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function (response) {
                outputPrintingCallback(response);
            },
            error: function (msg) {
                outputPrintingCallback(msg);
            }
        });
    };

    // gets a list of councils
    // returns an array of councils to the callback provided
    distribution.getCouncils = function (callback, apiKey, state) {
        var url = distribution.webServiceBaseUrl + '/Areas?apiKey=';

        $.ajax({
            type: 'GET',
            url: url + apiKey + '&state=' + state +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function (response) {
                callback(response);
            }
        });
    };

    // gets a list of tags
    // returns an array of tags to the callback provided
    distribution.getTags = function (callback, apiKey) {
        var url = distribution.webServiceBaseUrl + '/Tags?apikey=';

        $.ajax({
            type: 'GET',
            url: url +
            apiKey +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function (response) {
                callback(response);
            }
        });
    };

    distribution.getProductSubTypes = function (callback, apiKey, productType) {
        var url = distribution.webServiceBaseUrl + '/SubTypes?apikey=' + apiKey + '&productType=' + productType;

        $.ajax({
            type: 'GET',
            url: url +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function (response) {
                callback(response);
            }
        });
    };

    // gets a list of locations for a specified STO
    // returns: an array of locations to the callback provided
    distribution.getLocations = function (callback, apiKey, restrictions) {
        var url = distribution.webServiceBaseUrl + '/Locations?';

        var restrictedlocs = getRestrictedLocations(restrictions, false);

        $.ajax({
            type: 'GET',
            async: false,
            contentType: "application/javascript; charset=utf-8",
            url: url +
            restrictedlocs +
            '&apikey=' + apiKey +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function (response) {
                callback(response);
            }
        });
    };

    // gets a list of regions for a specified STO
    // returns: an array of regions to the callback provided 
    distribution.getRegions = function (callback, apiKey, state) {
        var url = distribution.webServiceBaseUrl + '/Regions?';

        $.ajax({
            type: 'GET',
            async: false,
            contentType: "application/javascript; charset=utf-8",
            url: url +
            '&apikey=' + apiKey +
            '&state=' + state +
            getReferrer(),
            data: "",
            dataType: "jsonp",
            success: function(response) {
                callback(response);
            }
        });
    };

    /*
    * PRIVATE FUNCTIONS
    ------------------------------------------------------------------------------*/

    // takes an input of strings
    // returns a single string which represents a hyphen-delimited set of the input
    // eg. input: ['brisbane', 'melbourne', 'sydney']
    // eg. returns: 'brisbane-melbourne-sydney'
    function arrayToHyphenDelimitedString(array) {
        if (array && array.length > 0) {
            var string = '';
            for (var i = 0; i < array.length; i++) {
                string += encodeURIComponent(array[i].toString() + '-');
            }
            if (string != '') {
                string = string.substring(0, string.length - 1); // remove trailing hyphen
            }

            return string;
        } else {
            return '';
        }
    };

    // takes booleans determinig if the relevant categories are selected
    // returns a hyphen delimited string representing selected categories
    function getEventCategories(leisure, business) {
        var types = '';
        if (leisure)
            types += 'leisure-';
        if (business)
            types += 'business-';

        if (types)
            types = types.substring(0, types.length - 1); // remove trailing hyphen

        return types;
    }

    // get a hyphen-delimited string containing the first and last record to display
    // eg. page 3, 25 records/page
    // should return "51-75"
    function getRecordsForService(pageNumber, recordCount) {
        if (!pageNumber) pageNumber = 1;
        if (!recordCount) recordCount = 10;

        var first = ((pageNumber - 1) * recordCount) + 1;
        var last = pageNumber * recordCount;

        return first.toString() + '-' + last.toString();
    }

    // gets a location string for the RESTful service
    // input is either an array in the format [location, location]
    // or an object in the format { locations: [], regions: [], councils: [], postcodes: [], venues: [] }
    function getLocations(arObjLocations, ampersand) {
        if (!arObjLocations) arObjLocations = {};

        var locations = (ampersand ? '&' : '') + 'locations=&postcodes=&regions=&councils=&venues=';
        if (Array.isArray(arObjLocations)) {

            //[location, location]
            locations = '&locations=' + arrayToHyphenDelimitedString(arObjLocations) + '&postcodes=&regions=&councils=&venues=';

        } else if (typeof (arObjLocations) === 'object') {

            //{ locations: [], regions: [], councils: [], postcodes: [], venues: [] }
            locations = (ampersand ? '&' : '') + 'locations=' + arrayToHyphenDelimitedString(arObjLocations.locations)
            + '&postcodes=' + arrayToHyphenDelimitedString(arObjLocations.postcodes)
            + '&regions=' + arrayToHyphenDelimitedString(arObjLocations.regions)
            + '&councils=' + arrayToHyphenDelimitedString(arObjLocations.councils)
            + '&venues=' + arrayToHyphenDelimitedString(arObjLocations.venues);

        }

        return locations;
    }

    // gets a string of restricted search locations  for the RESTful service
    // input is { councils: [], postcodes: [] }
    function getRestrictedLocations(locations, ampersand) {
        if (!locations) locations = {};

        return (ampersand ? '&' : '')
        + 'state=' + locations.state
        + '&resPostcodes=' + arrayToHyphenDelimitedString(locations.postcodes)
        + '&resCouncils=' + arrayToHyphenDelimitedString(locations.councils)
        + '&resRegions=' + arrayToHyphenDelimitedString(locations.regions);
    }

    function getReferrer() {
        return '&referrer=http%3A%2F%2Fvisithorsham.com.au%2Fevents-festivals%2Fsearch-events%2F';// + encodeURIComponent(window.location.href);
    }

    return distribution;
} ());
/*!
* atdw.caching.js
* wrapper for cache.js swappable storage module system
*/
window.atdw = window.atdw || {};
window.atdw.cache = window.atdw.cache || function () {

    var standardExpiry = 1000 * 60 * 5; // 5 minutes
    var longExpiry = 1000 * 60 * 60 * 24 * 7; // 1 week

    return {

        setStaticData: function (councils, locations, tags, results) {
            if (!atdw.helpers.localStorageSupported())
                return;

            var c = cache();
            c.setStore(localStorageStore);

            var now = new Date();
            c.setDefaultExpiry(now.setTime(now.getTime() + longExpiry));

            if (councils)
                c.set('static_councils', councils);

            if (locations)
                c.set('static_locations', locations);

            if (tags)
                c.set('static_tags', tags);

            if (results)
                c.set('static_results', results);
        },

        setStaticProperty: function (key, value) {
            if (!atdw.helpers.localStorageSupported())
                return;

            var c = cache();
            c.setStore(localStorageStore);

            var now = new Date();
            c.setDefaultExpiry(now.setTime(now.getTime() + longExpiry));

            if (key && value)
                c.set(key, value);
        },

        getStaticCache: function () {
            if (!atdw.helpers.localStorageSupported())
                return null;

            var c = cache();
            c.setStore(localStorageStore);

            if (!c.empty()) {
                var staticCache = {};

                staticCache.councils = c.get('static_councils');
                staticCache.locations = c.get('static_locations');
                staticCache.tags = c.get('static_tags');
                staticCache.results = c.get('static_results');

                return staticCache;
            }
            return null;
        },

        setSearchCache: function (searchText, tags, dates, locations, free, leisure, business, pageNumber, numberOfResults) {
            var c = cache();
            // use localstorage if it is supported. fall back to cookie storage otherwise.
            // both formats are available across the entire domain (not restricted to the current page)
            // but cookies have the usual cookie storage limitations (and aren't designed for this the way localstorage is)
            if (atdw.helpers.localStorageSupported()) {
                c.setStore(localStorageStore);
            } else {
                c.setStore(cookieStore);
            }

            var page = pageNumber || c.get('pageNumber');
            var num = numberOfResults || c.get('numberOfResults');

            var now = new Date();
            c.setDefaultExpiry(now.setTime(now.getTime() + standardExpiry));

            c.set('searchText', searchText);
            c.set('tags', tags);
            c.set('dates', dates);
            c.set('locations', locations);
            c.set('free', free);
            c.set('leisure', leisure);
            c.set('business', business);
            c.set('pageNumber', page);
            c.set('numberOfResults', num);
        },

        getSearchCache: function () {

            var c = cache();
            // use localstorage if it is supported. fall back to cookie storage otherwise.
            // both formats are available across the entire domain (not restricted to the current page)
            // but cookies have the usual cookie storage limitations (and aren't designed for this the way localstorage is)
            if (atdw.helpers.localStorageSupported()) {
                c.setStore(localStorageStore);
            } else {
                c.setStore(cookieStore);
            }

            if (!c.empty()) {

                var searchCache = {};

                searchCache.searchText = c.get('searchText');
                if (searchCache.searchText == null)
                    return null; // if this is null it must have expired in the cache
                searchCache.tags = c.get('tags');
                searchCache.dates = c.get('dates');
                searchCache.free = c.get('free');
                searchCache.locations = c.get('locations');
                searchCache.leisure = c.get('leisure');
                searchCache.business = c.get('business');
                searchCache.pageNumber = c.get('pageNumber');
                searchCache.numberOfResults = c.get('numberOfResults');

                return searchCache;
            } else {
                return null;
            }

        },

        getProperty: function (property) {
            var c = cache();
            // use localstorage if it is supported. fall back to cookie storage otherwise.
            // both formats are available across the entire domain (not restricted to the current page)
            // but cookies have the usual cookie storage limitations (and aren't designed for this the way localstorage is)
            if (atdw.helpers.localStorageSupported()) {
                c.setStore(localStorageStore);
            } else {
                c.setStore(cookieStore);
            }

            if (!c.empty()) {
                return c.get(property);
            } else {
                return null;
            }
        },

        resetCache: function () {
            var c = cache();
            // use localstorage if it is supported. fall back to cookie storage otherwise.
            // both formats are available across the entire domain (not restricted to the current page)
            // but cookies have the usual cookie storage limitations (and aren't designed for this the way localstorage is)
            if (atdw.helpers.localStorageSupported()) {
                c.setStore(localStorageStore);
            } else {
                c.setStore(cookieStore);
            }

            c.killall();
        }
    };
} ();

/*!
* atdw.event.search.ui.js
* UI helpers for myEvents white label site
*/
(function ($) {

    $.fn.atdwDisableTextSelect = function(options) {
        var defaults = {
            debug: false
        };

        options = $.extend(defaults, options);

        return this.each(function() {
            var o = options;
            if ($.browser.mozilla) { //Firefox
                $(this).css('MozUserSelect', 'none');
            } else if ($.browser.msie) { //IE
                $(this).live('selectstart dragstart', function(evt) {
                    evt.preventDefault();
                    return false;
                });
                //$(this).bind('selectstart', function () { return false; });
            } else { //Opera, etc.
                $(this).mousedown(function() { return false; });
            }
        });
    };
})(jQuery);

// this was moved from atdw.autoComplete.List.js
(function ($) {

    $.fn.autoCompleteList = function (options) {

        var defaults = {
            maxFields: 5
            , source: options.source
            , waterMarkText: options.waterMarkText
            , waterMarkClass: 'waterMarked'
            , existingLocations: []
            , valueProperty: 'label'
            , labelProperty: 'label'
        };
        options = $.extend(defaults, options);
        var selectItemCallBack = options.selectItemCallBack;

        $.each(options.source, function (index, item) {
            // set label from the passed in labelProperty
            if (item[options.labelProperty]) {
                item.label = item[options.labelProperty];
            }
            // set value from the passed in valueproperty
            if (item[options.valueProperty]) {
                item.value = item[options.valueProperty];
            }

            // make sure all the labels replace encoded ampersands for the label
            item.label = item.label.replace('&#038;', '&');
        });

        ////THIS CODE WILL OVERRIDE RENDERITEM TO CUSTOMISE ITEM DISPLAY
        //var oldFn = $.ui.autocomplete.prototype._renderItem;

        //$.ui.autocomplete.prototype._renderItem = function (ul, item) {
        //    return $("<li></li>")
        //              .data("item.autocomplete", item)
        //              .append("<a>" + item.label + ", " + item.value + "</a>")
        //              .appendTo(ul);
        //};

        $.fn.resetList = function () {

            return this.each(function () {
                var originalSource, callback, valueProperty, labelProperty;
                var children = $(this).children('li:first');
                $(children).each(function () {
                    var listItem = $(this);
                    originalSource = $(listItem).children('input').autocomplete("option", "source");
                    callback = options.selectItemCallBack;
                    valueProperty = options.valueProperty;
                    labelProperty = options.labelProperty;
                });
                // make sure all the new values are retained when resetting list
                $(this).autoCompleteList({ maxFields: 5,
                    source: originalSource,
                    selectItemCallBack: callback,
                    labelProperty: labelProperty,
                    valueProperty: valueProperty
                });
            });
        };

        return this.each(function () {
            var locationTextBoxClass = atdw.myevents.search.io.locationsTextBox.substring(1, atdw.myevents.search.io.locationsTextBox.length);
            var o = options;
            var selector = $(this).selector;

            $(this).html('');

            if (o.existingLocations) {
                for (var i = 0; i < o.existingLocations.length; i++) {
                    $(this).append('<li><input name="location" type="text" class="' + locationTextBoxClass + ' form-control" disabled="disabled" value="' + o.existingLocations[i] + '" />&nbsp;<span class="clearLocation"></span></li>');
                }
            }

            if (o.existingLocations.length < 5) {
                $(this).append('<li><input name="location" type="text" class="' + locationTextBoxClass + ' form-control" />&nbsp;<span class="clearLocationBlank"></span></li><li><span class="add">+ MORE</span></li>');
            }

            var children = $(this).children('li');
            $(children).each(function () {
                var listItemParent = $(this).parents('li:first');
                var listItem = $(this);

                $(listItem).children('input').autocomplete({
                    source: o.source,
                    minLength: 2,
                    delay: 500,
                    dataType: 'json',
                    select: function(event, ui) {

                        $(this).siblings('span.clearLocationBlank, span.clearLocation').attr('class', 'clearLocation').bind('click', function() {
                            $(this).attr('class', 'clearLocationBlank');
                            var itemCount = $(atdw.myevents.search.io.locationsList).children().length - 1;
                            if (itemCount == 1) {
                                var inputCtrl = $(this).siblings('input');
                                $(this).html('');
                                $(inputCtrl).val('');
                                $(inputCtrl).removeAttr('disabled');
                            } else {
                                $(this).parents('li').remove();

                            }
                            var prevInput = $('li span.add').parents().prev('li').children('input');
                            $('li span.add').hide();
                            if ($(prevInput).attr('disabled') == 'disabled') {
                                $('li span.add').show();
                            }
                            
                            // call select item call back
                            selectItemCallBack();
                        });
                        var itemCount = $(atdw.myevents.search.io.locationsList).children().length - 1;

                        if (itemCount < o.maxFields) {
                            $('li span.add').show();
                        }

                        $(this).attr('disabled', 'disabled');
                        
                        // call select item call back
                        selectItemCallBack();
                    },
                    search: function(event, ui) {
                        //SEARCH EVENT
                    }
                }).focus(function (event, ui) {
                        if ($(this).val() == o.waterMarkText) {
                            $(this).val('').removeClass(o.waterMarkClass);
                        }
                }).blur(function(event, ui) {
                        if ($(this).val() == '' || $(this).val() == o.waterMarkText) {
                            $(this).addClass(o.waterMarkClass).val(o.waterMarkText);
                        }
                }).addClass(o.waterMarkClass).val(o.waterMarkText);
                });
            $('li span.add').bind('click', function () {
                var listItemLast = $(this).parents('li').prev();

                var $ctrl = $('<input/>').attr({ type: 'text', name: 'location', "class": locationTextBoxClass + ' form-control' }).autocomplete({
                    source: o.source,
                    minLength: 2, delay: 500,
                    select: function (event, ui) {
                        $($ctrl).siblings('span.clearLocationBlank, span.clearLocation').attr('class', 'clearLocation').bind('click', function () {
                            $(this).attr('class', 'clearLocationBlank');
                            var itemCount = $(atdw.myevents.search.io.locationsList).children().length - 1;
                            if (itemCount == 1) {
                                var inputCtrl = $(this).siblings('input');
                                $(this).html('');
                                $(inputCtrl).val('');
                                $(inputCtrl).removeAttr('disabled');
                            } else {
                                $(this).parents('li').remove();
                            }
                            var prevInput = $('li span.add').parents().prev('li').children('input');
                            $('li span.add').hide();
                            if ($(prevInput).attr('disabled') == 'disabled') {
                                $('li span.add').show();
                            }
                            
                            // call select item call back
                            selectItemCallBack();
                        });

                        var itemCount = $(atdw.myevents.search.io.locationsList).children().length - 1;

                        if (itemCount < o.maxFields) {
                            $('li span.add').show();
                        }

                        $(this).attr('disabled', 'disabled');
                        
                        // call select item call back
                        selectItemCallBack();
                    }
                }).focus(function (event, ui) {
                    if ($(this).val() == o.waterMarkText) {
                        $(this).val('').removeClass(o.waterMarkClass);
                    }
                }).blur(function (event, ui) {
                    if ($(this).val() == '' || $(this).val() == o.waterMarkText) {
                        $(this).addClass(o.waterMarkClass).val(o.waterMarkText);
                    }
                }).addClass(o.waterMarkClass).val(o.waterMarkText);

                var $span = $('<span/>').attr({ "class": 'clearLocationBlank' }).before('&nbsp;');
                var $li = $('<li/>').html($ctrl).append($span);
                $(listItemLast).after($li);

                $(this).hide();
            });

            $('li span.clearLocation').bind('click', function () {
                $(this).attr('class', 'clearLocationBlank');
                var itemCount = $(atdw.myevents.search.io.locationsList).children().length - 1;
                if (itemCount == 1) {
                    var inputCtrl = $(this).siblings('input');
                    $(this).html('');
                    $(inputCtrl).val('');
                    $(inputCtrl).removeAttr('disabled');
                } else {
                    $(this).parents('li').remove();

                }
                var prevInput = $('li span.add').parents().prev('li').children('input');
                $('li span.add').hide();
                if ($(prevInput).attr('disabled') == 'disabled') {
                    $('li span.add').show();
                }
            });
            $('li span.add').hide();
        });
    };
})(jQuery);

//Single select list
//Adds functionality to highlight a list item when the item is clicked.
/* List mark up for selection to work.
<ul class="date-ranges">
    <li>
        All
    </li>
    <li class="selected">
        Today
    </li>
</ul>
*/
(function ($) {
    $.fn.atdwSelectList = function (options) {
        var defaults = {
            debug: false
        };
        options = $.extend(defaults, options);
        var listClass = this.selector;
        return this.each(function () {
            var o = options;
            var thisList = this;
            $(listClass + ' li').live('click',function () {
                $(thisList).find('li').removeClass('selected');
                $(this).addClass('selected');
                $('div.atdw-multidatepicker').each(function () { 
                    $(this).updateSelectedDates(); 
                    $(this).displaySelectedList(this);
                    $(this).datepicker('setDate', new Date()); // reset the calendar to show this month again. TODO: if (eg.) "next week" is selected and that's all in the next month, show the next month.
                });
            });
            //Set cursor to pointer when mouse over
            $(listClass + ' li').mouseover(function () {
                $(this).css({ 'cursor': 'pointer' });
            });
        });
    };
})(jQuery);

//Place GMap Markers
(function ($) {
    $.fn.atdwGMap = function (atdwoptions, gmapoptions) {
       
        return this.each(function () {
            var d = atdwoptions;

            //by default - disable scroll wheel and street view control, set maptype to roadmap
            var mapOptions = {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scrollwheel: false,
                streetViewControl: false
            };

            if (gmapoptions)
                $.extend(mapOptions, gmapoptions);

            //create map
            var map = new google.maps.Map(this, mapOptions);
            var latlngArray = [];
            var venuesLength = d.venues.length;
            var latLngBounds = new google.maps.LatLngBounds();
            
            var infowindow = new google.maps.InfoWindow();

            for (var i = 0; i < venuesLength; i++) {
                var venue = d.venues[i];

                var latLng = new google.maps.LatLng(venue.Latitude, venue.Longitude);
                latlngArray.push(latLng);
                //Add marker to map
                addMarker(map, latLng, venue.Name, infowindow, venue.Description);
                //Add lat to map bounds.
                latLngBounds.extend(latLng);
            }

            // enforce a minimum zoom of 14 - we need to use an event listener because of how fitBounds behaves
            var zoomChangeBoundsListener = google.maps.event.addListener(map, 'bounds_changed', function() {
                google.maps.event.removeListener(zoomChangeBoundsListener);
                map.setZoom( Math.min( atdwoptions.zoomLevel || 14, map.getZoom() ) );
            });

            map.fitBounds(latLngBounds);
        });
        
        function addMarker(map, latlng, venueName, infowindow, infoMessage) {
            var marker = new google.maps.Marker({
                position:new google.maps.LatLng(latlng.lat(), latlng.lng()),
                map: map,
                title: venueName
            });

            // add an info window that pops up when a marker is clicked
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(infoMessage || venueName);
                infowindow.open(map,marker);
            });
        }
    };
})(jQuery);

//Create a collapsible list, the markup required for this to work
//Currently working for a single nexted list
/*
<ul class="atdw-tags" id="ATDW_lvlOneTags">
    <li>
        <input type="checkbox" value="ARTCULTURE" id="atdwARTCULTURE" />
        <label for="atdwARTCULTURE">Art & Culture</label>
        <ul>
            <li>
                <input type="checkbox" value="CRAFTS" id="atdwCRAFTS" />
                <label for="atdwCRAFTS">Crafts</label>
            </li>
            <li>
                <input type="checkbox" value="DESIGN" id="atdwDESIGN" />
                <label for="atdwDESIGN">Design</label>
            </li>
        </ul>
    </li>
    <li>
        <input type="checkbox" value="COMMUNITY" id="atdwCOMMUNITY" />
        <label for="atdwCOMMUNITY">Community</label>
        <ul>
            <li>
                <input type="checkbox" value="CRAFTS" id="Checkbox1" />
                <label for="atdwCRAFTS">Crafts</label>
            </li>
            <li>
                <input type="checkbox" value="DESIGN" id="Checkbox2" />
                <label for="atdwDESIGN">Design</label>
            </li>
        </ul>
    </li>
    <li>
        <input type="checkbox" value="DANCE" id="atdwDANCE" />
        <label for="atdwDANCE">Dance</label>
    </li>
</ul>
*/
(function ($) {
    $.fn.atdwCollapsibleList = function (options) {
        
        var defaults = {
            selectChildrenOnParentSelected : true,
            selectParentOnChildSelected : true,
            collapseIfChildSelected : true,
            showText : '+',
            hideText : '-'
        };

        options = $.extend(defaults, options);
        $(this.selector + ' ul').hide();

        return this.each(function () {
            var o = options;
            //add parent list class so we can style
            $(this).children('li').each(function() {
                
                var levelOneCheckBox = $(this).children('input[type=checkbox]');
                var levelTwoCheckBoxes = $(this).find('ul li input[type=checkbox]');
                var levelTwoCheckBoxChecked = $(this).find('ul li input[type=checkbox]').is(':checked');
                var childList = $(this).children('ul');

                //Select the parent check box if any of the children are selected
                if(levelTwoCheckBoxChecked) {
                    $(levelOneCheckBox).prop('checked', true);
                    $(childList).show();
                }
                else if($(levelOneCheckBox).is(':checked')) {
                    //Select all the level two tags if the parent is selected.
                    $(levelTwoCheckBoxes).prop('checked', true);
                    $(childList).show();
                }

                if(levelTwoCheckBoxes.length > 0) {
                    $(this).addClass('parent-list');
                    $(this).append('<span class=\"show-hide btn btn-default btn-xs\">' + ($(childList).is(':visible') ? o.hideText : o.showText) + '</span>');
                    
                    //Add show animation
                    $(this).children('span').click(function() {
                        if(!$(childList).is(':visible')) {
                            $(childList).slideDown('fast');
                            $(this).text(o.hideText);
                        } else {
                            //Check if any of the child checkboxs are selected: hide if none selected.
                            if(o.collapseIfChildSelected || !levelTwoCheckBoxChecked) {
                                $(childList).slideUp('fast');
                                $(this).text(o.showText);
                            }
                        }                      
                    });
                    
                    //Select all the children when the parent is clicked
                    if(o.selectChildrenOnParentSelected) {
                        $(this).children('input[type=checkbox], label').click(function() {
                            if($(this).is(':checked')) {
                                $(levelTwoCheckBoxes).prop('checked', true);
                            } else {
                                $(levelTwoCheckBoxes).prop('checked', false);
                            }
                        });
                    }

                    //Select the parent checkbox when a child is clicked
                    if(o.selectParentOnChildSelected) {
                        //select parent checkbox if not selected
                        $(this).find('ul li').children().click(function() {
                            var checkParent = $(levelTwoCheckBoxes).is(':checked');
                            $(levelOneCheckBox).prop('checked', checkParent);
                        });
                    }
                    
                }
            });
        });
    };
})(jQuery);

// this was moved from atdw.multiDate.picker.ui.js
(function ($) {

    $.fn.atdwMultiDatePicker = function (options) {

        var defaults = {
            numberOfMonths: 1
            , dates: options.dates
            , altField: options.altField
            , minDate: 0
            , displayListSelector: options.displayListSelector
            , displayList: options.displayList
        };
        
        // set callback variable - gets called on select date
        var selectDateCallback = options.selectDateCallback;
        
        options = $.extend(defaults, options);

        $.fn.clearCalendar = function () {
            $(this).multiDatesPicker('resetDates', 'picked');
        };

        $.fn.getDatesForWebService = function () {
            var dates = $(this).multiDatesPicker('getDates');
            var dateRanges = [];
            var days = 0;
            var startDate = new Date();
            var startDateString = startDate.outputForDatePicker();

            for (var i = 0; i < dates.length; i++) {

                if (i == 0) {
                    days++;
                    startDate = atdw.helpers.parseDateForCalendar(dates[i]);
                }
                var nextDate = atdw.helpers.parseDateForCalendar(dates[i]);
                var tomorrowDate = new Date(nextDate);
                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                startDateString = startDate.outputForDatePicker();
                var dateRange;
                if (i < dates.length - 1) {
                    nextDate = atdw.helpers.parseDateForCalendar(dates[i + 1]);

                    if ((nextDate > tomorrowDate) || (i == dates.length - 1)) {
                        dateRange = { range: 'Date Range', displayDate: startDateString, start: startDateString, days: days };
                        dateRanges.push(dateRange);
                        days = 1;
                        startDate = nextDate;
                    } else if (nextDate < tomorrowDate) {

                    } else {
                        days++;
                    }
                } else {
                    dateRange = { range: 'Date Range', displayDate: startDateString, start: startDateString, days: days };
                    dateRanges.push(dateRange);
                }
            }

            if (dateRanges.length > 0) {
                return dateRanges;
            } else {
                return [{ range: 'Date Range', displayDate: "All Dates", start: startDateString, days: 365}];
            }
        };

        $.fn.addDates = function (dates) {
            var o = options;

            $(this).multiDatesPicker('addDates', dates);

            $(o.altField).val(dates);
        };

        $.fn.updateSelectedDates = function () {
            $(this).clearCalendar();
            var dateRangeObj = atdw.myevents.search.getDateFilter();
            var dates = [];

            if (dateRangeObj[0].days != 365) {
                var date = atdw.helpers.parseDateForCalendar(dateRangeObj[0].start);
                var dateToAdd = new Date(date);
                dates.push(dateToAdd.outputForDatePicker());
                for (var i = 1; i < dateRangeObj[0].days; i++) {
                    date.setDate(date.getDate() + 1);
                    dateToAdd = new Date(date);
                    dates.push(dateToAdd.outputForDatePicker());
                }
                $(this).addDates(dates);
            }

        };

        $.fn.getSelectedList = function (context) {
            var dates = $(context).multiDatesPicker('getDates');
            var datesString = '';
            var today = new Date();
            var dateForString;

            if (dates != null) {
                var newRange = true;
                for (var i = 0; i < dates.length; i++) {

                    if (newRange) {
                        dateForString = atdw.helpers.dateFromCalendar(dates[i]);
                        datesString += dateForString.outputForPrinting();
                    }

                    var nextDate;
                    var tomorrowDate = atdw.helpers.dateFromCalendar(dates[i]);

                    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

                    if (dates.length > 1) {
                        if (i < dates.length - 1) {
                            nextDate = atdw.helpers.dateFromCalendar(dates[i + 1]);

                            if ((nextDate > tomorrowDate) || (i == dates.length - 1)) {
                                if (!newRange) {
                                    dateForString = atdw.helpers.dateFromCalendar(dates[i]);
                                    datesString += dateForString.outputForPrinting();
                                }
                                datesString += ", ";
                                newRange = true;
                            } else if (nextDate < tomorrowDate) {

                            } else {
                                if (newRange)
                                    datesString += " to ";
                                newRange = false;
                            }
                        } else if (!newRange) {
                            dateForString = atdw.helpers.dateFromCalendar(dates[i]);
                            datesString += dateForString.outputForPrinting();
                        }
                    } else {
                        //only one date selected
                    }
                }
            }
            if (datesString == '') {
                datesString = today.outputForPrinting() + ' onwards';
            }
            return datesString;
        };

        $.fn.displaySelectedList = function (context) {
            var o = options;
            var datesString = $(context).getSelectedList(context);
            if (o.displayList) {
                $(o.displayListSelector).html('Dates: ' + datesString);

            }
        };

        function launchMultiDatePicker(jqel, opts) {
            try {
                jqel.multiDatesPicker(opts);
            } catch (ex) {
                setTimeout(function () {
                    launchMultiDatePicker(jqel, opts);
                }, 100);
            }
        }

        return this.each(function () {
            var o = options;
            var date = null;
            var defaultDate = (new Date()).outputForDatePicker();

            if (o.dates.length > 0) {
                date = o.dates;
                defaultDate = date[0];
            } else {

            }

            var jqel = $(this);
            var el = this;
            var opts = {
                numberOfMonths: o.numberOfMonths
                , addDates: date
                , altField: o.altField
                , minDate: o.minDate
                , defaultDate: defaultDate
                , dateFormat: 'yy-mm-dd'
                , onSelect: function () {
                    jqel.displaySelectedList(el);
                    // call selection callback
                    selectDateCallback();
                }
            };

            launchMultiDatePicker(jqel, opts);
        });
    };

})(jQuery);
/*!
* atdw.myevents.event.js
* controller for the myEvents white label site event view
* http://myevents.atdw.com.au/Distribution/WhiteLabel
*/
window.atdw = window.atdw || {};
window.atdw.myevents = window.atdw.myevents || {};
window.atdw.myevents.event = window.atdw.myevents.event || (function () {

    //public myevent functions and properties
    var myevents = {};

    /*
    * PRIVATE PROPERTIES
    ------------------------------------------------------------------------------*/
    var STO = 'TVIC';
    var titleElement = 'h4';
    var labelClass = 'title';
    var eventDate;         //This has to be set from the query string, so we can get the date they actually clicked on
    var event_spinner; // loading indicator

    /*
    * PRIVATE FUNCTIONS
    ------------------------------------------------------------------------------*/
    var productDetailsContainer;

    //wrap text with an html element
    function wrap(text, element, className) {
        if (className != '')
            className = ' class="' + className + '"';
        return "<" + element + className + ">" + text + "</" + element + ">";
    };

    //Sets the event date 
    function setEventDate(date) {
        if (date && date != "")
            eventDate = atdw.helpers.dateFromWebService(date);
    };

    //Generate html for multimedia
    function generateMultimediaHtml(multimedia) {
        if (multimedia == undefined || multimedia == null) return '';

        var multimediaHtml;
        var multimediaLenght = multimedia.length;

        var multimediaImg = '';
        for (var i = 0; i < multimediaLenght; i++) {
            if (multimedia[i].OrientationType == myevents.imageOrientation)
                multimediaImg = '<img src="' + multimedia[i].ServerPath + '" alt="' + multimedia[i].AltText + '" width="310" onerror="this.onerror=null;this.src=\'' + myevents.resourceURL + myevents.defaultImagePath + '\';" />';
        }
        if (multimediaImg == '')
            multimediaImg = '<img src="' + myevents.resourceURL + myevents.defaultImagePath + '" width="310" class="img-thumbnail" alt="placeholder" />';

        multimediaHtml = wrap(multimediaImg, 'div', 'product-image');
        return multimediaHtml;
    };

    //Generate the html for the date
    function generateDateHtml(dates) {
        var dateHtml = '';

        // if there isn't an event date (nothing in the query string)
        // then get the next occurence of the event and make that the eventDate
        if (!eventDate || eventDate == '') {
            var today = new Date();
            var date;
            for (var d = 0; d < dates.length; d++) {
                date = atdw.helpers.dateFromWebService(dates[d]);
                if (date >= today) {
                    eventDate = date;
                    break;
                }
            }
        }

        for (var i = 0; i < myevents.eventDateOrder.length; i++) {
            switch (myevents.eventDateOrder[i]) {
                case 'weekday':
                    dateHtml += wrap(eventDate.getDayName(), 'span', 'day-text');
                    break;
                case 'date':
                    dateHtml += wrap(eventDate.getDate(), 'span', 'day-number');
                    break;
                case 'month':
                    dateHtml += wrap(eventDate.getMonthName(), 'span', 'month');
                    break;
                case 'year':
                    dateHtml += wrap(eventDate.getFullYear(), 'span', 'year');
                    break;
            }
        }

        return (wrap(dateHtml, 'div', 'date'));
    };

    //Generate the html for the event other dates
    function generateOtherDatesHtml(dates) {
        if (dates == undefined || dates == null) return '';

        var endDateHtml = '';
        if (myevents.otherDatesTitle != '')
            endDateHtml = wrap(myevents.otherDatesTitle, titleElement, '');

        // sort dates ascending
        dates.sort();

        var date = atdw.helpers.dateFromWebService(dates[dates.length - 1]);
        endDateHtml += wrap(date.getDate() + ' ' + date.getMonthName() + ' ' + date.getFullYear(), 'div', 'end-date');

        return wrap(endDateHtml, 'div', 'other-dates');

    };

    //Generate the html for the venue/s
    function generateVenueHtml(venues) {
        if (venues == undefined || venues == null) return '';
        var venuesHtml = '';
        var suburbCity;

        if (myevents.venuesTitle != '')
            venuesHtml = wrap(myevents.venuesTitle, titleElement, '');

        var venuesLenght = venues.length;
        for (var i = 0; i < venuesLenght; i++) {
            var venueHtml = '';

            if (venues[i].Name != '') {
                venueHtml = wrap(venues[i].Name, 'span', 'venue-name');
            }

            var addressOutput = '';
            if (venues[i].Address1 != '') {
                addressOutput = venues[i].Address1;
            }
            if (venues[i].Address2 != '') {
                addressOutput += ' ' + venues[i].Address2;
            }
            if (venues[i].Address3 != '') {
                addressOutput += ' ' + venues[i].Address3;
            }
            if (addressOutput != '') {
                addressOutput += ', ';
                venueHtml += wrap(addressOutput, 'span', 'street-address');
            }

            if (venues[i].Suburb == '')
                suburbCity = venues[i].City;
            else
                suburbCity = venues[i].Suburb;

            if (suburbCity != '' && (venues[i].State != '' || venues[i].Postcode != '')) {
                venueHtml += wrap(suburbCity + ', ' + venues[i].State + ' ' + venues[i].Postcode, 'span', 'state-postcode');
            }

            venuesHtml += wrap(venueHtml, 'div', 'venue');
        }
        return wrap(venuesHtml, 'div', 'venues');
    };

    //Generate the html for the product type
    function generateTypeHtml(type) {
        if (!type) return '';

        var typeHtml = '';
        if (myevents.typeTitle != '')
            typeHtml = wrap(myevents.typeTitle, titleElement, '');

        if (type != '')
            typeHtml += wrap(type, 'div', 'type');

        return wrap(typeHtml, 'div', 'type');
    };

    //Generate the html for the free entry marker, if there is one
    function generateFreeEntryHtml(freeEntry) {
        if (!freeEntry) return '';

        return wrap(myevents.freeEntryTitle, 'div', 'free-entry');
    };

    //Generate the html for the description, replacing line breaks with paragraphs.
    function generateDescriptionHtml(description) {
        if (!description) return '';

        var descriptionHtml = '';
        if (myevents.descriptionTitle != '')
            descriptionHtml = wrap(myevents.descriptionTitle, titleElement, '');

        description = description.replace(/\r\n\r\n/g, '\n').replace(/\r\n/g, '\n').replace(/\n \n \n/g, '\n').replace(/\n \n/g, '\n');
        description = description.replace(/\n/g, '</p><p>');
        descriptionHtml += wrap(description, 'p', '');

        return wrap(descriptionHtml, 'div', 'description');
    };

    //Generate the html for the event contact details
    function generateContactHtml(event) {

        var contactHtml = '';
        var websiteHtml = '';
        var emailHtml = '';
        var phoneHtml = '';

        if (myevents.contactTitle)
            contactHtml = wrap(myevents.contactTitle, titleElement, '');
        //Website Html
        if (event.Website) {
            if (myevents.contactWebsiteLabel)
                websiteHtml = wrap(myevents.contactWebsiteLabel, 'label', labelClass);
            websiteHtml += '<a href="http://' + event.Website.replace('http://', '') + '" title="' + event.Website + '" target="_blank">' + event.Website + '</a>';
            contactHtml += wrap(websiteHtml, 'div', 'website');
        }
        //Email Html 
        if (event.Email) {
            if (myevents.contactEmailLabel)
                emailHtml = wrap(myevents.contactEmailLabel, 'label', labelClass);
            emailHtml += '<a href="mailto:' + event.Email + '" title="' + event.Email + '" target="_blank">' + event.Email + '</a>';
            contactHtml += wrap(emailHtml, 'div', 'email');
        }
        var phoneToUse;
        var areaCode;

        if (event.Phone) {
            phoneToUse = event.Phone;
            if (event.AreaCode) {
                areaCode = event.AreaCode;
            }
        } else if (event.Mobile) {
            phoneToUse = event.Mobile;
        } else if (event.Tollfree) {
            phoneToUse = event.Tollfree;
        }

        //Phone Html
        if (phoneToUse) {
            if (myevents.contactEmailLabel)
                phoneHtml = wrap(myevents.contactPhoneLabel, 'label', labelClass);
            if (areaCode)
                phoneHtml += areaCode + ' ';
            phoneHtml += phoneToUse;
            contactHtml += wrap(phoneHtml, 'div', 'phone');
        }

        return wrap(contactHtml, 'div', 'contact-details');
    };

    //Generate the html markup for the event details page
    function generateProductDetailsHtml(event) {

        var unconfirmedStatus = "";
        //loop through attributes and find unconfirmed
        if (event.Attribute && event.Attribute.length > 0) {

            var attribute;
            for (var a = 0; a < event.Attribute.length; a++) {
                attribute = event.Attribute[a];
                if (attribute.AttributeTypeId == "EVT STATUS" && attribute.AttributeID == "UNCONFIRMD") {
                    unconfirmedStatus = " (To Be Confirmed)";
                    break;
                }
            }
        }

        document.title = myevents.pageTitlePrefix + atdw.helpers.decode(event.ProductName);

        var eventName = wrap(event.ProductName + unconfirmedStatus, 'h2', '');
        var multimedia = generateMultimediaHtml(event.MultimediaItems);
        var date = generateDateHtml(event.Dates);
        var venues = generateVenueHtml(event.Venues);
        var type = ''; //generateTypeHtml(event.Type, event.FreeEntry);
        var contact = generateContactHtml(event);
        var otherDates = generateOtherDatesHtml(event.Dates);
        var free = generateFreeEntryHtml(event.FreeEntry);

        var eventDescription = generateDescriptionHtml(event.ProductDescription);

        //Product Name
        $(productDetailsContainer).html(eventName);

        //Extras
        var extras = wrap(venues + type + contact + otherDates + free, 'div', 'extras');
        var hasOneGeocode = false;
        for (var i = 0; i < event.Venues.length; i++) {
            if (event.Venues[i].Latitude != "" && event.Venues[i].Longitude != "") {
                hasOneGeocode = true;
            }
        }

        $(productDetailsContainer).append(wrap(multimedia + date + extras, 'div', 'details'));
        //$(productDetailsContainer).append(date);
        //$(productDetailsContainer).append(venues);

        //Description
        $(productDetailsContainer).append(eventDescription);
        //Google Map
        var mapDiv = wrap('<br>', 'div', 'atdwMapCanvas');

        if (hasOneGeocode) {
            $(productDetailsContainer).append(mapDiv);
            displayProductOnMap(event.Venues);
        }

        if (event_spinner && event_spinner.stop) {
            event_spinner.stop();
        }
    };

    function displayProductOnMap(eventVenues) {
        $('div.atdwMapCanvas').atdwGMap({ venues: eventVenues });
    };

    function loadFromCache() {
        var searchText = atdw.cache.getProperty('searchText');
        if (searchText !== null)
            $(myevents.searchBoxSelector).val(searchText);
    };

    function setupLoadingIndicators(container) {
        var opts = {
            className: myevents.loadingIndicator
        }; // http://fgnass.github.com/spin.js/#usage for options

        var c = $(container)[0];

        try {
            event_spinner = new Spinner(opts).spin(c);
        } catch (ex) {
            // swallow
        }
    };

    /*
    * PUBLIC PROPERTIES - DEFAULT VALUES
    ------------------------------------------------------------------------------*/

    // if you change these default values you should update the readme.txt as well

    myevents.venuesTitle = 'Where: ';
    myevents.typeTitle = 'Type: ';
    myevents.descriptionTitle = 'Event Description';
    myevents.contactTitle = 'Contact: ';
    myevents.otherDatesTitle = 'Event runs until: ';
    myevents.freeEntryTitle = 'FREE ENTRY';

    myevents.contactWebsiteLabel = 'Website: ';
    myevents.contactEmailLabel = 'Email: ';
    myevents.contactPhoneLabel = 'Phone: ';

    myevents.imageOrientation = 'WLSLAND';
    myevents.defaultImagePath = 'images/no-image-large.jpg';

    myevents.searchPageURL = 'search.htm';
    myevents.defaultDateRange = 'All';
    myevents.resourceURL = '';
    myevents.searchBoxSelector = '#atdwSearchText';
    myevents.loadingIndicator = 'atdw-loading-spinner';
    myevents.filterGroupButtons = '.filter-group.buttons';

    myevents.displayContainer = '.atdw-event-details';

    myevents.pageTitlePrefix = 'Event Details - ';
    myevents.eventDateOrder = ['weekday', 'date', 'month', 'year'];

    myevents.apiKey = '132';
    myevents.username = '';

    /*
    * PUBLIC FUNCTIONS
    ------------------------------------------------------------------------------*/
    myevents.setBaseUrl = function (base) {
        myevents.resourceURL = base + '/_resources/' + STO + '/wls/';
    };

    myevents.start = function (options) {
        $.extend(myevents, options);

        $(document).ready(function () {
            setupLoadingIndicators(myevents.displayContainer);
            myevents.displayEvent(atdw.myevents.event.getQueryStringParameterByName('id'), atdw.myevents.event.getQueryStringParameterByName('date'), myevents.displayContainer);
            loadFromCache();
        });
    };

    myevents.displayEvent = function (eventId, queryStringEventDate, displayContainer) {
        setEventDate(queryStringEventDate);
        productDetailsContainer = displayContainer;
        atdw.myevents.distribution.getEvent(generateProductDetailsHtml, eventId, myevents.apiKey);
    };
    // Get the value of the query string
    myevents.getQueryStringParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    };
    // set the new search input and the default date into the search cache
    // then redirect to the search page
    myevents.searchEvents = function () {
        var searchTerm = $(myevents.searchBoxSelector).val();

        atdw.cache.setSearchCache(searchTerm, '', atdw.helpers.buildSearchDateRange(myevents.defaultDateRange), '', '', '', '');

        window.location.href = myevents.searchPageURL;
    };

    return myevents;

} ());/*!
* atdw.myevents.search.js
* controller for the myEvents white label site search view
* http://myevents.atdw.com.au/Distribution/WhiteLabel
*/
window.atdw = window.atdw || {};
window.atdw.myevents = window.atdw.myevents || {};
window.atdw.myevents.search = window.atdw.myevents.search || (function () {
    var search = {},
        STO = 'TVIC',
        resultFiltersText = {
            leisure_categories: 'Leisure Categories',
            business_types: 'Business Categories',
            location: 'Location',
            free_entry: 'Free Entry'
        };
    var locationTypes = {
        postcodes: 'postcodes',
        regions: 'regions'
    };
    /*
    * PUBLIC PROPERTIES - DEFAULT VALUES 
    ------------------------------------------------------------------------------*/

    // if you change these default values you should update the readme.txt as well

    // selectors for page output
    search.io = {};

    search.io.searchResultsContainer = '#atdwSearchResultsOutput';

    search.io.searchText = '#atdwSearchText';

    search.io.tagsList = '#atdwLeisureTags';
    search.io.tagsListContainer = '.tags.leisure';
    search.io.typesBusinessList = '#atdwBusinessTypes';
    search.io.typesBusinessListContainer = '.tags.business';

    search.io.calendar = 'div.atdw-multidatepicker';
    search.io.calendarAltField = '#atdwEventDates';
    search.io.dateRanges = '#atdwSearchDateRanges';
    search.io.dateRangeDisplaying = '.date-title .date-range-displaying';
    search.io.datesDisplaying = '.date-title .dates-displaying';

    search.io.locationsDivID = '#divLocations';
    search.io.locationsTextBox = '.atdwLocationText';
    search.io.locationsList = '.atdwAutocompleteList';
    search.io.locationsListID = '#atdwAutocompleteList';

    search.io.regionsDivID = '#divRegions';
    search.io.regionsSelect = '.atdwRegionsSelect';
    search.io.regionsSelectID = '#atdwRegionsSelect';

    search.io.clearLocation = '.clearLocation';
    search.io.typesCboxes = '.atdw-type';
    search.io.cboxFree = '#atdwFreeEntry';

    search.io.resultsFilteredBy = '#atdwResultsFilteredBy';
    search.io.resultFilter = '.resultFilter';
    search.io.resultsPerPage = '.resultCount';
    search.io.pageNumber = '.pageNumber'; // this must be a single class name starting with a "."
    search.io.resultsDisplaying = '.results-displaying';
    search.io.pagingContainer = '#atdwPaging';

    search.io.textSelectDisabled = '.atdw-tags, .date-ranges, .types, .result-per-page, .paging';
    search.io.loadingIndicator = 'atdw-loading-spinner';
    search.io.filterGroupButtons = '.filter-group.buttons';
    
    search.io.scrollToTopSelector = '.atdw-wls-page';
    
    search.settings = {};

    // ensure there is an element with selector search.io.resultsPerPage that has this value
    // by default that's 10, 25, or 50
    search.settings.defaultResultsPerPage = 10;

    // this text should match to one of the LIs inside search.io.dateRanges
    search.settings.defaultDateRange = 'All';

    search.settings.eventPageURL = 'event.htm';
    search.settings.resourceURL = '';

    // the user may restrict which locations search results will display in
    search.settings.locations = {};
    search.settings.locations.postcodes = [];
    search.settings.locations.councils = [];
    search.settings.locations.regions = [];

    search.settings.username = "";

    // Search filter categores, only show events which meet the criteria, empty is all events
    search.settings.categories = [];

    search.settings.apiKey = '132';

    search.settings.autoUpdateFilters = false;

    search.settings.locationsType = locationTypes.postcodes; // postcodes, regions

    /*
    * PRIVATE PROPERTIES
    ------------------------------------------------------------------------------*/

    var pageNumberClass = search.io.pageNumber.substring(1, search.io.pageNumber.length),
        resultFilterClass = search.io.resultFilter.substring(1, search.io.resultFilter.length),
        tags_spinner,
        tags_el,
        tagsBus_el,
        locations_spinner,
        locations_el,
        results_spinner,
        results_el,
        EVENT_SEARCH_FN;

    /*
    * PUBLIC FUNCTIONS
    ------------------------------------------------------------------------------*/

    // intialise
    search.setBaseUrl = function (base) {
        search.settings.resourceURL = base + '/_resources/' + STO + '/wls/';
    };

    // display loading indicators in areas that will be loaded asyncronously
    search.start = function (IOSettings, searchSettings) {
        $.extend(search.io, IOSettings);
        $.extend(search.settings, searchSettings);

        var opts = {
            className: search.io.loadingIndicator,
            top: '5px'
        }; // http://fgnass.github.com/spin.js/#usage for options

        tags_el = document.getElementById(search.io.tagsList.replace('#', ''));
        tagsBus_el = document.getElementById(search.io.typesBusinessList.replace('#', ''));

        locations_el = document.getElementById(search.io.locationsListID.replace('#', ''));
        results_el = document.getElementById(search.io.searchResultsContainer.replace('#', ''));

        try {
            tags_spinner = new Spinner(opts).spin(tags_el);
            locations_spinner = new Spinner(opts).spin(locations_el);
            results_spinner = new Spinner(opts).spin(results_el);
        } catch (ex) {
            // swallow
        }

        $(document).ready(function () {
            delayLoad($(search.io.dateRanges), 'atdwSelectList');
            if (search.io.textSelectDisabled != '') {
                delayLoad($(search.io.textSelectDisabled), 'atdwDisableTextSelect');
            }

            //startTags();
            startBusinessTypes();

            // if location type is passed in as regions
            if (search.settings.locationsType === locationTypes.regions) {
                startRegions();
                $(search.io.regionsDivID).show();
                $(search.io.locationsDivID).hide();
            } else {
            startLocations();
                $(search.io.locationsDivID).show();
                $(search.io.regionsDivID).hide();
            }
            
            search.initialiseMultiDatePicker();
            search.getEventsFromCache(); // start searching!
        });

    };

    // load the search results from the cache
    search.getEventsFromCache = function () {
        search.getEvents(null, null, null, true);
    };

    // performs an asyncronous search
    // pass boolean true to freeTextOnly to only use the main free input box for searching
    // pass page number and number of results to modify the position of the result set
    // returns HTML output
    search.getEvents = function (freeTextOnly, pageNumber, numberOfResults, loadFromCache) {

        var callback = printSearchOutput;

        // store which filters have been applied; these are displayed in the menu across the top of the search interface
        var resultFilters = [],
            searchText, tags, dates, locations, free, leisure, business, types,
            cache = atdw.cache.getSearchCache();

        if (loadFromCache && cache) {
            searchText = cache.searchText;
            $(search.io.searchText).val(searchText);

            tags = cache.tags;
            if (tags.length > 0) {
                resultFilters.push(resultFiltersText.leisure_categories);
            }

            types = cache.types;
            if (types && types.length > 0) {
                resultFilters.push(resultFiltersText.business_types);
            }

            dates = cache.dates;

            updateDateDisplaying(dates, resultFilters);

            locations = cache.locations;
            if (locations && ((locations.postcodes && locations.postcodes.length > 0) || (locations.regions && locations.regions.length > 0))) {
                resultFilters.push(resultFiltersText.location);
            }

            free = cache.free;
            if (free) {
                $(search.io.cboxFree).attr('checked', 'checked');
                resultFilters.push(resultFiltersText.free_entry);
            }

            dates = cache.dates;
            setDateRange(dates);

            pageNumber = cache.pageNumber;
            setSelectedPage(pageNumber);

            numberOfResults = cache.numberOfResults;
            setNumberOfPages(numberOfResults);

        } else {

            searchText = $(search.io.searchText).val();

            if (freeTextOnly)
                tags = '';
            else {
                tags = getSelectedTagsToSearch();
                if (tags.length > 0) {
                    resultFilters.push(resultFiltersText.leisure_categories);
                }
            }

            if (freeTextOnly)
                types = '';
            else {
                types = getSelectedTypesToSearch();
                if (types && types.length > 0) {
                    resultFilters.push(resultFiltersText.business_types);
                }
            }
            if (freeTextOnly) {
                dates = atdw.helpers.buildSearchDateRange(search.settings.defaultDateRange);
                $(search.io.calendar).each(function () {
                    $(this).displaySelectedList(this);
                });
            } else {
                dates = search.getDateFilter();
                dates = updateDateDisplaying(dates, resultFilters);
            }

            if (freeTextOnly)
                locations = '';
            else {
                locations = {};
                var locationFilters = [];

                // if the locations type is regions - get a new single list of arrays
                if (search.settings.locationsType === locationTypes.regions) {
                    var selectedRegion = $(search.io.regionsSelectID).find(":selected").val();
                    if (selectedRegion) {
                        locationFilters.push(selectedRegion);
                    }
                    locations.regions = locationFilters;
                } else if (search.settings.locationsType === locationTypes.postcodes) {
                    // if locations type is postcodes, get values from locations textboxes

                $(search.io.locationsTextBox).each(function () {
                        var dataValue = $(this).data('value');
                        if (dataValue && dataValue != '') {
                            locationFilters.push(dataValue);
                        }
                });
                    locations.postcodes = locationFilters;
                }

                // if there's a region or a postcode selected
                if (locations && ((locations.regions && locations.regions.length > 0) || (locations.postcodes && locations.postcodes.length > 0))) {
                    resultFilters.push(resultFiltersText.location);
                }
            }

            if (freeTextOnly)
                free = '';
            else {
                free = $(search.io.cboxFree).is(':checked');
                if (free) {
                    resultFilters.push(resultFiltersText.free_entry);
                }
            }

            if (freeTextOnly) {
                if (!pageNumber || pageNumber === 0) pageNumber = 1;
                if (!numberOfResults || numberOfResults === 0) numberOfResults = search.settings.defaultResultsPerPage;
            } else {
                if (!pageNumber || pageNumber === 0) pageNumber = 1;
                if (!numberOfResults || numberOfResults === 0) {
                    numberOfResults = getPagesToSearch();
                }
            }

            if (freeTextOnly) {
                search.resetFilters(false);
            }

        }

        var blnLeisure = true, blnBusiness = true;

        // Make sure filter tags are always sent though if none are selected
        if (!tags || tags.length === 0) {
            blnLeisure = false;
            tags = search.settings.categories;
        }

        if (!types || types.length === 0) {
            blnBusiness = false;
        }

        if (results_spinner && results_spinner.spin) {
            results_spinner.spin(results_el);
        }

        atdw.myevents.distribution.eventSearch(callback, searchText, tags, dates, locations, free, blnLeisure, blnBusiness, pageNumber, numberOfResults, search.settings.apiKey, search.settings.locations, search.settings.username, types);

        atdw.cache.setSearchCache(searchText, tags, dates, locations, free, true, true, pageNumber, numberOfResults, types);

        updateResultFilters(resultFilters);

        // set search handlers
        setSearchHandlers();
    };

    // resets all search filters
    search.resetFilters = function (includeMainSearchBar) {
        $(':checkbox').removeAttr("checked");
        if (includeMainSearchBar)
            $('input[type=text]').val('');
        if ($(search.io.locationsList + ' li').length > 0) {
            $(search.io.locationsList).resetList();
        }
        setDefaultDateRange();
    };
    search.initialiseRegionDropdownlist = function (rawRegions) {
        var regionsRestricted = [];
        if (atdw.myevents.search.settings.locations && atdw.myevents.search.settings.locations.regions) {
            regionsRestricted = atdw.myevents.search.settings.locations.regions;
        }

        var regions = [], regionsList = [];

        // clear regions select - add empty item
        $(search.io.regionsSelectID).find('option').remove().end().append('<option value=""></option>');

        // check if selected regions are already cached
        var cache = atdw.cache.getProperty('locations');
        if (cache && cache.regions && cache.regions.length > 0) {
            for (var i = 0; i < cache.regions.length; i++) {
                regions.push(cache.regions[i]);
            }
        }

        // if there are regions to restrict to
        if (regionsRestricted.length > 0) {
            // loop through each raw region and check if it is contained in the restricted list
            $.each(rawRegions, function (index, item) {
                // if region is contained within restricted list - add it
                if (regionsRestricted.indexOf(item.Name) > -1) {
                    regionsList.push(item);
                }
            });
        } else {
            // no restricted regions - set the region list
            regionsList = rawRegions;
        }

        if (locations_spinner && locations_spinner.stop) {
            locations_spinner.stop();
        }

        $.each(regionsList, function (index, item) {
            var selected = regions.length > 0 && regions.indexOf(item.Name) > -1 ? ' selected ' : '';
            var option = $('<option ' + selected + '></option>').attr('value', item.Name).html(item.Name);
            $(search.io.regionsSelectID).append(option);
        });

        atdw.cache.setStaticProperty('static_regions', regionsList);
    };
    // set the location textbox to autocomplete with data from a list of locations
    search.initialiseLocationAutocomplete = function (rawLocations) {
        var locations = [];
        var cache = atdw.cache.getProperty('locations');
        if (cache && cache.postcodes && cache.postcodes.length > 0) {
            for (var i = 0; i < cache.postcodes.length; i++) {
                locations.push(cache.postcodes[i]);
            }
        }

        // stop loading spinner
        if (locations_spinner && locations_spinner.stop) {
            locations_spinner.stop();
        }

        // bind the atdw autocomplete plugin
        $(search.io.locationsList).autoCompleteList({
            maxFields: 5,
            source: rawLocations,
            existingLocations: locations,
            selectItemCallBack: setUpdateEventSearch,
            waterMarkText: 'Enter a post code or suburb name...',
            valueProperty: 'postcode',
            labelProperty: 'label'
        });
        // set cache property
        atdw.cache.setStaticProperty('static_locations', rawLocations);
    };

    search.initialiseMultiDatePicker = function () {
        var cache = atdw.cache.getProperty('dates');
        var dates = [];
        var noCache = false;
        if (cache && cache.length > 0) {
            for (var i = 0; i < cache.length; i++) {

                var startDate = atdw.helpers.dateFromWebService(cache[i].start);
                if (cache[i].days != 365) {

                    for (var j = 0; j < cache[i].days; j++) {

                        var dateToAdd = new Date(startDate);

                        dateToAdd.setDate(startDate.getDate() + j);
                        dates.push(dateToAdd.outputForDatePicker());
                    }
                }
            }
        }
        else {
            noCache = true;
            var today = new Date();
            dates.push(today.outputForDatePicker());
        }

        var context = $(search.io.calendar);
        while (true) {
            try {
                $(context).atdwMultiDatePicker({
                    altField: search.io.calendarAltField,
                    numberOfMonths: 1,
                    dates: dates,
                    minDate: 0,
                    displayListSelector: 'span.displayDates',
                    displayList: false,
                    selectDateCallback: function () {
                        // set select Date Callback
                        setUpdateEventSearch();
                    }
                });
                break;
            } catch (ex) {
                // keep trying this until it can be done
            }
        }

        if (noCache) {
            // set the default date range that the distributor has specified, then update it across the system
            setDefaultDateRange();
            updateDateDisplaying(search.getDateFilter());
        } else {
            if (cache.length === 1 && cache[0].range !== "Date Range") {
                updateDateDisplaying(cache[0]);
            } else {
                updateDateDisplaying();
            }
        }
    };

    // get an array of tags and format them into level 1 and 2 tags to show in the sidebar
    search.initialiseTags = function (rawTags) {
        var tagHTML = '';
        var prefix = 'atdw-tag-';

        var code;
        var name;
        var checked;

        var filters_cache = atdw.cache.getProperty('tags');

        // Only show tags in config if it exists
        var filterTags = [];
        if (search.settings.categories && search.settings.categories.length > 0) {
            // Filter the tag list so all tags are level one, and only render filter categores.
            var len = search.settings.categories.length;
            var i = 0;
            for (i; i < len; i++) {
                // We need to find the filtered tags, in the static tag list and put them all to level 1 tags.
                var tag = findTagById(rawTags, search.settings.categories[i]);
                if (tag) {
                    tag.Children = [];
                    filterTags.push(tag);
                }
            }
            rawTags = filterTags;
        }

        $.each(rawTags, function (lvlOneIndex, lvlOneTag) {
            tagHTML += '<li>';

            code = lvlOneTag.Code;
            name = lvlOneTag.Name;
            checked = jQuery.inArray(code, filters_cache) > -1;

            if (checked)
                tagHTML += '<input type="checkbox" checked="checked" value="' + code + '" id="' + prefix + code + '" />';
            else
                tagHTML += '<input type="checkbox" value="' + code + '" id="' + prefix + code + '" />';
            tagHTML += '<label for="' + prefix + code + '">' + name + '</label>';

            if (lvlOneTag.Children && lvlOneTag.Children.length > 0) {

                tagHTML += '<ul>';

                $.each(lvlOneTag.Children, function (lvlTwoIndex, lvlTwoTag) {
                    tagHTML += '<li>';

                    code = lvlTwoTag.Code;
                    name = lvlTwoTag.Name;
                    checked = jQuery.inArray(code, filters_cache) > -1;

                    if (checked)
                        tagHTML += '<input type="checkbox" checked="checked" value="' + code + '" id="' + prefix + code + '" />';
                    else
                        tagHTML += '<input type="checkbox" value="' + code + '" id="' + prefix + code + '" />';
                    tagHTML += '<label for="' + prefix + code + '">' + name + '</label>';

                    tagHTML += '</li>';
                });

                tagHTML += '</ul>';

            }

            tagHTML += '</li>';
        });

        if (tags_spinner && tags_spinner.stop) {
            tags_spinner.stop();
        }

        // if no tags - hide tag list
        if (tagHTML) {
            $(search.io.tagsListContainer).show();
            $(search.io.tagsList).html(tagHTML);
        } else {
            $(search.io.tagsListContainer).hide();
        }

        $(search.io.tagsList).atdwCollapsibleList({
            selectChildrenOnParentSelected: true,
            selectParentOnChildSelected: true,
            collapseIfChildSelected: true
        });

        atdw.cache.setStaticProperty('static_tags', rawTags);

    };

    search.initialiseBusinessTags = function (rawTags) {
        var tagHTML = '';
        var prefix = 'atdw-tag-';

        var value,
            text,
            selected;

        var filters_cache = atdw.cache.getProperty('types');

        $.each(rawTags, function () {
            tagHTML += '<li>';

            value = this.Code;
            text = this.Name;
            selected = jQuery.inArray(value, filters_cache) > -1;

            if (selected)
                tagHTML += '<input type="checkbox" checked="checked" value="' + value + '" id="' + prefix + value + '" />';
            else
                tagHTML += '<input type="checkbox" value="' + value + '" id="' + prefix + value + '" />';
            tagHTML += '<label for="' + prefix + value + '">' + text + '</label>';

            tagHTML += '</li>';
        });

        // if no types - hide type list
        if (tagHTML) {
            $(search.io.typesBusinessListContainer).show();
            $(search.io.typesBusinessList).html(tagHTML);
        } else {
            $(search.io.typesBusinessListContainer).hide();
        }

        // start collapsible list
        $(search.io.typesBusinessList).atdwCollapsibleList({
            selectChildrenOnParentSelected: true,
            selectParentOnChildSelected: true,
            collapseIfChildSelected: true
        });

        // set cache
        atdw.cache.setStaticProperty('static_bus_types', rawTags);
    };

    // gets a date object based on which of the date range texts is selected
    // ie. today/this week/next weekend/all
    search.getDateFilter = function () {
        var selectedDateRange = $(search.io.dateRanges + ' li.selected input[type=hidden]').val();

        return atdw.helpers.buildSearchDateRange(selectedDateRange);
    };

    // depending if autoUpdateFilters parameter is set or not - show/hide filter update buttons.
    search.toggleUpdateButtons = function () {
        var updateFilterDiv = "<div class='filter-group'><a href='' class='btn' onclick='atdw.myevents.search.getEvents(false); return false;' title='Update Results'>Update Results</a>" +
            "<a href='' class='btn btn-small' onclick='atdw.myevents.search.resetFilters(true); return false;' title='Reset Filters'>Reset Filters</a></div>";
        $(search.io.filterGroupButtons).html();
        if (!search.settings.autoUpdateFilters) {
            $(search.io.filterGroupButtons).append(updateFilterDiv);
        }
    };
    /*
    * PRIVATE FUNCTIONS
    ------------------------------------------------------------------------------*/

    function startTags() {
        var callback = atdw.myevents.search.initialiseTags;
        var tagCache = atdw.cache.getProperty('static_tags');

        if (!tagCache || tagCache.length === 0) {
            atdw.myevents.distribution.getTags(callback, atdw.myevents.search.settings.apiKey);
        } else {
            callback(tagCache);
        }
    };

    function startBusinessTypes() {
        var businessCallback = atdw.myevents.search.initialiseBusinessTags;
        var businessTypeCache = atdw.cache.getProperty('static_bus_types');

        if (!businessTypeCache || businessTypeCache.length === 0) {
            atdw.myevents.distribution.getProductSubTypes(businessCallback, atdw.myevents.search.settings.apiKey, 'BUSINESS');
        } else {
            businessCallback(businessTypeCache);
        }
    }

    // Take a list of tags, and find one by its ID
    function findTagById(tagList, tagCode) {
        var len1 = tagList.length;
        var len2;
        var taglvl1;
        var taglvl2;
        var taglvl2List = [];
        var i = j = 0;

        for (i; i < len1; i++) {
            taglvl1 = tagList[i];
            if (taglvl1.Code === tagCode) {
                return taglvl1;
            }

            taglvl2List = taglvl1.Children;

            if (taglvl2List && taglvl2List.length > 0) {
                len2 = taglvl2List.length;
                for (j; j < len2; j++) {
                    taglvl2 = taglvl2List[j];
                    if (taglvl2.Code === tagCode) {
                        return taglvl2;
                    }
                }
            }
        }
    };

    function startLocations() {
        var callback = atdw.myevents.search.initialiseLocationAutocomplete;

        var c = atdw.cache.getProperty('static_locations');

        if (c == null) {
            atdw.myevents.distribution.getLocations(callback, atdw.myevents.search.settings.apiKey, atdw.myevents.search.settings.locations);
        } else {
            callback(c);
        }
    };

    function startRegions() {
        var callback = atdw.myevents.search.initialiseRegionDropdownlist;

        var c = atdw.cache.getProperty('static_regions');

        if (c == null) {
            atdw.myevents.distribution.getRegions(callback, atdw.myevents.search.settings.apiKey, atdw.myevents.search.settings.locations.state);
        } else {
            callback(c);
        }
    }
    function scrollToTop() {
        var topElement = $(search.io.scrollToTopSelector);
        $("html, body").animate({ scrollTop: topElement.position().top }, 'slow');
    }

    // formats the output of the asyncronous events search
    function printSearchOutput(events) {
        // scroll to the top
        scrollToTop();

        var HTMLoutput;

        var multimediaNotFound = search.settings.resourceURL + 'images/no-image-small.jpg';

        if (events.result == "success") {

            HTMLoutput = '<ul class="search-results">';

            $.each(events.response, function (productIndex, product) {
                HTMLoutput += '<li>';

                var mm = '';

                if (product.Multimedia && product.Multimedia.length > 0) {
                    var hasMM = false;
                    var multimedia;
                    for (var i = 0; i < product.Multimedia.length; i++) {
                        multimedia = product.Multimedia[i];

                        if (!hasMM && multimedia.OrientationType == "WLSTHUMB") {
                            mm = '<img src="' + multimedia.ServerPath + '" title="' + multimedia.AltText +
                        '" alt="' + multimedia.AltText + '" width="170" class="product" onerror="this.onerror=null;this.src=\'' + multimediaNotFound + '\';" />';
                            hasMM = true;
                            break;
                        }
                    }

                    if (!hasMM) {
                        mm = '<img src="' + multimediaNotFound + '" title="no image with correct orientation found" ' +
                    'alt="no image with correct orientation found" width="170" class="product" />';
                    }

                } else {
                    mm = '<img src="' + multimediaNotFound + '" title="placeholder image" alt="placeholder image" width="170" class="product" />';
                }

                HTMLoutput += wrapEventHyperlink(product.ID, product.Date, mm, 'product-image'); // add clickable image

                HTMLoutput += '<div class="details">';

                var unconfirmedStatus = "";
                //loop through attributes and find unconfirmed
                if (product.Attribute && product.Attribute.length > 0) {

                    var attribute;
                    for (var a = 0; a < product.Attribute.length; a++) {
                        attribute = product.Attribute[a];
                        if (attribute.AttributeTypeId == "EVT STATUS" && attribute.AttributeID == "UNCONFIRMD") {
                            unconfirmedStatus = " (TBC)";
                            break;
                        }
                    }
                }
                //add unconfirmed string to end of product name
                HTMLoutput += '<h3>' + wrapEventHyperlink(product.ID, product.Date, product.Name + unconfirmedStatus) + '</h3>';

                var d = atdw.helpers.dateFromWebService(product.Date);
                var dateString = d.getDayName() + ' ' + d.getDate() + ' ' + d.getMonthName() + ' ' + d.getFullYear();

                HTMLoutput += '<div class="date">' + dateString + '</div>';

                if (product.Venues && product.Venues.length > 0) {
                    HTMLoutput += '<div class="address">' + wrapVenueAddress(product.Venues[0]) + '</div>';
                }

                var desc = product.Description.split(" ");
                HTMLoutput += '<div class="description">';
                for (var x = 0; x < 10; x++) {
                    HTMLoutput += desc[x] + " ";
                }
                HTMLoutput += wrapEventHyperlink(product.ID, product.Date, '. . . (more)') + ' </div>'; // close description

                HTMLoutput += '</div>'; // close details

                HTMLoutput += '</li>';
            });

            HTMLoutput += '</ul>';

            $(search.io.searchResultsContainer).html(HTMLoutput);

            updatePaging(events.resultcount);

        } else if (events.result == "empty") {

            HTMLoutput = '<div class="search-results no-results">No results found.</div>';

            $(search.io.searchResultsContainer).html(HTMLoutput);

            updatePaging(events.resultcount);

        } else if (events.result == "error") {

            var responseStatus = events.response.status;

            var responseError;

            if (responseStatus === 404) {
                responseError = "Could not contact the service.";
            } else if (responseStatus === 400) {
                responseError = "Configuration error - please follow the instructions provided in README.txt.";
            } else {
                responseError = "An error occurred. " + events.response.statusText;
            }

            HTMLoutput = '<div class="search-results no-results">' + responseError + '</div>';

            $(search.io.searchResultsContainer).html(HTMLoutput);

        }

        if (results_spinner && results_spinner.stop) {
            results_spinner.stop();
        }
    };

    // takes { TotalMatches: response.TotalMatches, PageNumber: intPageNumber, ResultsPerPage: intResultsPerPage }
    function updatePaging(counts) {
        var resultsPerPage = counts.ResultsPerPage;
        var totalMatchCount = counts.TotalMatches;
        var requestedPage = counts.PageNumber;

        // 47 matches, 25 per page = 2 pages
        // 20 results, 10 per page = 2 pages
        var numberOfPages = Math.floor((totalMatchCount - 1) / resultsPerPage) + 1;

        var pagingOutput = '<ul class="select-list paging pagination">';

        if (totalMatchCount > 0) {
            // don't show "previous" link on first page
            if (requestedPage != 1)
                pagingOutput += wrapPageNumber('Previous');

            if (numberOfPages > 7) {
                if (requestedPage <= 4) {  // format: 1 2 3 4 5 ... n
                    if (requestedPage == 1)
                        pagingOutput += wrapPageNumber(1, 'selected');
                    else
                        pagingOutput += wrapPageNumber(1);
                    if (requestedPage == 2)
                        pagingOutput += wrapPageNumber(2, 'selected');
                    else
                        pagingOutput += wrapPageNumber(2);
                    if (requestedPage == 3)
                        pagingOutput += wrapPageNumber(3, 'selected');
                    else
                        pagingOutput += wrapPageNumber(3);
                    if (requestedPage == 4)
                        pagingOutput += wrapPageNumber(4, 'selected');
                    else
                        pagingOutput += wrapPageNumber(4);

                    pagingOutput += wrapPageNumber(5);
                    pagingOutput += wrapPageNumber('. . .', 'no-click');
                    pagingOutput += wrapPageNumber(numberOfPages);
                } else if (numberOfPages - requestedPage < 4) {  // format: 1 ... n-4 n-3 n-2 n-1 n
                    pagingOutput += wrapPageNumber(1);
                    pagingOutput += wrapPageNumber('. . .', 'no-click');
                    pagingOutput += wrapPageNumber(numberOfPages - 4);

                    if (requestedPage == (numberOfPages - 3))
                        pagingOutput += wrapPageNumber(requestedPage, 'selected');
                    else
                        pagingOutput += wrapPageNumber(numberOfPages - 3);
                    if (requestedPage == (numberOfPages - 2))
                        pagingOutput += wrapPageNumber(requestedPage, 'selected');
                    else
                        pagingOutput += wrapPageNumber(numberOfPages - 2);
                    if (requestedPage == (numberOfPages - 1))
                        pagingOutput += wrapPageNumber(requestedPage, 'selected');
                    else
                        pagingOutput += wrapPageNumber(numberOfPages - 1);
                    if (requestedPage == numberOfPages)
                        pagingOutput += wrapPageNumber(requestedPage, 'selected');
                    else
                        pagingOutput += wrapPageNumber(numberOfPages);
                } else {  // format: 1 ... n-3 n-2 n-1 n n+1 n+2 n+3 ... n
                    pagingOutput += wrapPageNumber(1);
                    pagingOutput += wrapPageNumber('. . .', 'no-click');
                    pagingOutput += wrapPageNumber(requestedPage - 3);
                    pagingOutput += wrapPageNumber(requestedPage - 2);
                    pagingOutput += wrapPageNumber(requestedPage - 1);
                    pagingOutput += wrapPageNumber(requestedPage, 'selected');
                    pagingOutput += wrapPageNumber(requestedPage + 1);
                    pagingOutput += wrapPageNumber(requestedPage + 2);
                    pagingOutput += wrapPageNumber(requestedPage + 3);
                    pagingOutput += wrapPageNumber('. . .', 'no-click');
                    pagingOutput += wrapPageNumber(numberOfPages);
                }

            } else { // if there are seven or less pages, paging is simple; just show all
                for (var i = 1; i <= numberOfPages; i++) {
                    if (i == requestedPage) {
                        pagingOutput += wrapPageNumber(i, 'selected');
                    } else {
                        pagingOutput += wrapPageNumber(i);
                    }
                }
            }

            // don't show "next" link on last page
            if (requestedPage != numberOfPages)
                pagingOutput += wrapPageNumber('Next');

        }

        pagingOutput += '</ul>';

        $(search.io.pagingContainer).html(pagingOutput);

        // set appropriate results-per-page to bold
        $(search.io.resultsPerPage).each(function () {
            if ($(this).text() == resultsPerPage) {
                $(this).addClass("selected");
            } else {
                $(this).removeClass("selected");
            }
        });

        // set a click handler for selecting a new page number
        $(search.io.pageNumber).unbind('click');
        $(search.io.pageNumber).not('.no-click').click(function () {
            var pageNumberElement = $(this);

            var pageText = pageNumberElement.text();
            var pageNumber = parseInt(pageText, 10);

            if (!isNaN(pageNumber)) {

                // only action if we are actually going to change page
                if (pageNumber != requestedPage) {
                    search.getEvents(false, pageNumber, resultsPerPage);
                }
            } else if (pageText == 'Previous') {
                if (requestedPage != 1) {
                    search.getEvents(false, --requestedPage, resultsPerPage);
                }
            } else if (pageText == 'Next') {
                if (requestedPage != numberOfPages) {
                    search.getEvents(false, ++requestedPage, resultsPerPage);
                }
            }
        });

        // set a click handler for selecting a new number of results per page
        $(search.io.resultsPerPage).unbind('click'); // unbind; don't want multiple handlers on the click
        $(search.io.resultsPerPage).click(function () {

            var newResultsPerPage = parseInt($(this).text(), 10);

            if (!isNaN(newResultsPerPage)) {

                // only action if we are actually going to change the number of results displayed
                if (newResultsPerPage != resultsPerPage) {

                    // if we go from 10 rpp to 50 rpp the paging we're likely to have nothing on this page, so jump back to p1
                    if (newResultsPerPage > resultsPerPage)
                        search.getEvents(false, 1, newResultsPerPage);
                    else
                        search.getEvents(false, requestedPage, newResultsPerPage);
                }
            }
        });

        if (totalMatchCount > 0) {
            var first = ((requestedPage - 1) * resultsPerPage) + 1; // eg. page 2, 10 results/page --> first = 11
            var last = first + (resultsPerPage - 1); // eg. page 2, 10 results/page --> first = 11 --> last = 20
            if (last > totalMatchCount) {
                last = totalMatchCount;
            } // eg. "displaying 11-20 of 19" --> "displaying 11-19 of 19"
            var text;

            if (requestedPage === 1 && numberOfPages === 1) {
                text = 'Displaying ' + totalMatchCount + '  result' + (totalMatchCount === 1 ? '' : 's') + '.';
            } else {
                text = 'Displaying results ' + first + '-' + last + ' of  ' + totalMatchCount + '.';
            }

            $(search.io.resultsDisplaying).show();
            $(search.io.resultsDisplaying).html(text);
        } else {
            $(search.io.resultsDisplaying).hide();
        }
    };

    // update the "results filtered by" section at the top of the page based on the filters selected by the user
    function updateResultFilters(resultFilters) {
        if (resultFilters) {
            var output = '';

            for (var i = 0; i < resultFilters.length; i++) {
                var text = resultFilters[i];
                if (text === search.settings.defaultDateRange) continue;
                output += '<li class="' + resultFilterClass + '">' + text + '</li>';
            }

            $(search.io.resultsFilteredBy).html(output);

            // TOOD (AG): can this be setup once on doc.ready?
            $(search.io.resultFilter).unbind('click');
            $(search.io.resultFilter).on('click', function () {
                if ($(this).html() != search.settings.defaultDateRange) {

                    switch ($(this).html()) {
                        case resultFiltersText.leisure_categories:
                            $($(search.io.tagsList + ' li').find('input:checked')).each(function () {
                                $(this).removeAttr('checked');
                            });
                            break;

                        case resultFiltersText.location:
                            if (search.settings.locationsType === locationTypes.postcodes) {
                            $(search.io.locationsList).each(function () {
                                $(this).resetList();
                            });
                            } else if (search.settings.locationsType === locationTypes.regions) {
                                $(search.io.regionsSelectID).val('');
                            }
                            break;
                        case resultFiltersText.free_entry:
                            $(search.io.cboxFree).each(function () {
                                $(this).removeAttr('checked');
                            });
                            break;

                        case resultFiltersText.business_types:
                            $(search.io.typesBusinessList + ' li').find('input:checked').each(function () {
                                $(this).removeAttr('checked');
                            });
                            break;
                        case 'This Weekend':
                        case 'This Week':
                        case 'Next Week':
                        case 'This Month':
                        case 'Today':
                        case 'Date Range':
                            $(search.io.dateRanges + ' li').removeClass("selected"); // deselect all date ranges
                            $(search.io.dateRanges + ' li:contains("' + search.settings.defaultDateRange + '")').click();
                            break;


                    }
                    search.getEvents(); // update search results
                }
            });
        }
    };

    function updateDateDisplaying(dates, resultFilters) {
        if (!dates) dates = {};
        if (!resultFilters) resultFilters = [];

        var dateRangeDisplay = '';
        var dateDisplay = '';

        var datesSearched;

        $(search.io.calendar).each(function () {
            if ($(this).children('div').length > 0) {
                datesSearched = $(this).getDatesForWebService();

                // if there is only one date range selected, and it matches the "dates" input (the selected quick filter)
                if (dates.length === 1 && datesSearched.length === 1 && datesSearched[0].days === dates[0].days && datesSearched[0].start === dates[0].start) {
                    datesSearched = dates;
                } else {
                    dates = datesSearched;
                }
                dateDisplay = $(this).getSelectedList(this);

                var dateRangeFilter = search.getDateFilter();
                var dateRangeDays;

                if (datesSearched && dateRangeFilter && datesSearched.length == dateRangeFilter.length && datesSearched[0].start == dateRangeFilter[0].start && datesSearched[0].days == dateRangeFilter[0].days) {
                    dateRangeDisplay = dateRangeFilter[0].range;
                    dateRangeDays = dateRangeFilter[0].days;
                } else {
                    dateRangeDisplay = datesSearched[0].range;
                    dateRangeDays = datesSearched[0].days;
                }
                if (dateRangeDisplay == "Date Range") {
                    if (dateRangeDays != 365)
                        resultFilters.push('Date Range');
                } else {
                    // select appropriate dateRange coming back from the cache.
                    resultFilters.push(dateRangeDisplay);
                }

            } else {
                if (dates[0].days != 365) {
                    resultFilters.push(dates[0].range);
                }
            }

            $(search.io.dateRangeDisplaying).html(dateRangeDisplay);
            $(search.io.datesDisplaying).html(dateDisplay);
        });
        return datesSearched;
    }

    /* HELPERS
    ------------------------------------------------------------------------------*/

    function wrapEventHyperlink(ID, date, linktext, className) {
        if (!className)
            className = '';
        else
            className = 'class = "' + className + '"';

        return '<a href="' + search.settings.eventPageURL + '?id=' + ID + '&date=' + date + '" title="view event" ' + className + '>' + linktext + '</a>';
    };

    function wrapPageNumber(number, extraClass) {
        if (extraClass) {
            return '<li class="' + pageNumberClass + ' ' + extraClass + '"><a>' + number.toString() + '</a></li>';
        } else {
            return '<li class="' + pageNumberClass + '"><a>' + number.toString() + '</a></li>';
        }
    };

    // formats a venue entity in HTML.
    function wrapVenueAddress(venueItem) {
        var venue = '<div class="venue-name">' + venueItem.Name + '</div>';

        venue += '<div class="city">';
        if (venueItem.City && venueItem.City != '') {
            venue += venueItem.City + ', ';
        } else if (venueItem.Suburb && venueItem.Suburb != '') {
            venue += venueItem.Suburb + ', ';
        }

        if (venueItem.State && venueItem.State != '') {
            venue += atdw.helpers.stateFromAbbreviation(venueItem.State) + ' ';
        }

        if (venueItem.Postcode && venueItem.Postcode != '') {
            venue += venueItem.Postcode;
        }
        venue += '</div>';

        return venue;
    }

    // determine which tags are selected and return an array of them
    function getSelectedTagsToSearch() {
        var tagList = [];
        var checkboxInput = 'input[type=checkbox]';

        var levelOneItems = $(search.io.tagsList).children('li');
        var checked = ':checked';

        $(levelOneItems).each(function () {
            var levelOneTag = $(this).children(checkboxInput);
            var levelTwoTags = $(this).find('ul li ' + checkboxInput);
            var selectedLevelTwoTags = $(this).find('ul li input' + checked);

            if ($(levelTwoTags).length <= 0) {
                //If there are no children check if the parent is checked and add
                if ($(levelOneTag).is(checked) == true) {
                    tagList.push($(levelOneTag).val());
                }
            }
            else if (levelTwoTags.length == selectedLevelTwoTags.length) {
                //If all the level two tags are selected send the top level tag
                tagList.push($(levelOneTag).val());
            }
            else {
                //Send the level two tags
                $(selectedLevelTwoTags).each(function () {
                    if ($(this).is(checked))
                        tagList.push($(this).val());
                });
            }
        });

        return tagList;
    }

    function getSelectedTypesToSearch() {
        var typeList = [];
        var checkboxInput = 'input[type=checkbox]';

        var checked = ':checked';

        var businessInputItems = $(search.io.typesBusinessList).children('li').children(checkboxInput);

        $(businessInputItems).each(function () {
            if ($(this).is(checked)) {
                typeList.push($(this).val());
            }
        });

        return typeList;
    }

    // determine which page to search and how many results to display
    // get page 1 with 10 resultes by default
    function getPagesToSearch() {
        var resultCount = $(search.io.resultsPerPage + '.selected');

        if (resultCount && resultCount.length == 1) {
            return resultCount.html();
        } else {
            return search.settings.defaultResultsPerPage;
        }
    }

    // set the number of pages filter to display the appropriate number as selected
    function setNumberOfPages(num) {
        $(search.io.resultsPerPage).removeClass('selected');
        $(search.io.resultsPerPage).each(function () {
            if ($(this).html() === num)
                $(this).addClass('selected');
        });
    }

    // set the number of pages filter to display the appropriate number as selected
    function setSelectedPage(num) {
        $(search.io.pageNumber).removeClass('selected');
        $(search.io.pageNumber).each(function () {
            if ($(this).html() === num)
                $(this).addClass('selected');
        });
    }

    // sets the date range loaded from cache. eg. Today, This Week...
    function setDateRange(dates) {
        if (dates == null || dates.length <= 0 || !(dates[0]['range'])) return;

        var date = dates[0]['range'];
        var days = parseInt(dates[0]['days']);

        $(search.io.dateRanges + ' li').removeClass('selected');
        var item;
        if (date == 'This Week') {
            //This week returns two items, we need to only select the one related to this week
            var items = $($(search.io.dateRanges + ' li:contains(This Week)'));
            for (var i = 0; i < items.length; i++) {
                if ($.trim($(items[i]).text()).split(' ')[1] == 'Week') {
                    item = $(items[i]);
                }
            }
        }
        else {
            item = $(search.io.dateRanges + ' li:contains(' + date + ')');
        }
        if (!item || !item.length) {
            if (date == 'Date Range' && days == 365) {
                item = $(search.io.dateRanges + ' li:contains(All)');
            }
        }
        //Set all date to selected if the item is null, and the days = 365
        if (item && item.length) {
            item.addClass("selected");
        }
    }

    // sets the default date range based on the settings specified
    function setDefaultDateRange() {
        $(search.io.dateRanges + ' li').removeClass("selected"); // deselect all date ranges
        $(search.io.dateRanges + ' li:contains("' + search.settings.defaultDateRange + '")').click(); // select default date range
    };

    // try and call a function that may not yet be loaded on an object
    // keep trying until the function can be called
    function delayLoad(el, func) {
        try {
            el[func]();
        } catch (ex) {
            setTimeout(function () {
                delayLoad(el, func);
            }, 50);
        }
    };

    // find all controls in the search form that should trigger a new event search.
    // build click events that call 'update event search' method to queue and new event search function call
    function setSearchHandlers() {
        // create jq selectors for controls
        var tagListSelector = search.io.tagsList + ' li input[type="checkbox"]',
        typeBusinessListSelector = search.io.typesBusinessList + ' li input[type="checkbox"]',
        dateRanges = search.io.dateRanges + ' li';

        // select a date range
        $(dateRanges).click(function () {
            setUpdateEventSearch();
        });

        // select / deselect a tag list item
        $(tagListSelector).unbind('change');
        $(tagListSelector).change(function () {
            setUpdateEventSearch();
        });

        // select / deselect a business tag list item
        $(typeBusinessListSelector).unbind('change');
        $(typeBusinessListSelector).change(function () {
            setUpdateEventSearch();
        });

        // checkbox 'free entry' change
        $(search.io.cboxFree).unbind('change');
        $(search.io.cboxFree).change(function () {
            setUpdateEventSearch();
        });

        // checkbox 'free entry' change
        $(search.io.regionsSelectID).unbind('change');
        $(search.io.regionsSelectID).change(function () {
            setUpdateEventSearch();
        });
    }

    function setUpdateEventSearch() {
        if (search.settings.autoUpdateFilters === true) {
            // clear timeout 
            clearTimeout(EVENT_SEARCH_FN);

            // save new widget config vals
            EVENT_SEARCH_FN = setTimeout(function () {
                // event search
                search.getEvents(false);
            }, 1000);
        }
    }

    return search;

} ());
