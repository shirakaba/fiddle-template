// https://github.com/expo/expo/blob/sdk-52/packages/%40expo/config-plugins/src/plugins/withIosBaseMods.ts

const path = require('node:path');
const {
  default: fs,
  promises: {readFile, writeFile},
} = require('node:fs');
const assert = require('node:assert');
const {
  BaseMods: {withGeneratedBaseMods, provider},
} = require('@expo/config-plugins');
const {Entitlements, Paths} = require('@expo/config-plugins/build/ios');
const {
  getInfoPlistPathFromPbxproj,
} = require('@expo/config-plugins/build/ios/utils/getInfoPlistPath');
const plist = require('@expo/plist');
const {default: JsonFile} = require('@expo/json-file');
const {project: xcodeProject} = require('xcode');
const {getPbxproj} = require('@expo/config-plugins/build/ios/utils/Xcodeproj');
const {fileExists} = require('../_utils/modules');
const sortObject = require('../_utils/sortObject');
const {addWarningMacOS} = require('../_utils/warnings');

function getEntitlementsPlistTemplate() {
  // TODO: Fetch the versioned template file if possible
  return {};
}

function getInfoPlistTemplate() {
  // TODO: Fetch the versioned template file if possible
  return {
    CFBundleDevelopmentRegion: '$(DEVELOPMENT_LANGUAGE)',
    CFBundleExecutable: '$(EXECUTABLE_NAME)',
    CFBundleIconFile: '',
    CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)',
    CFBundleName: '$(PRODUCT_NAME)',
    CFBundlePackageType: '$(PRODUCT_BUNDLE_PACKAGE_TYPE)',
    CFBundleInfoDictionaryVersion: '6.0',
    // CFBundleShortVersionString: '1.0',
    // CFBundleVersion: '1',
    LSMinimumSystemVersion: '$(MACOSX_DEPLOYMENT_TARGET)',
    NSAppTransportSecurity: {
      NSAllowsArbitraryLoads: true,
      NSExceptionDomains: {
        localhost: {
          NSExceptionAllowsInsecureHTTPLoads: true,
        },
      },
    },
    NSMainStoryboardFile: 'Main',
    NSPrincipalClass: 'NSApplication',
    NSSupportsAutomaticTermination: true,
    NSSupportsSuddenTermination: true,
  };
}

/**
 * @type {Partial<Record<string, import("@expo/config-plugins/build/plugins/createBaseMod").BaseModProviderMethods<any, any>>>}
 */
