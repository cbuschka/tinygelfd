#!/bin/bash

PROJECT_DIR=$(cd `dirname $0` && pwd)

mkdir -p $PROJECT_DIR/run/logs/

docker run --rm --name tinylogd -p 12201:12201/udp -v $PROJECT_DIR/run/logs:/logs tinylogd
