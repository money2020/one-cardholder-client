# Money2020 2017 - ONE Client

## Environment Variables

| Variable  | Description                      | Default
|-----------|----------------------------------|---------------------------------------|
| `API_URL` | Url of the backend to hit        | `https://one-money2020.herokuapp.com` |
| `USER`    | The user to pass to the backend  | `Cathy` |
| `HOST`    | Serve on this host (docker only) | `127.0.0.1` |
| `PORT`    | Serve on this port (docker only) | `8080` |


## Docker Instructions 🐳

First, install Docker: https://www.docker.com/community-edition#/download

Then run:

```
make
```

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
