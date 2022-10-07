#!/usr/bin/env sh

cp ./dist/ormconfig.js ./ormconfig.js
yarn migrate
node dist/src/main.js
