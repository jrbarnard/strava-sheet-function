'use strict';

const Repository = require('./repository');
const Athlete = require('../models/athlete');

class AthleteRepository extends Repository {

    constructor (datastore) {
        super(datastore);
        this.model = Athlete
    }

    async findByAthleteId (athleteId) {
        const athleteQuery = this.datastore.createQuery('athlete')
            .filter('athlete_id', athleteId)
            .limit(1);

        const [athletes] = await this.datastore.runQuery(athleteQuery);

        return athletes ? athletes[0] : null;
    }
}

module.exports = AthleteRepository;