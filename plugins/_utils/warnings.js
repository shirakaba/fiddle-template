// https://github.com/expo/expo/blob/sdk-52/packages/%40expo/config-plugins/src/utils/warnings.ts

const chalk = require('chalk');

/**
 * Log a warning that doesn't disrupt the spinners.
 *
 * ```sh
 * » android: android.package: property is invalid https://expo.fyi/android-package
 * ```
 *
 * @param property Name of the config property that triggered the warning (best-effort)
 * @param text Main warning message
 * @param link Useful link to resources related to the warning
 */
function addWarningAndroid(property, text, link) {
  console.warn(formatWarning('android', property, text, link));
}

/**
 * Log a warning that doesn't disrupt the spinners.
 *
 * ```sh
 * » ios: ios.bundleIdentifier: property is invalid https://expo.fyi/bundle-identifier
 * ```
 *
 * @param property Name of the config property that triggered the warning (best-effort)
 * @param text Main warning message
 * @param link Useful link to resources related to the warning
 */
function addWarningIOS(property, text, link) {
  console.warn(formatWarning('ios', property, text, link));
}

/**
 * Log a warning that doesn't disrupt the spinners.
 *
 * ```sh
 * » macos: macos.bundleIdentifier: property is invalid https://expo.fyi/bundle-identifier
 * ```
 *
 * @param property Name of the config property that triggered the warning (best-effort)
 * @param text Main warning message
 * @param link Useful link to resources related to the warning
 */
function addWarningMacOS(property, text, link) {
  addWarningForPlatform('macos', property, text, link);
}

/**
 * Log a warning that doesn't disrupt the spinners.
 *
 * ```sh
 * » windows: windows.guid: property is invalid https://expo.fyi/windows-project-guid
 * ```
 *
 * @param property Name of the config property that triggered the warning (best-effort)
 * @param text Main warning message
 * @param link Useful link to resources related to the warning
 */
function addWarningWindows(property, text, link) {
  addWarningForPlatform('windows', property, text, link);
}

function addWarningForPlatform(platform, property, text, link) {
  console.warn(formatWarning(platform, property, text, link));
}
function formatWarning(platform, property, warning, link) {
  return chalk.yellow`${'» ' + chalk.bold(platform)}: ${property}: ${warning}${
    link ? chalk.gray(' ' + link) : ''
  }`;
}
exports.addWarningAndroid = addWarningAndroid;
exports.addWarningForPlatform = addWarningForPlatform;
exports.addWarningIOS = addWarningIOS;
exports.addWarningMacOS = addWarningMacOS;
exports.addWarningWindows = addWarningWindows;
