'use strict';

const axios = require('axios').default;

class Client {
    constructor (clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.basePath =  'https://www.strava.com';
    }

    getFullUrl(path) {
        return this.basePath + '/' + path;
    }

    post (path, data) {
        return axios.post(
            this.getFullUrl(path),
            data
        );
    }
}

module.exports = Client;