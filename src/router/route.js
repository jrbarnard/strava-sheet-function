'use strict';

class Route {
    constructor () {
        this.handlers = {};
    }

    hasMethod (method) {
        return this.handlers[method] !== undefined;
    }

    addMethod (method, handler) {
        this.handlers[method] = handler;
    }

    handle (method, request, response) {
        return this.handlers[method](request, response);
    }
}

module.exports = Route;
