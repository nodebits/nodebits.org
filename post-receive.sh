#!/bin/sh
cd /home/tim/nodebits.org
git pull origin master
killall -s USR2 node
