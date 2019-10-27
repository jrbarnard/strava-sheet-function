'use strict';

class Model {

    /**
     * Define in the model to specify which keys should be indexed
     */
    static getIndexed () {
        return [];
    }

    /**
     * Define in the model to specify the datastore key to use
     */
    static getKey () {
        return '';
    }
}

module.exports = Model;