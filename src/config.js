// This file resolves the configuration by reading from the environmental variable `PLUGIN_CONFIG`.

const configData = process.env.PLUGIN_CONFIG;

let config;
if (typeof configData != 'undefined') {
  config = JSON.parse(configData);
}

if (typeof config == 'undefined') {
  config = null;
}

export default config;
