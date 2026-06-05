{
  "version": 2,
  "functions": {
    "server.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "^/$",
      "dest": "/index.html"
    },
    {
      "src": "/(.*\\.html)",
      "dest": "/$1"
    },
    {
      "src": "/(.*\\.json)",
      "dest": "/$1"
    },
    {
      "src": "/(.*\\.js)",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
