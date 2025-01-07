const {withMod} = require('@expo/config-plugins');
const obj = require('@expo/config-plugins/build/utils/obj');
const warnings = require('../_utils/warnings');

/**
 * Helper method for creating mods from existing config functions.
 *
 * @param action
 */
function createInfoPlistPlugin(action, name) {
  const withUnknown = config =>
    withInfoPlist(config, async config => {
      config.modResults = await action(config, config.modResults);
      return config;
    });
  if (name) {
    Object.defineProperty(withUnknown, 'name', {
      value: name,
    });
  }
  return withUnknown;
}

function createInfoPlistPluginWithPropertyGuard(action, settings, name) {
  const withUnknown = config =>
    withInfoPlist(config, async config => {
      const existingProperty = settings.expoPropertyGetter
        ? settings.expoPropertyGetter(config)
        : obj.get(config, settings.expoConfigProperty);
      // If the user explicitly sets a value in the infoPlist, we should respect that.
      if (
        config.modRawConfig.macos?.infoPlist?.[settings.infoPlistProperty] ===
        undefined
      ) {
        config.modResults = await action(config, config.modResults);
      } else if (existingProperty !== undefined) {
        // Only warn if there is a conflict.
        warnings.addWarningMacOS(
          settings.expoConfigProperty,
          `"macos.infoPlist.${settings.infoPlistProperty}" is set in the config. Ignoring abstract property "${settings.expoConfigProperty}": ${existingProperty}`,
        );
      }
      return config;
    });
  if (name) {
    Object.defineProperty(withUnknown, 'name', {
      value: name,
    });
  }
  return withUnknown;
}

/**
 * Helper method for creating mods from existing config functions.
 *
 * @param action
 */
function createEntitlementsPlugin(action, name) {
  const withUnknown = config =>
    withEntitlementsPlist(config, async config => {
      config.modResults = await action(config, config.modResults);
      return config;
    });
  if (name) {
    Object.defineProperty(withUnknown, 'name', {
      value: name,
    });
  }
  return withUnknown;
}

/**
 * Provides the AppDelegate file for modification.
 *
 * @param config
 * @param action
 */
const withAppDelegate = (config, action) => {
  return withMod(config, {
    platform: 'macos',
    mod: 'appDelegate',
    action,
  });
};

/**
 * Provides the Info.plist file for modification.
 * Keeps the config's expo.macos.infoPlist object in sync with the data.
 *
 * @param config
 * @param action
 */
const withInfoPlist = (config, action) => {
  return withMod(config, {
    platform: 'macos',
    mod: 'infoPlist',
    async action(config) {
      config = await action(config);
      if (!config.macos) {
        config.macos = {};
      }
      config.macos.infoPlist = config.modResults;
      return config;
    },
  });
};

/**
 * Provides the main .entitlements file for modification.
 * Keeps the config's expo.macos.entitlements object in sync with the data.
 *
 * @param config
 * @param action
 */
const withEntitlementsPlist = (config, action) => {
  return withMod(config, {
    platform: 'macos',
    mod: 'entitlements',
    async action(config) {
      config = await action(config);
      if (!config.macos) {
        config.macos = {};
      }
      config.macos.entitlements = config.modResults;
      return config;
    },
  });
};

/**
 * Provides the Expo.plist for modification.
 *
 * @param config
 * @param action
 */
const withExpoPlist = (config, action) => {
  return withMod(config, {
    platform: 'macos',
    mod: 'expoPlist',
    action,
  });
};

/**
 * Provides the main .xcodeproj for modification.
 *
 * @param config
 * @param action
 */
const withXcodeProject = (config, action) => {
  return withMod(config, {
    platform: 'macos',
    mod: 'xcodeproj',
    action,
  });
};

/**
 * Provides the Podfile for modification.
 *
 * @param config
 * @param action
 */
const withPodfile = (config, action) => {
  return withMod(config, {
    platform: 'macos',
    mod: 'podfile',
    action,
  });
};

/**
 * Provides the Podfile.properties.json for modification.
 *
 * @param config
 * @param action
 */
const withPodfileProperties = (config, action) => {
  return withMod(config, {
    platform: 'macos',
    mod: 'podfileProperties',
    action,
  });
};

exports.createEntitlementsPlugin = createEntitlementsPlugin;
exports.createInfoPlistPlugin = createInfoPlistPlugin;
exports.createInfoPlistPluginWithPropertyGuard =
  createInfoPlistPluginWithPropertyGuard;
exports.withXcodeProject = withXcodeProject;
exports.withPodfileProperties = withPodfileProperties;
exports.withPodfile = withPodfile;
exports.withInfoPlist = withInfoPlist;
exports.withExpoPlist = withExpoPlist;
exports.withEntitlementsPlist = withEntitlementsPlist;
exports.withAppDelegate = withAppDelegate;
