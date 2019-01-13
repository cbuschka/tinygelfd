#!/usr/bin/env node

const winston = require('winston');
const gelfserver = require('graygelf/server')
require('winston-daily-rotate-file');

function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

function formatDate(d) {
      return d.getFullYear() +
        '-' + pad(d.getMonth() + 1) +
        '-' + pad(d.getDate()) +
        ' ' + pad(d.getHours()) +
        ':' + pad(d.getMinutes()) +
        ':' + pad(d.getSeconds()) +
        '.' + (d.getMilliseconds() / 1000).toFixed(3).slice(2, 5);
    };

function log() {
  const args = [];
  args.push(formatDate(new Date())+":");
  for(let i=0; i<arguments.length; ++i) { args.push(arguments[i]); }
  console.log.apply(console, args);
}

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
          maxSize: '100m',
          // maxFiles: '14d' 
        })
      ]
    });
    loggers[tag] = loggerSlot;
    log("Logger", tag, "created.");
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
log("tinylogd ready...");

const signals = ['SIGTERM', 'SIGINT'];
signals.forEach(function(signal) {
  process.on(signal, function () {
    log("Shutting down...");
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
      log("Evicted logger", key, ". Logger(s) left: [",Object.keys(loggers).join(),"].");
    }
  });
}, 1000);
