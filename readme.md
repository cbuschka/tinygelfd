# TinyGELFD - a tiny gelf log messages collector.

TinyGELFD collects GELF messages on UDP (e.g. from local docker engine) and writes them to local log files.

## Features
* written in NodeJS
* listens on udp
* supports chunked and compressed gelf messages
* supports log rotation
* writes to log file per gelf message tag or container name

## Author
[Cornelius Buschka](https://github.com/cbuschka).

## License
[MIT](./license.txt)
