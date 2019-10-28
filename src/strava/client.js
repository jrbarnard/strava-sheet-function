'use strict';

const axios = require('axios').default;
const Activities = require('./resources/activities');

class Client {
    constructor (clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.basePath =  'https://www.strava.com/api/v3';
        this.token = null;
        this.refreshTokenHandler = null;

        // Register resources
        this.resources = {
            activities: new Activities(this),
        };
    }

    getFullUrl (path) {
        return this.basePath + '/' + path;
    }
    
    setToken (tokenObject) {
        this.token = tokenObject;
    }

    isTokenExpired () {
        if (!this.token) {
            return true;
        }

        let expiresAt = new Date(this.token.expires_at * 1000);
        let now = new Date();

        return now.getTime() > expiresAt.getTime();
    }

    /**
     * Get the token from set, or get a new one via the refresh token
     */
    async getToken () {
        if (!this.isTokenExpired()) {
            return this.token.access_token;
        }

        if (!this.token || !this.token.refresh_token) {
            throw new Error('No token to refresh')
        }

        let response = await this.post('oauth/token', {
            client_id: this.client.clientId,
            client_secret: this.client.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: this.token.refresh_token,
        });

        this.token = response.data;

        // A callback to trigger when we get a refreshed token
        // Allows us to externally persist somewhere
        if (this.refreshTokenHandler) {
            await this.refreshTokenHandler(this.token);
        }

        return response.data.access_token;
    }

    /**
     * Generic api post
     *
     * @param {*} path 
     * @param {*} data 
     */
    post (path, data) {
        return axios.post(
            // A hacky override for the slightly different oauth path
            path === 'oauth/token' ? path : this.getFullUrl(path),
            data
        );
    }

    /**
     * Generic api get
     *
     * @param {*} path 
     */
    async get (path) {
        let headers = {
            'Content-Type': 'application/json'
        };

        let token = await this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return axios.get(this.getFullUrl(path), {
            headers: headers,
        });
    }
}

module.exports = Client;