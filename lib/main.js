const { saveData, httpRequest } = require('./request.js');
module.exports = function (url, path, opt, conf) {
    return new Promise((resolve, reject) => {
        let input;
        if (conf) {
            input = Object.assign(conf, {
                onerror: reject,
                onsuccess: rec => saveData(rec, path).then(resolve).catch(reject),
            });
        }
        httpRequest(url, opt, input);
    });
};
