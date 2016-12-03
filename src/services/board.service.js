module.exports = {
    list: {},
    add: function (model, id) {
        this.list[id] = model;
    },
    get: function (id) {
        return this.list[id];
    }
};

