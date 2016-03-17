/* packages */
var raspi = require('raspi-io');

var five = require('johnny-five');
var CronJob = require('cron').CronJob;

var config = require('./res/config');


var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./res/config.json', 'utf8'));
console.log(obj);
/* pins  wiringPi*/
var pin_boiler_try = 2
var pin_boiler_real = 7

var temp, bar, boiler_try, boiler;

var board = new five.Board({
  io: new raspi()
});



board.on('ready', function() {

  temp = new five.Temperature({
    controller: "BMP180",
    freq: 5000
  });

  temp.on("data", function(data, err) {
    if (err) {
      console.log(err);
      return;
    }
    /*  console.log("celsius: %d", data.C);
      console.log("fahrenheit: %d", data.F);
      console.log("kelvin: %d", data.K);
      console.log("err: %d", err);*/
  });

  /*var alt = new five.Altimeter({
      controller: "BMP180",
    });

  alt.on("data", function(){
   console.log("Altitude");
      console.log("  feet   : ", this.feet);
      console.log("  meters : ", this.meters);
   console.log(" ");
 });*/

  bar = new five.Barometer({
    controller: "BMP180",
    freq: 5000
  });

  bar.on("data", function() {
    /*  console.log("barometer");
      console.log(" pressure : ", this.pressure);
      console.log("-----------------------------------------");*/
  });

  /* "boiler" is the real relay connected  between rasp and the boiler */
  boiler = new five.Relay(pin_boiler_real);


  /* "boiler_try" is a free relay connected to rasp*/
  boiler_try = new five.Relay(pin_boiler_try);

  this.repl.inject({
    boiler: boiler,
    boiler_try: boiler_try
  });

});

var boiler_on_saturday = new CronJob({
cronTime: '00 12 00 * * 6',
onTick: function(){
  boiler.off();
},
start:false,
timeZone:'Europe/Rome'
});

boiler_on_saturday.start();
var boiler_on = new CronJob({
  cronTime: '00 30 07 * * 1-5',
  onTick: function() {
    boiler.off();
  },
  start: false,
  timeZone: 'Europe/Rome'
});
boiler_on.start();

var boiler_off = new CronJob({
  cronTime: '00 20 19 * * 1-5',
  onTick: function() {
    boiler.on();

    console.log("boiler is off");
  },
  start: false,
  timeZone: 'Europe/Rome'
});
boiler_off.start();
