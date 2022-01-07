/**
 * Auto-generated trigger file for "$API_TITLE" API.
 *
 * Generated at: $NOW
 * Mass generator version: $GENERATOR_VERSION
 *
 * : $PACKAGE_NAME
 * Copyright © 2020,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 *
 *
 * Operation: $OPERATION_ID
 * Endpoint Path: $PATH
 * Method: $METHOD
 *
 */


const Swagger = require('swagger-client');
const spec = require('../spec.json');
const moment = require('moment')
// this wrapers offers a simplified emitData(data) function
module.exports = { process: processTrigger };

// parameter names for this call
const PARAMETERS = $PARAMETERS;

// mappings from connector field names to API field names
const FIELD_MAP = $FIELD_MAP;

function processTrigger(msg, cfg,snapshot) {
  var isVerbose = process.env.debug || cfg.verbose;
  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

  console.log('msg:', msg);
  console.log('cfg:', cfg);

  if (isVerbose) {
    console.log(`---MSG: ${JSON.stringify(msg)}`);
    console.log(`---CFG: ${JSON.stringify(cfg)}`);
    console.log(`---ENV: ${JSON.stringify(process.env)}`);
  }

  const contentType = $CONTENT_TYPE;

  const body = msg.data;
  mapFieldNames(body);

  let parameters = {};
  for (let param of PARAMETERS) {
    parameters[param] = body[param];
  }

  const oihUid =
    msg.metadata !== undefined && msg.metadata.oihUid !== undefined
      ? msg.metadata.oihUid
      : 'oihUid not set yet';
  const recordUid =
    msg.metadata !== undefined && msg.metadata.recordUid !== undefined
      ? msg.metadata.recordUid
      : undefined;
  const applicationUid =
    msg.metadata !== undefined && msg.metadata.applicationUid !== undefined
      ? msg.metadata.applicationUid
      : undefined;

  const newElement = {};
  const oihMeta = {
    applicationUid,
    oihUid,
    recordUid,
  };

  // credentials for this operation
  $SECURITIES;

  if (cfg.otherServer) {
    if (!spec.servers) {
      spec.servers = [];
    }
    spec.servers.push({ url: cfg.otherServer });
  }

  let callParams = {
    spec: spec,
    operationId: $OPERATION_ID,
    pathName: $PATH,
    method: $METHOD,
    parameters: parameters,
    requestContentType: contentType,
    requestBody: body,
    securities: { authorized: securities },
    server: spec.servers[cfg.server] || cfg.otherServer,
  };
  if (callParams.method === 'get') {
    delete callParams.requestBody;
  }

  if (isVerbose) {
    let out = Object.assign({}, callParams);
    out.spec = '[omitted]';
    console.log(`--SWAGGER CALL: ${JSON.stringify(out)}`);
  }

  // Call operation via Swagger client
  return Swagger.execute(callParams).then((data) => {
    delete data.uid;
    newElement.metadata = oihMeta;
    const response = JSON.parse(data.data);

    if (!cfg.nodeSettings.arraySplittingKey) {
      newElement.data = response;
    } else {
      newElement.data = cfg.nodeSettings.arraySplittingKey.split('.').reduce((p,c)=> p&&p[c]||null, response)
    }
    if (Array.isArray(newElement.data)) {
      newElement.data = newElement.data.filter(element => moment(element[$SNAPSHOT]).isAfter(snapshot.lastUpdated))
      for (let i = 0; i < newElement.data.length; i++) {
        const newObject = newElement;
        newObject.data = newElement.data[i];
        this.emit('data', newObject);
      }
    } else {
      this.emit('data', newElement);
    }
  });
}

function mapFieldNames(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(mapFieldNames);
  } else if (typeof obj === 'object' && obj) {
    obj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
    return obj;
  }
}
