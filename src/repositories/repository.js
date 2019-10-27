'use strict';

class Repository {
    constructor (datastore) {
        this.datastore = datastore;
        this.model = null;
    }

    modelDefined () {
        return !!this.model;
    }

    castValue (key, value) {
        if (value instanceof Date) {
            value = value.toJSON();
        }

        return value;
    }

    async create (data) {
        if (!this.modelDefined()) {
            throw new Error('Model not defined');
        }

        const indexes = this.model.getIndexed();
        const formattedData = [];

        for (let key in data) {
            let value =  this.castValue(key, data[key]);

            formattedData.push({
                name: key,
                value: value,
                excludeFromIndexes: !indexes.includes(key),
            });
        }

        const key = this.datastore.key(this.model.getKey());

        await this.datastore
            .save({
                key: key,
                data: formattedData,
            });
    }

    async update (model, data) {
        for (let key in data) {
            let value =  this.castValue(key, data[key]);

            model[key] = value;
        }

        await this.datastore
            .save(model);
    }
}

module.exports = Repository;