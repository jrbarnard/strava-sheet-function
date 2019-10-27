'use strict';

const config = require('../../config');

module.exports = {
    getConfig () {
        return Object.assign({}, config, process.env);
    },
    get (key, defaultValue) {
        defaultValue = defaultValue || undefined

        return this.getConfig()[key] || defaultValue
    },
};
