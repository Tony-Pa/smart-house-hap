module.exports = {
    list: {},
    add: function (model) {
        this.list[model.id] = model;
    },
    get: function (id) {
        return this.list[id];
    }
};

