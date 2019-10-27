'use strict';

const NotFoundException = require('../exceptions/NotFoundException');

class Router {

    constructor (functionName) {
        this.functionName = functionName
        this.routes = {
            GET: {},
            POST: {},
        };
    }

    stripSurroundingSlashes (path) {
        if (path.startsWith('/')) {
            path = path.substr(1);
        }

        if (path.endsWith('/')) {
            path = path.substr(0, path.length - 1);
        }

        return path;
    }

    addRoute (method, path, callback) {
        path = this.stripSurroundingSlashes(path);
        this.routes[method.toUpperCase()][path] = {
            callback: callback,
        };
    }

    get (path, callback) {
        this.addRoute('GET', path, callback);
    }

    post (path, callback) {
        this.addRoute('POST', path, callback);
    }

    async route (request, response) {
        const method = request.method.toUpperCase();
        const routes = this.routes[method];
        let path = this.stripSurroundingSlashes(request.path);

        if (path.startsWith(this.functionName + '/')) {
            path = path.substr((this.functionName + '/').length);
        }

        if (routes[path] === undefined) {
            throw new NotFoundException(`No route for path ${path}`);
        }
        
        return routes[path].callback(request, response);
    }
}

module.exports = Router;