/* packages */
var raspi = require('raspi-io');

var five = require('johnny-five');
var CronJob = require('cron').CronJob;

var config = require('./res/config');
var logger = require('./custom/logger');
var configFileName = 'config.json';
logger.info("reading '%d'...", configFileName);
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./res/'+configFileName, 'utf8'));
logger.info("completed");


fs.watch('./res/'+configFileName, (event, configFileName) => {
  console.log(`event is: ${event}`);
  if (configFileName) {
    console.log(`filename provided: ${filename}`);
  } else {
    console.log('filename not provided');
  }
});


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



  /* "boiler" is the real relay connected  between rasp and the boiler */
  boiler = new five.Relay({
  pin: pin_boiler_real,
  type: "NC"
});


  /* "boiler_try" is a free relay connected to rasp*/
  boiler_try = new five.Relay(pin_boiler_try);

  temp = new five.Thermometer({
    controller: "BMP180",
    freq: 5000
  });

  boiler.on();
  boiler.off();

  temp.on("change", function(data, err) {
    if (err) {
      logger.error(err);
      return;
    }
      logger.info("temperature changes: %d°", data.C);
      logger.debug("celsius: %d", data.C);
      logger.debug("fahrenheit: %d", data.F);
      logger.debug("kelvin: %d", data.K);
      onChangeTemp(22, data.C, 0.5);
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



createChrono(boiler);


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
function onChangeTemp(temp,currentTemp, tollerance){
var deltaTemp = 0;
deltaTemp = currentTemp - temp;

if (deltaTemp > tollerance) {
    if(!boiler.isOn){
      logger.info("onChange: boiler is already OFF");
    }else {
      boiler.off();
      logger.info("onChange: boiler is now OFF");
    }
}
deltaTemp = temp - currentTemp;
if (deltaTemp > tollerance) {
    if(boiler.isOn){
      logger.info("onChange: boiler is already ON");
    }else {
      boiler.on();
      logger.info("onChange: boiler is now ON");
    }
}

logger.info("onChange - boiler is ON: '"+boiler.isOn+"', with a temperature of %d°C", currentTemp);


}

function createChrono(boiler){

  logger.info("parsing 'config.json'...");
  var numberChrono = 0;
  for (var item of obj.config.program){

    var chrono_start = '00 '+item.start.minute+' '+item.start.hour+' * * '+item.day;
    numberChrono = numberChrono +1
    logger.info(numberChrono+" chrono start " + chrono_start);

     cron_jobs.push(new CronJob({
       cronTime: chrono_start,
       onTick: function() {
            if(boiler.isOn){
              logger.info("chrono: boiler is already ON");
            } else {
              boiler.on();
              logger.info("chrono: boiler is now ON");
            }
       },
       start: true,
       timeZone: 'Europe/Rome'
     }));



  var chrono_end = '00 '+item.end.minute+' '+item.end.hour+' * * '+item.day;
  logger.info(numberChrono + " chrono end " + chrono_end);

   cron_jobs.push(new CronJob({
     cronTime: chrono_end,
     onTick: function() {
          if(!boiler.isOn){
            logger.info("chrono: boiler is already OFF");
          } else {
            boiler.off();
            logger.info("chrono: boiler is now OFF");
          }


     },
     start: true,
     timeZone: 'Europe/Rome'
   }));

 }



 logger.info("parsing finished");
}




function chronoToDate(chrono){



}
