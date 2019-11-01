'use strict';

const Url = require('../utils/url');
const Auth = require('../strava/auth');
const Client = require('../strava/client');

const clientFactory = (config) => {
    return new Client(config.get('STRAVA_CLIENT_ID'), config.get('STRAVA_CLIENT_SECRET'));
};

module.exports = {
    client: clientFactory,
    auth: (config) => {
        return new Auth(
            clientFactory(config),
            Url.create([
                config.get('API_BASE_URL'),
                config.get('STRAVA_REDIRECT_PATH')
            ])
        );
    }
};
