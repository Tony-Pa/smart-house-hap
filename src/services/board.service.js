module.exports = {
    list: {},
    add: function (model) {
        this.list[model.port] = model;
    },
    get: function (port) {
        return this.list[port];
    }
};

