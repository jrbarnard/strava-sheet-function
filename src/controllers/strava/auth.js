'use strict';

const Auth = require('./src/strava/auth');
const Client = require('./src/strava/client');

class StravaAuth {

    constructor (config, datastore) {
        // Set up strava resources
        this.client = new Client(config.get('STRAVA_CLIENT_ID'), config.get('STRAVA_CLIENT_SECRET'));
        this.auth = new Auth(client, config.get('STRAVA_REDIRECT_URI'));
        this.datastore = datastore;
    }

    authRedirect (req, res) {
        res.redirect(302, this.auth.getRequestUrl());
    }

    async postRedirect (req, res) {
        let code = req.query['code'];

        if (!code) {
            throw new HttpException('Invalid code');
        }

        let token = await this.auth.getToken(code, 'code');
        if (token === false) {
            throw new HttpException('An error occurred while getting the access token', 500);
        }

        // TODO: We have the token, store it somewhere...

        const athlete = token.athlete;
        delete token.athlete;

        try {
            this.datastore
                .save({
                    key: this.datastore.key('athlete'),
                    data: {
                        athlete_id: athlete.id,
                        first_name: athlete.firstname,
                        last_name: athlete.lastname,
                        created_at: new Date(),
                        updated_at: new Date(),
                        token: JSON.stringify(token),
                    }
                });
        } catch (error) {
            console.log(error);
            throw new HttpException('An error occurred while storing the access token', 500);
        }

        res.status(201).send({
            message: 'Thanks for authorizing',
        });
    }
}

module.exports = StravaAuth;