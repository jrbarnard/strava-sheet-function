'use strict';

class Client {
    constructor (clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.basePath =  'https://www.strava.com';
    }

    // post (path, data) {
    //     https://www.strava.com/oauth/token
    // }
}

module.exports = Client;