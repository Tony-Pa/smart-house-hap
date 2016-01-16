

var Board = require('node-arduino')
    , board = new Board.connect('/dev/tty.usbmodem1421')
    ;

board.sp.open(function (error) {
    if ( error ) {
        console.log('failed to open: '+error);
    } else {
        console.log('open');
        setTimeout(function () {

            board.pinMode(13, Board.OUTPUT);


            var val = 50;
            setInterval(function () {
                if (val > 200) {
                   val = 0;
                }
                val+= 50;

                //console.log(val);/
                board.analogWrite(13, val);
                board.analogReadAverage(0, 5, function(v) {
                    console.log('read',v)
                }) ;

            }, 500);
        }, 1000);

    }
});
