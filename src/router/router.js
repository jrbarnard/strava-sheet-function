'use strict';

const HttpException = require('../exceptions/HttpException');
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

        if (!this.routes[path]) {
            this.routes[path] = {};
        }
        
        this.routes[path][method.toUpperCase()] = {
            callback: callback,
        };
    }

    /**
     * Register a get route
     *
     * @param {*} path 
     * @param {*} callback 
     */
    get (path, callback) {
        this.addRoute('GET', path, callback);
    }

    /**
     * Register a post route
     *
     * @param {*} path 
     * @param {*} callback 
     */
    post (path, callback) {
        this.addRoute('POST', path, callback);
    }

    /**
     * Create a routing group
     *
     * @param {*} groupPath 
     */
    group (groupPath) {
        groupPath = this.stripSurroundingSlashes(groupPath);

        let routeGroup;

        routeGroup = {
            get: (path, callback) => {
                this.get(groupPath + '/' + this.stripSurroundingSlashes(path), callback)

                return routeGroup;
            },
            post: (path, callback) => {
                this.post(groupPath + '/' + this.stripSurroundingSlashes(path), callback)

                return routeGroup;
            }
        }

        return routeGroup;
    }

    /**
     * Match a route to the passed path
     *
     * @param {*} path 
     */
    matchRoute (path) {
        const parts = path.split('/');
        let route = null;

        // Set directly?
        if (this.routes[path] !== undefined) {
            route = this.routes[path][method];
        }

        return route;
    }

    /**
     * Handle the route for the request
     *
     * @param {*} request 
     * @param {*} response 
     */
    async route (request, response) {
        const method = request.method.toUpperCase();
        let path = this.stripSurroundingSlashes(request.path);

        // Strip off the function name prefix if we have it
        if (path.startsWith(this.functionName + '/')) {
            path = path.substr((this.functionName + '/').length);
        }

        // Match the path to a defined route
        let route = this.matchRoute(path, method);

        if (!route) {
            throw new NotFoundException(`No route for path ${path}`);
        }

        if (route[method] === undefined) {
            throw new HttpException('Method not allowed', 405);
        }
        
        return route[method].callback(request, response);
    }
}

module.exports = Router;