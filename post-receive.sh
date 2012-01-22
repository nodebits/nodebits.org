#!/bin/sh
cd /home/tim/nodemanual.org
git pull origin master
git submodule update --init
node build.js
