FROM node:10-stretch-slim

ENV CONFIG_FILE=

ADD / /tinylogd

EXPOSE 12201/udp

VOLUME [ "/logs", "/config" ]

CMD [ "/tinylogd/tinylogd.js" ]
