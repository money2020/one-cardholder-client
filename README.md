# Money2020 2017 - ONE Client

## Environment Variables

- `API_URL`: Url of the backend to hit (defaults to `https://one-money2020.herokuapp.com`)
- `USER`: The user to pass to the backend (defaults to `Cathy`)


## Docker Instructions 🐳

https://www.docker.com/community-edition#/download


### Additional Environment Variables

- `HOST`: Serve the frontend from this host (defaults to `127.0.0.1`)
- `PORT`: Serve the frontend from this port (defaults to `8080`)

### Running

Simply do `make` or `make run`.

To run on a different port:
```
PORT=9999 make
```

To hit a different `API_URL`:
```
API_URL=https://example.com make
```

And so on...


## NodeJS Instructions

```
npm install
npm start
```