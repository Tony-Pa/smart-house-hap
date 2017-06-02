const async = require('async');

module.exports = {
    list: {},
    add(model, id) {
        this.list[id] = model;
    },
    get(id) {
        return this.list[id];
    },
    openAll(cb) {
        let openMethodsArr = [];

        Object.keys(this.list).forEach((key) => {
            openMethodsArr.push(this.get(key).sp.open.bind(this.get(key).sp));
        });

        async.parallel(openMethodsArr, cb);
    }
};
