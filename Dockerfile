FROM node:10-stretch-slim

ADD / /tinylogd

EXPOSE 12201/udp
VOLUME /logs 

CMD [ "/tinylogd/tinylogd.js" ]
