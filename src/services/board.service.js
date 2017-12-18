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
            const serialPort = this.get(key).sp;
            openMethodsArr.push(serialPort.open.bind(serialPort));
        });

        async.parallel(openMethodsArr, cb);
    },
    healthCheck(id, cb) {
        this.get(id).healthCheck(cb)
    }
};
