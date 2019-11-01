'use strict';

const Route = require('./route');

class Routes {
    constructor () {
        this.routeLevels = {};
        this.route;
    }

    /**
     * Do we have an additional level?
     *
     * @param {*} pathPart 
     */
    hasLevel (pathPart) {
        return this.routeLevels[pathPart] !== undefined;
    }

    /**
     * Add an additional level
     *
     * @param {*} pathPart
     * @param {*} routes
     */
    addLevel (pathPart, routes) {
        this.routeLevels[pathPart] = routes;
    }

    /**
     * Get another level down
     *
     * @param {*} pathPart
     */
    getLevel (pathPart) {
        return this.routeLevels[pathPart];
    }

    /**
     * Helper to create a level down if we don't yet have it and return it
     *
     * @param {*} pathPart
     */
    getOrCreateLevel (pathPart) {
        if (!this.hasLevel(pathPart)) {
            this.addLevel(pathPart, new Routes());
        }

        return this.getLevel(pathPart);
    }

    /**
     * Do we have a route for this level
     */
    hasRoute () {
        return this.route instanceof Route;
    }

    /**
     * Get the route for this level
     */
    getRoute() {
        return this.route;
    }

    /**
     * Set the route for this level
     * @param {*} route 
     */
    setRoute (route) {
        this.route = route;
    }
}

module.exports = Routes;
