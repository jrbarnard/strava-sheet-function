'use strict';

const {google} = require('googleapis');

class Auth {
    constructor (config) {
        this.clientId = config.get('GSHEETS_CLIENT_ID');
        this.clientSecret = config.get('GSHEETS_CLIENT_SECRET');
        this.redirectUri = Url.create([
            config.get('API_BASE_URL'),
            config.get('GSHEETS_REDIRECT_PATH')
        ]);
    }

    getAuthClient (athleteId) {
        return new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            // Ensure redirecting to contextual link
            this.redirectUri.replace(':athleteId', athleteId)
        );
    }

    /**
     * routerPathParams:
     *  - athleteId
     * @param {*} req 
     * @param {*} res 
     */
    async postRedirect (req, res) {
        let code = req.query['code'];

        if (!code) {
            throw new HttpException('Invalid code');
        }

        const oAuth2Client = this.getAuthClient(req.routerPathParams.athleteId);

        let token = await new Promise((resolve, reject) => {
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    reject(err);
                }

                resolve(token);
            });
        });

        // TODO: Get the user and store tokens

        res.status(200).send(token);
    }

    /**
     * routerPathParams:
     *  - athleteId
     * @param {*} req 
     * @param {*} res 
     */
    authRedirect (req, res) {
        const oAuth2Client = this.getAuthClient(req.routerPathParams.athleteId);

        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive.file'],
        });

        res.redirect(302, authUrl);
    }
}

module.exports = Auth;
