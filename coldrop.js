/* packages */
var raspi = require('raspi-io');

var five = require('johnny-five');
var CronJob = require('cron').CronJob;

var config = require('./res/config');
var logger = require('./custom/logger');

logger.info("reading 'config.json'...");
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./res/config.json', 'utf8'));

/* pins  wiringPi*/
var pin_boiler_try = 2;
var pin_boiler_real = 7;
var cron_jobs = [];
var temp, bar, boiler_try, boiler;

var board = new five.Board({
  io: new raspi()
});

logger.info("setup the board");

board.on('ready', function() {

  temp = new five.Thermometer({
    controller: "BMP180",
    freq: 5000
  });

  temp.on("data", function(data, err) {
    if (err) {
      console.log(err);
      return;
    }

      /*console.log("celsius: %d", data.C);
      console.log("fahrenheit: %d", data.F);
      console.log("kelvin: %d", data.K);
      console.log("err: %d", err);*/
  });


  bar = new five.Barometer({
    controller: "BMP180",
    freq: 5000
  });

  bar.on("data", function() {/*
      console.log("barometer");
      console.log(" pressure : ", this.pressure);
      console.log("-----------------------------------------");*/
  });

  /* "boiler" is the real relay connected  between rasp and the boiler */
  boiler = new five.Relay({
  pin: pin_boiler_real,
  type: "NC"
});


  /* "boiler_try" is a free relay connected to rasp*/
  boiler_try = new five.Relay(pin_boiler_try);

parse(boiler);
  this.repl.inject({
    boiler: boiler,
    boiler_try: boiler_try
  });



/*
  var button = new five.Button(1);

  button.on("hold", function() {
    console.log( "Button held" );
  });

  button.on("press", function() {
    console.log( "Button pressed" );
  });

  button.on("release", function() {
    console.log( "Button released" );
  });
*/
});
function parse(boiler){

  logger.info("parsing 'config.json'...");
  for (var item of obj.config.program){

    var chrono_start = '00 '+item.start.minute+' '+item.start.hour+' * * '+item.day;
    logger.info("chrono start " + chrono_start);

     cron_jobs.push(new CronJob({
       cronTime: chrono_start,
       onTick: function() {
            if(boiler.isOn){
              logger.info("boiler is already ON");
            } else {
              boiler.on();
              logger.info("boiler is now ON");
            }


       },
       start: true,
       timeZone: 'Europe/Rome'
     }));
  }

for (var item of obj.config.program){
  var chrono_end = '00 '+item.end.minute+' '+item.end.hour+' * * '+item.day;
  logger.info("chrono end " + chrono_end);

   cron_jobs.push(new CronJob({
     cronTime: chrono_end,
     onTick: function() {
          if(!boiler.isOn){
            logger.info("boiler is already OFF");
          } else {
            boiler.off();
            logger.info("boiler is now OFF");
          }


     },
     start: true,
     timeZone: 'Europe/Rome'
   }));
   logger.info("parsing finished");
 }
}





// var boiler_on_saturday = new CronJob({
// cronTime: '00 00 12 * * 6',
// onTick: function(){
//   boiler.off();
//   setTimeout(boiler.toggle(), 2000);
//   setTimeout(boiler.off(), 2000);
// },
// start:false,
// timeZone:'Europe/Rome'
// });
//
// boiler_on_saturday.start();
// var boiler_on = new CronJob({
//   cronTime: '00 30 07 * * 1-5',
//   onTick: function() {
//
//
//
//     boiler.off();
//
//   },
//   start: false,
//   timeZone: 'Europe/Rome'
// });
// boiler_on.start();
//
// var boiler_off = new CronJob({
//   cronTime: '00 20 19 * * 1-5',
//   onTick: function() {
//     boiler.on();
//     setTimeout(boiler.on(), 2000);
//     console.log("boiler is off");
//   },
//   start: false,
//   timeZone: 'Europe/Rome'
// });
// boiler_off.start();
//
// function test(){
//   console.log(boiler.isOn());
// }
