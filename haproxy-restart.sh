#!/bin/bash

echo "DEBUG: restarting haproxy"

haproxy -f ./advanced.cfg -p ./haproxy.pid -D -st $(cat ./haproxy.pid)
