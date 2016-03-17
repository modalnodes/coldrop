var config = {};


config.temp = {};
config.day = {};
config.temp.max_temp = 22;
config.temp.min_temp = 20;
config.temp.tollerance = 1;


config.day.periods =[{
  start: 08.00,
  end: 16.00,
  temp: 19
}, {
  start: 16.01,
  end: 20.00,
  temp: 20
}];


config.day.days = [0,1,2,3,4,5,6,7];
module.exports = config;
