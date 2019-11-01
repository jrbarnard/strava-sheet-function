'use strict';

const Url = require('../utils/url');
const Route = require('./route');
const Routes = require('./routes');
const HttpException = require('../exceptions/HttpException');
const NotFoundException = require('../exceptions/NotFoundException');

class Router {

    constructor (functionName) {
        this.functionName = functionName
        this.routes = new Routes();
    }

    /**
     * Add a route callback for the given method and path
     *
     * @param {*} method 
     * @param {*} path 
     * @param {*} callback 
     */
    addRoute (method, path, callback) {
        path = Url.stripSurroundingSlashes(path);

        const parts = path.split('/');

        // For each part we will move down the tree till we reach the base to append the route
        let routeLevels = this.routes;
        for (let part of parts) {
            routeLevels = routeLevels.getOrCreateLevel(part);
        }
        
        // Set the route on the last route level
        const route = new Route();
        route.addMethod(method.toUpperCase(), callback);
        routeLevels.setRoute(route);
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
        groupPath = Url.stripSurroundingSlashes(groupPath);

        let routeGroup;

        routeGroup = {
            get: (path, callback) => {
                this.get(groupPath + '/' + Url.stripSurroundingSlashes(path), callback)

                return routeGroup;
            },
            post: (path, callback) => {
                this.post(groupPath + '/' + Url.stripSurroundingSlashes(path), callback)

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
    matchRoute (path, routeLevel, params) {
        const paramRegex = /^:([a-z]+)$/i;
        const parts = path.split('/').filter(part => part !== '');
        params = params || {};

        // Loop over the parts and work down the route tree to identify which route we're at (or not)
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];

            // Check if subsequent level for part then set and continue
            if (routeLevel.hasLevel(part)) {
                routeLevel = routeLevel.getLevel(part);
                continue;
            }

            // No route exists for this part, could be it's invalid, or it's a route parameter
            let paramParts = Object.keys(routeLevel.routeLevels).filter(routeLevelPart => {
                return paramRegex.test(routeLevelPart);
            });

            // No params, invalid path
            if (paramParts.length === 0) {
                return null;
            }

            // We have some paramParts, traverse them to see which match
            let matchedRoute = paramParts.map(paramPart => {
                // Re build path to pass back into match route
                let subPath = parts.slice(i + 1).join('/');
                let matchedSubRoute = this.matchRoute(subPath, routeLevel.getLevel(paramPart), params);

                // Ensure param is saved to pass back up
                if (matchedSubRoute) {
                    matchedSubRoute.params[paramPart.substr(1)] = part;
                }

                return matchedSubRoute;
            }).find(matched => matched && matched.route instanceof Route);

            // If we found a matched route from the recursive look up then return
            if (matchedRoute) {
                return matchedRoute;
            }

            return null;
        }

        if (!routeLevel.hasRoute()) {
            return null;
        }

        return {
            route: routeLevel.getRoute(),
            params: params
        };
    }

    /**
     * Handle the route for the request
     *
     * @param {*} request 
     * @param {*} response 
     */
    async route (request, response) {
        const method = request.method.toUpperCase();
        let path = Url.stripSurroundingSlashes(request.path);

        // Strip off the function name prefix if we have it
        if (path.startsWith(this.functionName + '/')) {
            path = path.substr((this.functionName + '/').length);
        }

        // Match the path to a defined route
        let route = this.matchRoute(path, this.routes);

        if (!route) {
            throw new NotFoundException(`No route for path ${path}`);
        }

        if (!route.route.hasMethod(method)) {
            throw new HttpException('Method not allowed', 405);
        }

        request.routerPathParams = route.params;
        return route.route.handle(method, request, response);
    }
}

module.exports = Router;