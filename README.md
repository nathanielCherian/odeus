# odeus

## Todo:
- Low-level check for data channel to be open before sending message
    - On-open callback should trigger first message
    - Wait for it to open (for slower connections)
- Easier deployment
    - ~~Changing the websocket address in ```/public/index.html```~~
- ~~Non-terminating Errors in server~~
- Migrate to SQLite database?
- test/fix onLeave condition