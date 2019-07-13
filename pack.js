/* jshint node: true, esversion: 6 */
'use strict';

const fs = require('fs');
const jetpack = require('fs-jetpack');
const zip = require('node-zip')();

const format = jetpack.read('./dist/format.js', 'utf8');
const image = jetpack.read('./docs/use/icon.svg', 'utf8');
const license = jetpack.read('./docs/use/LICENSE', 'utf8');

zip
    .file('format.js', format)
    .file('icon.svg', image)
    .file('LICENSE.txt', license);

const bin = zip.generate({ base64 : false, compression : 'DEFLATE' });

fs.writeFileSync('./poof.zip', bin, 'binary');