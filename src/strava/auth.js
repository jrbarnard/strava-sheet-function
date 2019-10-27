'use strict';

const { URL, URLSearchParams } = require('url');

class Auth {

    constructor (client, redirectUri) {
        this.base = 'https://www.strava.com/oauth/authorize';
        this.client = client;
        this.redirectUri = redirectUri;
    }

    /**
     * Get url to redirect to for strava oauth
     */
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

    /**
     * Get an access token for the strava api
     *
     * @param {string} token 
     * @param {string} type 
     */
    async getToken (token, type) {
        // TODO: Refresh token handling
        // type = type === 'code' ? 'authorization_code' : 'refresh_token'
        const data = {
            client_id: this.client.clientId,
            client_secret: this.client.clientSecret,
            grant_type: 'authorization_code',
            code: token,
        };

        try {
            let response = await this.client.post('oauth/token', data);

            return response.data;
        } catch (error) {
            console.log(`Failed to get strava oauth token from: ${token}, ${type} -  ${error.message}`);
            return Promise.resolve(false);
        }
    }
}

module.exports = Auth;