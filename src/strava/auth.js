'use strict';

const { URL, URLSearchParams } = require('url');

class Auth {

    constructor (client, redirectUri) {
        this.base = 'https://www.strava.com/oauth/authorize';
        this.client = client;
        this.redirectUri = redirectUri;
    }

    getRequestUrl () {
        let url = new URL(this.base);

        const newSearchParams = new URLSearchParams(url.searchParams);
        newSearchParams.set('client_id', this.client.clientId);
        newSearchParams.set('redirect_uri', this.redirectUri);
        newSearchParams.set('response_type', 'code');
        newSearchParams.set('scope', 'activity:read_all');

        url.search = newSearchParams;
        return url;
    }

    getToken (code) {
        this.client.post('oauth/token', {
            client_id: this.client.clientId,
            client_secret: this.client.clientSecret,
            grant_type: 'authorization_code',
            code: code,
        });
    }
}

module.exports = Auth;