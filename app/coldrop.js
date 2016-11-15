/* packages */
var raspi = require('raspi-io');
var five = require('johnny-five');
var CronJob = require('cron').CronJob;
var config = require('./res/config');
var logger = require('./custom/logger');
var fs = require('fs');

var configFileName = 'config.json';

logger.info("reading '"+configFileName+"'...");
var obj = JSON.parse(fs.readFileSync('./res/'+configFileName, 'utf8'));
logger.info("completed");

var cron_jobs = [];
var currentProgram = undefined;
var programActive = false;
var overrideActive = false;

/* pins  wiringPi*/
var pin_boiler_try = 2;
var pin_boiler_real = 7;
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

  logger.info("initializing relay..");
  boiler.on();
  boiler.off();
  logger.info("finished");

  temp.on("change", function(data, err) {
    if (err) {
      logger.error(err);
      return;
    }
      logger.info("temperature changes: %d°", data.C);
      logger.debug("celsius: %d", data.C);
      logger.debug("fahrenheit: %d", data.F);
      logger.debug("kelvin: %d", data.K);

      if(currentProgram !== undefined && programActive !== false){ // check if exist a program
        onChangeTemp(obj.config.program[currentProgram].temp, data.C, obj.config.program[currentProgram].tollerance);
      } else if(overrideActive === true) { //check if override Mode is active
        onChangeTemp(obj.config.override.temp, data.C, obj.config.override.tollerance);
      } else { // or, in other case, shutdown the boiler
        if(boiler.isOn){
          boiler.off(); //
        }
      }

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
createChrono(boiler);

  fs.watch('./res/'+configFileName, (event, configFileName) => {
    if (event==='change') {
      currentProgram = undefined;
      logger.info(configFileName+" change, realoading the program...");
      logger.debug(cron_jobs.length);
      for(var chrono of cron_jobs){
        chrono.stop();
      }
      cron_jobs = [];
      fs.readFile('./res/'+configFileName, "utf8", function(err, data) {
        if (err) {
          logger.warning("try to save again the config.json file!");
          throw err;
        }
        obj = JSON.parse(data);
        createChrono(boiler);
         logger.info("realoaded");
    });
    }
  });

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
  if(obj.config.override.active === true){
      overrideActive = true;
      logger.info("override mode is active");
      logger.info("temperature selected: %d", obj.config.override.temp);
      logger.info("tollerance: %d", obj.config.override.tollerance);
      if(boiler.isOn){
        logger.info("override: boiler is already ON");
      } else {
        boiler.on();
        logger.info("override: boiler is now ON");
      }
  } else {
    logger.info("override mode is not active");
    logger.info("parsing 'config.json'...");
    var numberChrono = 0;
    for (var item of obj.config.program){
      var numberProgram = clone(numberChrono);
      var chrono_start = '00 '+item.start.minute+' '+item.start.hour+' * * '+item.day;
      numberChrono = numberChrono +1
      logger.info(numberChrono+" chrono start " + chrono_start);

       cron_jobs.push(new CronJob({
         cronTime: chrono_start,
         onTick: function() {
              programActive = true;
              currentProgram = clone(numberProgram);
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
            programActive = false;
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
}

function clone(a) { return JSON.parse(JSON.stringify(a)); }


function chronoToDate(chrono){

  //todo

}
