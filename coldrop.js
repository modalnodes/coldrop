var raspi = require('raspi-io');
var five = require('johnny-five');
var board = new five.Board({
  io: new raspi()
});

board.on('ready', function() {

var temp = new five.Temperature({
  controller: "BMP180",
  freq: 5000
var alt = new five.Altimeter({
  controller: "BMP180",
  freq: 5000
});

temp.on("data", function() {
    console.log("celsius: %d", this.C);
    console.log("fahrenheit: %d", this.F);
    console.log("kelvin: %d", this.K);
  });

var alt = new five.Altimeter({
  controller: "BMP180",
  freq: "5000"
});

alt.on("data", function(){
 console.log("Altitude");
    console.log("  feet   : ", this.feet);
    console.log("  meters : ", this.meters);
 console.log(" ");
});

var bar = new five.Barometer({
  controller: "BMP180",
  freq: 5000
});

bar.on("data", function() {
  console.log("barometer");
  console.log(" pressure : ", this.pressure);
  console.log("-----------------------------------------");
});


});
