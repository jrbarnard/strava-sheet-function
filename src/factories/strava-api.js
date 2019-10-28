'use strict';

const Auth = require('../strava/auth');
const Client = require('../strava/client');

const clientFactory = (config) => {
    return new Client(config.get('STRAVA_CLIENT_ID'), config.get('STRAVA_CLIENT_SECRET'));
};

module.exports = {
    client: clientFactory,
    auth: (config) => {
        return new Auth(clientFactory(config), config.get('STRAVA_REDIRECT_URI'));
    }
};
