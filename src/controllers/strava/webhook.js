'use strict';

const { client } = require('../../factories/strava-api');
const BadRequestException = require('../../exceptions/BadRequestException');

/**
 * https://developers.strava.com/docs/webhooks/
 */
class StravaWebhook {

    constructor (config, athleteRepository) {
        this.verifyToken = config.get('STRAVA_WEBHOOK_VERIFY_TOKEN');
        this.subscriptionId = parseInt(config.get('STRAVA_WEBHOOK_SUBSCRIPTION_ID'));
        this.client = client(config);
        this.athleteRepository = athleteRepository;
    }

    /**
     * Validate the webhook for subscription set up
     *
     * @param {*} req 
     * @param {*} res 
     */
    validate (req, res) {
        const token = req.query['hub.verify_token'];

        if (token !== this.verifyToken) {
            throw new BadRequestException('Invalid verify token');
        }

        res.status(200).send({
            'hub.challenge': req.query['hub.challenge'],
        });
    }

    /**
     * Handle the strava webhook events
     *
     * @param {*} req 
     * @param {*} res 
     */
    async handle (req, res) {
        if (!req.body.subscription_id || this.subscriptionId !== req.body.subscription_id || !req.body.owner_id) {
            throw new BadRequestException();
        }

        // Do we have a registered athlete?
        const athlete = await this.athleteRepository.findByAthleteId(req.body.owner_id);
        if (!athlete) {
            throw new BadRequestException('Athlete not authorised yet, please authorise: /strava/auth');
        }

        // Set the token from the found athlete so we can authenticate against the api using their credentials
        this.client.setToken(JSON.parse(athlete.token));
        this.client.refreshTokenHandler = async function (updatedToken) {
            // Persist updated token into an athlete whenever the refresh token is refreshed by the client
            await this.athleteRepository.update(athlete, {
                updated_at: new Date(),
                token: JSON.stringify(updatedToken),
            });
        }.bind(this);

        const objectType = req.body.object_type;
        const event = req.body.aspect_type;

        // Register the events and handlers
        let events = {
            activity: {
                create: {
                    /**
                     * Handle the activity create event
                     * @param {*} request 
                     */
                    handle: async function ({ objectId }) {
                        const activity = await this.client.resources.activities.get(objectId);

                        // TODO: With activity data we will process & send to sheet                        
                    }.bind(this)
                },
            },
        };

        // Check we can handle specified event
        if (!events.hasOwnProperty(objectType) || !events[objectType].hasOwnProperty(event)) {
            return res.status(200).send({
                message: 'No handle for object event',
            });
        }

        try {
            await events[objectType][event].handle({
                objectId: req.body.object_id,
            });
        } catch (error) {
            console.log('Error during event handle');
            console.log(error);

            return res.status(500).send({
                message: 'Error during event process',
            });
        }
        
        return res.status(200).send({
            message: 'Successfully processed event',
        });
    }
}

module.exports = StravaWebhook;