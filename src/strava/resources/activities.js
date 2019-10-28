'use strict';

class Activities {
    constructor (client) {
        this.client = client;
    }

    /**
     * Get a single activity
     *
     * @param {*} id 
     */
    get (id) {
        return this.client.get(`activities/${id}`);
    }
}

module.exports = Activities;
