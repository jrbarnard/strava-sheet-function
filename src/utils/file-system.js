'use strict';

const fs = require('fs');
const path = require('path');

class FileSystem {
    constructor (config) {
        this.config = config;
        this.root = config.get('APP_ROOT_DIR', __dirname);
    }

    /**
     * Get the contents of a file
     * @param {*} path 
     */
    get (path) {
        return new Promise((resolve, reject)  => {
            fs.readFile(path, (err, content) => {
                if (err) {
                    reject(err);
                }

                resolve(content);
            });
        });
    }

    /**
     * Get the contents of a json file parsed
     *
     * @param {*} path 
     */
    async getJson (path) {
        let content = await this.get(path);

        return JSON.parse(content);
    }

    /**
     * Get a path based on passed parts
     * [this.root, 'another', 'file.json']
     *
     * @param {*} pathParams 
     */
    getPath (pathParams) {
        pathParams = Array.isArray(pathParams) ? pathParams : [pathParams];

        return path.join(...pathParams);
    }
}

module.exports = FileSystem;