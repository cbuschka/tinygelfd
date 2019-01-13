#!/usr/bin/env node

const winston = require('winston');
const gelfserver = require('graygelf/server')
require('winston-daily-rotate-file');

function getLogger(loggers, tag) {
  const loggerSlot = loggers[tag] || {};
  if( !loggerSlot.logger ) {
    loggerSlot.logger = winston.createLogger({
      exitOnError: false,
      level: 'verbose',
      transports: [
        // new winston.transports.Console(),
        new winston.transports.DailyRotateFile({ filename: tag + '-%DATE%.log',
          dirname: '/logs/',
          level: "verbose",
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '1m',
          // maxFiles: '14d' 
        })
      ]
    });
    loggers[tag] = loggerSlot;
    console.log("New logger", tag, "created.");
  }
  loggerSlot.lastUsedMillis = Date.now();
  return loggerSlot.logger;
}

const server = gelfserver()
const loggers = {};
const winstonLevelByGelfLevel = {0: 'error', 1: 'warn', 2: 'info', 3: 'verbose', 4: 'debug'};

server.on('message', function (message) {
  const tag = message._tag || message._container || 'default';
  const logger = getLogger(loggers, tag);
  message.level = winstonLevelByGelfLevel[message.level] || 'verbose';
  logger.log(message);
})
server.listen(12201);
console.log("tinylogd ready...");

const signals = ['SIGTERM', 'SIGINT'];
signals.forEach(function(signal) {
  process.on(signal, function () {
    console.log("Shutting down...");
    clearInterval(gcTimer);
    server.close();
  });
});


const gcTimer = setInterval(function() {
  const keys = Object.keys(loggers);
  keys.forEach(function(key) {
    const loggerSlot = loggers[key];
    const lastUsedMillis = loggerSlot.lastUsedMillis;
    if( !lastUsedMillis || lastUsedMillis < Date.now()-10*1000 ) {
      loggerSlot.logger.end();
      delete loggers[key];
      console.log("Evicted logger", key, ". Logger(s) left: ",Object.keys(loggers),".");
    }
  });
}, 1000);
