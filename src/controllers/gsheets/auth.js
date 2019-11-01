'use strict';

const {google} = require('googleapis');

class Auth {
    constructor (config) {
        this.clientId = config.get('GSHEETS_CLIENT_ID');
        this.clientSecret = config.get('GSHEETS_CLIENT_SECRET');
        this.redirectUri = config.get('GSHEETS_REDIRECT_URI');
    }

    getAuthClient () {
        return new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );
    }

    async postRedirect (req, res) {
        let code = req.query['code'];

        if (!code) {
            throw new HttpException('Invalid code');
        }

        const oAuth2Client = this.getAuthClient();

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

    authRedirect (req, res) {
        res.status(200).send(req.path);
        // const oAuth2Client = this.getAuthClient();

        // const authUrl = oAuth2Client.generateAuthUrl({
        //     access_type: 'offline',
        //     scope: ['https://www.googleapis.com/auth/drive.file'],
        // });

        // res.redirect(302, authUrl);
    }
}

module.exports = Auth;
