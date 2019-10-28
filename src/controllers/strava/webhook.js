'use strict';

const { client } = require('../../factories/strava-api');
const BadRequestException = require('../../exceptions/BadRequestException');

/**
 * https://developers.strava.com/docs/webhooks/
 */
class StravaWebhook {

    constructor (config) {
        this.verifyToken = config.get('STRAVA_WEBHOOK_VERIFY_TOKEN');
        this.subscriptionId = parseInt(config.get('STRAVA_WEBHOOK_SUBSCRIPTION_ID'));
        this.client = client(config);
    }

    validate (req, res) {
        const token = req.query['hub.verify_token'];

        if (token !== this.verifyToken) {
            throw new BadRequestException('Invalid verify token');
        }

        res.status(200).send({
            'hub.challenge': req.query['hub.challenge'],
        });
    }

    handle (req, res) {
        if (!req.body.subscription_id || this.subscriptionId !== req.body.subscription_id) {
            throw new BadRequestException();
        }

        const objectType = req.body.object_type;
        const event = req.body.aspect_type;

        let events = {
            activity: {
                create: {
                    /**
                     * Handle the activity create event
                     * @param {*} request 
                     */
                    handle: function ({ objectId, athleteId }) {
                        // TODO:
                        // Get activity from the strava api
                        console.log(this.client.getActivity(objectId));
                    }
                },
            },
        };

        // Check we can handle specified event
        if (!events.hasOwnProperty(objectType) || !events[objectType].hasOwnProperty(event)) {
            return res.status(200).send({
                message: 'No handle for object event',
            });
        }

        events[objectType][event].handle({
            objectId: req.body.object_id,
            athleteId: req.body.owner_id,
        });
        
        res.status(200).send({
            message: 'Successfully processed event',
        });
    }
}

module.exports = StravaWebhook;