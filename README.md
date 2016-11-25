# Consul HAProxy Example

This project will show how to dynamically instantiate Node.js application processes and have Consul reconfigure and restart HAProxy.

## Usage

Start a couple data providers, launch an HTTP server, launch HAProxy. Make a few requests and note that they are routed to a single HTTP server. Launch a new server and notice how requests are split between both. Kill an HTTP server and again see how requests are back down to a single server.

```shell
# Terminal 1
./service-data.js

# Terminal 2
./service-data.js

# Terminal 3
./service-http.js

# Terminal 4
consul-template

# Terminal 5
haproxy ./haproxy.cfg

# Terminal 6
curl http://localhost:8000
curl http://localhost:8000
curl http://localhost:8000

# Terminal 7
./service-http.js

# Terminal 6
curl http://localhost:8000
curl http://localhost:8000
curl http://localhost:8000

# Terminal 5
# Ctrl + C

# Terminal 6
curl http://localhost:8000
curl http://localhost:8000
curl http://localhost:8000
```
