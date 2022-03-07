const semver = require('semver');
const { toText, transliterateObject, toMD } = require('./functions');
const { scripts } = require('../scripts');
const { templates } = require('./templates');
const moment = require('moment');
const path = require('path');
const fse = require('fs-extra');
const _ = require('lodash');

// output(filename, text) -> simply outputs the text
// output(filename, text, data) -> uses text as a template and interpolates the data using lodash syntax https://lodash.com/docs/4.17.11#template
// output(filename, data) -> outputs data as JSON
async function output(filename, text, data) {
  if (data) {
    text = _.template(text, {})(data);
  } else if (typeof text !== 'string') {
    text = JSON.stringify(
      text,
      (key, value) => (key.startsWith('$') ? undefined : value),
      4
    );
  }
  //console.log('Writing file %s', filename);
  return await fse.outputFile(path.join(outputDir, filename), text);
}

async function outputs(packageName, api, swaggerUrl, componentJson, outputDir) {
  let version = api.info.version;
  let sv = semver.coerce(api.info.version);
  if (!sv) {
    version = '0.0.1';
  } else {
    version = sv.version;
  }

  let textDescription = toText(api.info.description);
  await output('lib/spec.json', api);
  await output(
    'package.json',
    Object.assign(JSON.parse(templates.packageTemplate), {
      name: packageName,
      version: version,
      description: textDescription,
      scripts: scripts,
    })
  );
  await output(
    'package-lock.json',
    Object.assign(JSON.parse(templates.packagelockTemplate), {
      name: packageName,
      version: version,
    })
  );

  await output('lib/utils/helpers.js', templates.helpersTemplate);

  transliterateObject(componentJson);
  await output('component.json', componentJson);

  await output('README.md', templates.readmeTemplate, {
    api: api,
    openapiUrl: swaggerUrl,
    moment: moment,
    componentJson: componentJson,
    packageName: packageName,
    toText: toText,
    toMD: toMD,
  });
}

module.exports = {
  output,
  outputs,
};