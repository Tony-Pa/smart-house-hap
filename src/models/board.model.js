var Firmata = require("firmata");

function BoardModel (port) {
    Firmata.call(this, port);
    //this.board = board;
    this.port = port;
}

BoardModel.prototype = Object.create(Firmata.prototype);

BoardModel.prototype._analogRead = Firmata.prototype.analogRead;

BoardModel.prototype.analogRead = function(pin) {
    var self = this;
    return new Promise(function(resolve) {
        var handler = function (value) {
            resolve(value);
            self.removeListener('analog-read-' + pin, handler);
        };
        self._analogRead(pin, handler);
    });
};

BoardModel.prototype.analogReadAverage = function(pin, count) {
    var self = this;
    var i = 0;
    var sum = 0;
    return new Promise(function(resolve) {
        var handler = function (value) {
            i++;
            sum += value;
            console.log('_analogRead ', value);
            if (i >= count ) {
                sum /= count;
                resolve(sum);
                self.removeListener('analog-read-' + pin, handler);
            }
        };

        console.log('reading ', count);
        self._analogRead(pin, handler);
    });
};

BoardModel.prototype.constructor = BoardModel;

module.exports = BoardModel;
