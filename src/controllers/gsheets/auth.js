'use strict';

class Auth {
    constructor () {

    }

    authRedirect (req, res) {
        // TODO: Handle google sheets oauth
        // https://developers.google.com/sheets/api/quickstart/nodejs
        res.status(200).send('Authorizing');
    }
}

module.exports = Auth;
