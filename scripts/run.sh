#!/bin/bash

PROJECT_DIR=$(cd `dirname $0`/.. && pwd)

mkdir -p $PROJECT_DIR/run/logs/

docker run --rm --name tinygelfd -p 127.0.0.1:12201:12201/udp -v $PROJECT_DIR/run/logs:/logs tinygelfd