const defaultProviders = {
  dangerous: provider({
    getFilePath() {
      return '';
    },
    async read() {
      return {};
    },
    async write() {},
  }),
  finalized: provider({
    getFilePath() {
      return '';
    },
    async read() {
      return {};
    },
    async write() {},
  }),
  // Append a rule to supply AppDelegate data to mods on `mods.macos.appDelegate`
  appDelegate: provider({
    getFilePath({modRequest: {projectRoot}}) {
      // TODO: Get application AppDelegate file from pbxproj.
      // FIXME: this is hard-coded to look in the ios directory.
      return Paths.getAppDelegateFilePath(projectRoot);
    },
    async read(filePath) {
      return Paths.getFileInfo(filePath);
    },
    async write(filePath, {modResults: {contents}}) {
      await writeFile(filePath, contents);
    },
  }),
  // Append a rule to supply Expo.plist data to mods on `mods.macos.expoPlist`
  expoPlist: provider({
    isIntrospective: true,
    getFilePath({modRequest: {platformProjectRoot, projectName}}) {
      const supportingDirectory = path.join(
        platformProjectRoot,
        projectName,
        'Supporting',
      );
      return path.resolve(supportingDirectory, 'Expo.plist');
    },
    async read(filePath, {modRequest: {introspect}}) {
      try {
        return plist.parse(await readFile(filePath, 'utf8'));
      } catch (error) {
        if (introspect) {
          return {};
        }
        throw error;
      }
    },
    async write(filePath, {modResults, modRequest: {introspect}}) {
      if (introspect) {
        return;
      }
      await writeFile(filePath, plist.build(sortObject(modResults)));
    },
  }),
  // Append a rule to supply .xcodeproj data to mods on `mods.macos.xcodeproj`
  xcodeproj: provider({
    getFilePath({modRequest: {projectRoot}}) {
      // FIXME: The underlying call stack:
      //   Paths.getAllPBXProjectPaths()
      //     Paths.getAllXcodeProjectPaths()
      // ... is hard-coded to search under ios/**/*.xcodeproj
      return Paths.getPBXProjectPath(projectRoot);
    },
    async read(filePath) {
      const project = xcodeProject(filePath);
      project.parseSync();
      return project;
    },
    async write(filePath, {modResults}) {
      await writeFile(filePath, modResults.writeSync());
    },
  }),
  // Append a rule to supply Info.plist data to mods on `mods.macos.infoPlist`
  infoPlist: provider({
    isIntrospective: true,
    async getFilePath(config) {
      let project = null;
      try {
        // FIXME: finds the iOS project rather than the macOS one, because the
        // underlying Paths().getPBXProjectPath(projectRoot) is hard-coded to
        // return the iOS path.
        project = getPbxproj(config.modRequest.projectRoot);
      } catch {
        // noop
      }

      // Only check / warn if a project actually exists, this'll provide
      // more accurate warning messages for users in managed projects.
      if (project) {
        const infoPlistBuildProperty = getInfoPlistPathFromPbxproj(project);
        if (infoPlistBuildProperty) {
          //: [root]/myapp/macos/MyApp/Info.plist
          const infoPlistPath = path.join(
            //: myapp/macos
            config.modRequest.platformProjectRoot,
            //: MyApp/Info.plist
            infoPlistBuildProperty,
          );
          if (fileExists(infoPlistPath)) {
            return infoPlistPath;
          }
          addWarningMacOS(
            'mods.macos.infoPlist',
            `Info.plist file linked to Xcode project does not exist: ${infoPlistPath}`,
          );
        } else {
          addWarningMacOS(
            'mods.macos.infoPlist',
            'Failed to find Info.plist linked to Xcode project.',
          );
        }
      }
      try {
        // Fallback on glob...
        return await Paths.getInfoPlistPath(config.modRequest.projectRoot);
      } catch (error) {
        if (config.modRequest.introspect) {
          // fallback to an empty string in introspection mode.
          return '';
        }
        throw error;
      }
    },
    async read(filePath, config) {
      // Apply all of the Info.plist values to the expo.macos.infoPlist object
      // TODO: Remove this in favor of just overwriting the Info.plist with the Expo object. This will enable people to actually remove values.
      if (!config.macos) config.macos = {};
      if (!config.macos.infoPlist) config.macos.infoPlist = {};
      let modResults;
      try {
        const contents = await readFile(filePath, 'utf8');
        assert(contents, 'Info.plist is empty');
        modResults = plist.parse(contents);
      } catch (error) {
        // Throw errors in introspection mode.
        if (!config.modRequest.introspect) {
          throw error;
        }
        // Fallback to using the infoPlist object from the Expo config.
        modResults = getInfoPlistTemplate();
      }
      config.macos.infoPlist = {
        ...(modResults || {}),
        ...config.macos.infoPlist,
      };
      return config.macos.infoPlist;
    },
    async write(filePath, config) {
      // Update the contents of the static infoPlist object
      if (!config.macos) {
        config.macos = {};
      }
      config.macos.infoPlist = config.modResults;

      // Return early without writing, in introspection mode.
      if (config.modRequest.introspect) {
        return;
      }
      await writeFile(filePath, plist.build(sortObject(config.modResults)));
    },
  }),
  // Append a rule to supply .entitlements data to mods on `mods.macos.entitlements`
  entitlements: provider({
    isIntrospective: true,
    async getFilePath(config) {
      try {
        // FIXME: this, and various underlying functions it calls, is hard-coded
        // to search under the 'ios' directory
        Entitlements.ensureApplicationTargetEntitlementsFileConfigured(
          config.modRequest.projectRoot,
        );
        return (
          // FIXME: this, and various underlying functions it calls, is
          // hard-coded to search under the 'ios' directory
          Entitlements.getEntitlementsPath(config.modRequest.projectRoot) ?? ''
        );
      } catch (error) {
        if (config.modRequest.introspect) {
          // fallback to an empty string in introspection mode.
          return '';
        }
        throw error;
      }
    },
    async read(filePath, config) {
      let modResults;
      try {
        if (
          !config.modRequest.ignoreExistingNativeFiles &&
          fs.existsSync(filePath)
        ) {
          const contents = await readFile(filePath, 'utf8');
          assert(contents, 'Entitlements plist is empty');
          modResults = plist.parse(contents);
        } else {
          modResults = getEntitlementsPlistTemplate();
        }
      } catch (error) {
        // Throw errors in introspection mode.
        if (!config.modRequest.introspect) {
          throw error;
        }
        // Fallback to using the template file.
        modResults = getEntitlementsPlistTemplate();
      }

      // Apply all of the .entitlements values to the expo.macos.entitlements object
      // TODO: Remove this in favor of just overwriting the .entitlements with the Expo object. This will enable people to actually remove values.
      if (!config.macos) config.macos = {};
      if (!config.macos.entitlements) config.macos.entitlements = {};
      config.macos.entitlements = {
        ...(modResults || {}),
        ...config.macos.entitlements,
      };
      return config.macos.entitlements;
    },
    async write(filePath, config) {
      // Update the contents of the static entitlements object
      if (!config.macos) {
        config.macos = {};
      }
      config.macos.entitlements = config.modResults;

      // Return early without writing, in introspection mode.
      if (config.modRequest.introspect) {
        return;
      }
      await writeFile(filePath, plist.build(sortObject(config.modResults)));
    },
  }),
  podfile: provider({
    getFilePath({modRequest: {projectRoot}}) {
      // FIXME: is hard-coded to look for the iOS path.
      return Paths.getPodfilePath(projectRoot);
    },
    // @ts-expect-error
    async read(filePath) {
      // Note(cedric): this file is ruby, which is a 1-value subset of AppleLanguage and fails the type check
      return Paths.getFileInfo(filePath);
    },
    async write(filePath, {modResults: {contents}}) {
      await writeFile(filePath, contents);
    },
  }),
  // Append a rule to supply Podfile.properties.json data to mods on `mods.macos.podfileProperties`
  podfileProperties: provider({
    isIntrospective: true,
    getFilePath({modRequest: {platformProjectRoot}}) {
      return path.resolve(platformProjectRoot, 'Podfile.properties.json');
    },
    async read(filePath) {
      let results = {};
      try {
        results = await JsonFile.readAsync(filePath);
      } catch {}
      return results;
    },
    async write(filePath, {modResults, modRequest: {introspect}}) {
      if (introspect) {
        return;
      }
      await JsonFile.writeAsync(filePath, modResults);
    },
  }),
};

function withMacosBaseMods(config, {providers, ...props} = {}) {
  return withGeneratedBaseMods(config, {
    ...props,
    platform: 'macos',
    providers: providers ?? getMacosModFileProviders(),
  });
}

function getMacosModFileProviders() {
  return defaultProviders;
}

exports.withMacosBaseMods = withMacosBaseMods;
exports.getMacosModFileProviders = getMacosModFileProviders;
