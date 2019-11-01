'use strict';

module.exports = {
    stripSurroundingSlashes: function (path) {
        if (path.startsWith('/')) {
            path = path.substr(1);
        }

        if (path.endsWith('/')) {
            path = path.substr(0, path.length - 1);
        }

        return path;
    },
    create: function (parts) {
        parts = parts.map(part => {
            return this.stripSurroundingSlashes(part);
        });

        return parts.join('/');
    },
};