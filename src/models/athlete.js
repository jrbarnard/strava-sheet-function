'use strict';

const Model = require('./model')

class Athlete extends Model {
    static getIndexed () {
        return [
            'athlete_id',
            'created_at',
            'updated_at',
        ];
    }

    static getKey () {
        return 'athlete';
    }
}

module.exports = Athlete;