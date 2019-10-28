'use strict';

const HttpException = require('./HttpException');

class BadRequestException extends HttpException {
    constructor (message) {
        super(message || 'Bad request', 400);
    }
}

module.exports = BadRequestException;