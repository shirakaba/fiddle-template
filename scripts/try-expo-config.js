const path = require('node:path');
const {
  getMacosModFileProviders,
} = require('../plugins/macos/withMacosBaseMods');

async function main() {
  const projectRoot = path.dirname(__dirname);

  /**
   * An Expo config that makes a modRequest for the macOS platform.
   * @type {import("@expo/config-plugins/build/Plugin.types.d.ts").ExportedConfigWithProps}
   */
  const config = {
    modRequest: {
      projectRoot,
      platformProjectRoot: path.join(projectRoot, 'macos'),
      projectName: 'Fiddle-macOS',
      introspect: true,
      modName: 'anyMod',
    },
    // TODO: try 'mods' property from ExportedConfig and fill in 'macos'.
  };

  for (const providerName in getMacosModFileProviders()) {
    if (providerName === 'dangerous' || providerName === 'finalized') {
      continue;
    }
    const provider = getMacosModFileProviders()[providerName];

    const filePath = await provider.getFilePath(config, {});
    const result = await provider.read(filePath, config, {});
    console.log(providerName, {filePath, result: !!result});
  }
}

main().catch(console.error);
