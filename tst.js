

var Board = require('node-arduino')
    , board = new Board.connect('/dev/tty.usbmodem1421')
    ;

board.sp.open(function (error) {
    if ( error ) {
        console.log('failed to open: '+error);
    } else {
        console.log('open');
        setTimeout(function () {

            board.pinMode(13, board.OUTPUT, board.HIGH);
            board.pinModeSetDefault(22, board.OUTPUT, board.HIGH);

            var val = 50;
            setInterval(function () {
                if (val > 200) {
                   val = 0;
                }
                val+= 50;

                //console.log(val);/
                board.analogWrite(13, val);
                //board.analogReadAverage(0, 5000, function(v) {
                //    console.log('read',v)
                //}) ;

                board.analogRead(0, function(v) {
                    console.log('read0',v)
                }) ;


                //_toggleLight();

            }, 500);
        }, 1000);

    }
});


function _toggleLight() {
    console.log('toggleLight pin: ', 22);

    board.digitalWrite(22, board.LOW);

    setTimeout(() => {
        board.digitalWrite(22, board.HIGH);
    }, 250);
}
