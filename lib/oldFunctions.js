
function json(obj) {
    return JSON.stringify(obj, null, 4);
}

// map schema field names to sane ones (without special chars, except of underscore)
function mapSchemaFieldNames(schema, map) {
    if(!schema || !schema.properties) {
        return;
    }
    _.forOwn(schema.properties, (val, key, props) => {
        mapSchemaFieldNames(val, map);
        let goodKey = key.replace(/[^a-z0-9_]/ig, '_');
        if(key !== goodKey) {
            // prevent name clashes
            while(map[goodKey] && map[goodKey] !== key) {
                goodKey += '_';
            }

            // rename key
            props[goodKey] = val;
            delete props[key];
        }
        map[goodKey] = key;
    });
}
function escapeUrlDots(url) {
    return url.replace(/\./g, '%2E');
}


function outputAction(params,test = false) {
    let content = test ? testAction.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]) : actionTemplate.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]);
    test ? output('lib/tests/testAction.js', content) : output('lib/actions/action.js', content);
}

function outputTrigger(params, test = false) {
    let content = test ? testTrigger.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]) : triggerTemplate.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]);
    test ? output('lib/tests/testTrigger.js', content) : output('lib/triggers/trigger.js', content);
}
function outputTestsYaml(params) {
    let content = testTemplate.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]);
    output('.github/workflows/tests.yml', content);
}

    // let xLogo = api.info['x-logo'];
    // if (xLogo && xLogo.url) {
    //     let logoUrl = xLogo.url;
    //     let logoPng = path.join(outputDir, filename('logo.png'));
    //     if (logoUrl.endsWith('.svg')) {
    //         waitFor.push(new Promise((resolve) => {
    //             gm(request(logoUrl)).resize(60, 60).write(logoPng, function (err) {
    //                 if (err) {
    //                     console.error('error converting logo, using default logo', err);
    //                     copyTemplate('logo.png', 'logo.png'); // default logo
    //                     //return reject(err);
    //                 }
    //                 resolve();
    //             });
    //         }));
    //     }
    //     else {
    //         waitFor.push(jimp.read(logoUrl).then(logo => {
    //             return logo.contain(60, 60).writeAsync(logoPng);
    //         }).catch(err => {
    //             console.error('error converting logo, using default logo', err);
    //             copyTemplate('logo.png', 'logo.png'); // default logo
    //         }));
    //     }
    // } else {
        // copyTemplate('logo.png', 'logo.png'); // default logo
    // }