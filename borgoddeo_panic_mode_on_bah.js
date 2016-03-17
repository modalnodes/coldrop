var raspi = require('raspi-io');

var five = require('johnny-five');

var boiler;
var boiler_pin = 7;
var name_of_boiler = 'borgoddeo';

var board = new five.Board({
  io: new raspi()
});
console.log("Se stai utilizzando questo script, \nc'è qualcosa che è andato storto... borgoddeo!  \n But don't worry ... divertiti con la console e tutto andrà bene... forse \n \n ");
console.log(name_of_boiler+".on(); :D");
console.log(name_of_boiler+".off(); per chiudere....trick?");
console.log(name_of_boiler+".toggle(); per invertire lo stato del relay.... aperto/chiuso? a tuo rischio e pericolo");

console.log("\n se trovi 3 luci rosse e una blu accese, forse non tremerai dal freddo oggi");
board.on('ready', function() {
  boiler = new five.Relay(boiler_pin);


  this.repl.inject({
    borgoddeo: boiler

  });
});
