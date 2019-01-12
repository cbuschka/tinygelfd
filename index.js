var winston = require('winston');
var gelfserver = require('graygelf/server')
require('winston-daily-rotate-file');

var server = gelfserver()
var loggers = {};
var winstonLevelByGelfLevel = {0: 'error', 1: 'warn', 2: 'info', 3: 'verbose', 4: 'debug'};

server.on('message', function (gelf) {
  var tag = gelf._tag || 'default';
  loggers.tag = loggers.tag || winston.createLogger({
  exitOnError: false,
  level: 'verbose',
  transports: [
    // new winston.transports.Console(),
    new winston.transports.DailyRotateFile({ filename: tag + '-%DATE%.log',
      level: "verbose",
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '1k',
      maxFiles: '14d' })
  ]
  });
  
  // handle parsed gelf json
  gelf.level = winstonLevelByGelfLevel[gelf.level] || 'verbose';
  // console.log(JSON.stringify(gelf));
  loggers.tag.log(gelf)
})
server.listen(12201)

