FROM node:10-stretch-slim

ENV CONFIG_FILE=

ADD /src/ /tinygelfd
ADD /node_modules /tinygelfd/node_modules/

EXPOSE 12201/udp

VOLUME [ "/logs", "/config" ]

CMD [ "/tinygelfd/tinygelfd.js" ]
