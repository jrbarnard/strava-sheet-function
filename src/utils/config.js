'use strict';

class Config {
    constructor (config) {
        this.config = config || {};
    }

    getConfig () {
        return this.config;
    }

    setConfig (config) {
        this.config = config || {};
    }

    get (key, defaultValue) {
        defaultValue = defaultValue || undefined

        return this.getConfig()[key] || defaultValue
    }

    set (key, value) {
        this.config[key] = value;
    }
}

module.exports = Config;
