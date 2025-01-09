#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

cd ${DIR}/create
node app.js
