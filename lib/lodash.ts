/** Used to map characters to HTML entities. */
const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Used to match HTML entities and HTML characters. */
const reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;
const reUnescapedHtml = /[&<>"']/g;
const reHasEscapedHtml = RegExp(reEscapedHtml.source);
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

/** Used to map HTML entities to characters. */
const htmlUnescapes = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns The new accessor function.
 */
function basePropertyOfFunc(
  object: { [key: string]: string },
): (key: string) => string {
  return function basePropertyOf(key: string) {
    return (object == null) ? '' : (object[key] ?? '');
  };
}

/**
 * Used by `_.escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} chr The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
const escapeHtmlChar = basePropertyOfFunc(htmlEscapes);

/**
* Used by `_.unescape` to convert HTML entities to characters.
*
* @private
* @param {string} chr The matched character to unescape.
* @returns {string} Returns the unescaped character.
*/
const unescapeHtmlChar = basePropertyOfFunc(htmlUnescapes);

/**
 * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
 * corresponding HTML entities.
 *
 * **Note:** No other characters are escaped. To escape additional
 * characters use a third-party library like [_he_](https://mths.be/he).
 *
 * Though the ">" character is escaped for symmetry, characters like
 * ">" and "/" don't need escaping in HTML and have no special meaning
 * unless they're part of a tag or unquoted attribute value. See
 * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
 * (under "semi-related fun fact") for more details.
 *
 * When working with HTML you should always
 * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
 * XSS vectors.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('fred, barney, & pebbles');
 * // => 'fred, barney, &amp; pebbles'
 */
export function escape(string: string): string {
  if (typeof string !== 'string') {
    return '';
  }

  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, escapeHtmlChar)
    : string;
}

/**
 * The inverse of `_.escape`; this method converts the HTML entities
 * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to
 * their corresponding characters.
 *
 * **Note:** No other HTML entities are unescaped. To unescape additional
 * HTML entities use a third-party library like [_he_](https://mths.be/he).
 *
 * @static
 * @memberOf _
 * @since 0.6.0
 * @category String
 * @param {string} [string=''] The string to unescape.
 * @returns {string} Returns the unescaped string.
 * @example
 *
 * _.unescape('fred, barney, &amp; pebbles');
 * // => 'fred, barney, & pebbles'
 */
export function unescape(string: string): string {
  if (typeof string !== 'string') {
    return '';
  }
  return (string && reHasEscapedHtml.test(string))
    ? string.replace(reEscapedHtml, unescapeHtmlChar)
    : string;
}
