module.exports = {
    list: {},
    add(model, id) {
        this.list[id] = model;
    },
    get(id) {
        return this.list[id];
    }
};
