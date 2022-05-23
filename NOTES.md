## Websocket Proxying with NGINX
Because the connection needs to live on (as opposed to http) a new paramater needs to be added to the location block.
```
proxy_read_timeout 1800;
proxy_send_timeout 1800;
```
I was confused that my connections would suddenly close and but it seemed mysteriously cyclical. The default timeout is 60 seconds. 

[This helped me](https://serverfault.com/questions/1060525/why-is-my-websocket-connection-gets-closed-in-60-seconds)