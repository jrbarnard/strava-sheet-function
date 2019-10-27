'use strict';

const Auth = require('../../strava/auth');
const Client = require('../../strava/client');

class StravaAuth {

    constructor (config, athleteRepository) {
        // Set up strava resources
        this.client = new Client(config.get('STRAVA_CLIENT_ID'), config.get('STRAVA_CLIENT_SECRET'));
        this.auth = new Auth(this.client, config.get('STRAVA_REDIRECT_URI'));
        this.athleteRepository = athleteRepository;
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

        const athlete = token.athlete;
        delete token.athlete;

        try {
            let existingAthlete = await this.athleteRepository.findByAthleteId(athlete.id);

            if (!existingAthlete) {
                await this.athleteRepository.create({
                    athlete_id: athlete.id,
                    first_name: athlete.firstname,
                    last_name: athlete.lastname,
                    created_at: new Date(),
                    updated_at: new Date(),
                    token: JSON.stringify(token),
                });
            } else {
                await this.athleteRepository.update(existingAthlete, {
                    updated_at: new Date(),
                    token: JSON.stringify(token),
                });
            }
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