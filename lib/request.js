const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const utilWriteFile = require('util').promisify(fs.writeFile);
const isURL = input => input instanceof URL || input.startsWith('http');

function saveData(content, filePath) {
    return new Promise((resolve, reject) => {
        makeDirSync(filePath);
        fs.writeFile(filePath, content, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve(path.resolve(filePath));
        });
    });
}

function makeDirSync(dirName) {
    try {
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
        }
    } catch (err) {
        throw new Error(err);
    }
}

// doc  http://nodejs.cn/api/http.html#http_http_request_conf_callback
// url, conf = {conf, oncreate, ondata, onend, onerror, onsuccess, timeout, https}
function httpRequest(...args) {
    let url = (opt = conf = {});
    let [_first, _second] = args;
    switch (args.length) {
        case 1:
            isURL(_first) ? (url = _first) : (opt = _first);
            break;
        case 2:
            isURL(_first) ? ((url = _first), (opt = conf = _second)) : ((opt = _first), (conf = _second));
            break;
        case 3:
            [url, opt, conf] = args;
            break;
        default:
            throw new Error('Wromg params');
    }
    let input = [url, opt].filter(e => !!e);
    let target = url.toString().startsWith('https') || options.port == 443 || conf.https ? https : http;
    // req:  http://nodejs.cn/api/http.html#http_class_http_clientrequest
    // res:  http://nodejs.cn/api/http.html#http_class_http_incomingmessage
    const req = target.request(...input, res => {
        let total = ''; // total data received
        res.setEncoding('utf8');
        if (conf.ondata) {
            res.on('data', chunk => {
                total += chunk;
                conf.ondata(chunk, total);
            });
        } else {
            res.on('data', chunk => {
                total += chunk;
            });
        }
        res.on('end', (...args) => {
            conf.onend && conf.onend(...args);
            if (total && conf.onsuccess) conf.onsuccess(total);
        });
    });
    req.on('error', conf.onerrer);
    conf.oncreate && conf.oncreate(res, req); // subtle request control
    req.write(conf.postData);  // a short cut for writing data to request body
    req.end();
}

module.exports = { saveData, httpRequest };
