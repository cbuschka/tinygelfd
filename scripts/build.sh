#!/bin/bash

PROJECT_DIR=$(cd `dirname $0`/.. && pwd)

docker build -t tinygelfd -f $PROJECT_DIR/Dockerfile $PROJECT_DIR
