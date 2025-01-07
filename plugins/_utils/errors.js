class UnexpectedError extends Error {
  name = 'UnexpectedError';
  constructor(message) {
    super(
      `${message}\nPlease report this as an issue on https://github.com/expo/expo/issues`,
    );
  }
}

/**
 * @typedef {'INVALID_PLUGIN_TYPE' | 'INVALID_PLUGIN_IMPORT' | 'PLUGIN_NOT_FOUND' | 'CONFLICTING_PROVIDER' | 'INVALID_MOD_ORDER' | 'MISSING_PROVIDER'} PluginErrorCode
 */

/**
 * Based on `JsonFileError` from `@expo/json-file`
 */
class PluginError extends Error {
  name = 'PluginError';
  isPluginError = true;

  /**
   *
   * @param {string} message
   * @param {PluginErrorCode} code
   * @param {Error} [cause]
   */
  constructor(message, code, cause) {
    super(
      cause ? `${message}\n└─ Cause: ${cause.name}: ${cause.message}` : message,
    );
    this.code = code;
    this.cause = cause;
  }
}

exports.UnexpectedError = UnexpectedError;
exports.PluginError = PluginError;
