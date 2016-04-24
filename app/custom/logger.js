var winston = require('winston');
var moment = require('moment');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            name: "info-file",
            level: 'info',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false,
            timestamp: function () {
              return moment(new Date()).format('MMMM Do YYYY, h:mm:ss a');
            }
        }),
        new winston.transports.File({
          name: 'error-file',
          filename: './logs/all-logs.log',
          level: 'error',
          json: false,
          timestamp: function () {
            return moment(new Date()).format('MMMM Do YYYY, h:mm:ss a');
          }
    }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
