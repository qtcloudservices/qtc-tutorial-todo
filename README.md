# Qt Cloud Services Tutorial

Creating Server-side, Cross-Platform and N-Screen (HTML5 & Qt) Cloud Todo Application with Qt Cloud Services. The purpose of this tutorial is to demonstrate how to use Qt Cloud Services from serverside to serve Qt and HTML5 client applications.

Technologies used:
* Qt Cloud Services, Enginio Data Storage - for cloud based data storage
* Node.js - for serverside
* HTML5, jQuery, Bootstrap, Backbone - for web clients
* Qt - for native clients (Android & Desktop)

## Structure of Code

The source code is organized as follows:

* **Server** - The source code can be found in `server` directory.
* **Qt Client** - The source code can be found in `qtclient` directory.
* **HTML 5 Client** - The source code can be found in `html5client` directory.

## Installing and starting the server

Get the tutorial sourcecode and copy the sample configuration file `server/config/qtc-conf.default.js` to `server/config/qtc-conf.js` and edit the configuration to match your current EDS configuration.

While at the root directory of this tutorial, type the following into a terminal window:

```sh
npm install
```

Once the NPM packages are installed, start the server:

```sh
node server/server.js
```

## Server API

### About Sessions
Many of the Server APIs require valid session id. The session id can be obtained by logging in user. Once session id is obtained, it may be used with API requests.

There are following options for including session with the API request:

1. Use Cookies. Set cookie `session` with the value obtained from login.
2. Use Headers. Set header `x-todo-session` with the value obtained from login.
3. Use query string. Set query string parameter `session` with the value obtained from login.

### POST /api/register
Register new user.

**Request Body**
```javascript
{
  "name": "John",         // The display name
  "username": "thejohn",  // The login username
  "password": "secret"    // The login password
}
```

**Response**
```javascript
{
  "userId": "535e36c5e5bde50eeb020e06",   // The user id
  "name": "John",                         // The display name
  "username": "thejohn"                   // The login username
}
```

### POST /api/login
Login user

**Request Body**
```javascript
{
  "username": "thejohn",   // The login username
  "password": "secret"     // The login password
}
```

**Response**
```javascript
{
  "userId": "535e36c5e5bde50eeb020e06",                   // The user id
  "name": "John",                                         // The display name
  "session": "5fe5c58e860af9051c03ad0329ce690855356e3a"   // The session id
}
```

### GET /api/me
Get info about current user. NOTE! Requires valid session.

**Response**
```javascript
{
  "userId": "535e36c5e5bde50eeb020e06",                   // The user id
  "name": "John",                                         // The display name
  "session": "5fe5c58e860af9051c03ad0329ce690855356e3a"   // The session id
}
```

### GET /api/logout
Logout user. NOTE! Requires valid session.

**Response**
```javascript
{
  "logout": true   // The logout status. Always true
}
```

### GET /api/todos
Get all todo items. NOTE! Requires valid session.

Todo items are sorted by `done` and `updatedAt` fields. First items are ones with `done` field set as false.

**Response**
```javascript
[                                              // The todo items array
  {
    "id": "5356f2aee5bde54e7e005b5d",          // The item id
    "text": "Do something",                    // The item text
    "done": false,                             // The item status; done or not
    "createdAt": "2014-04-22T22:52:30.640Z",   // The item create timestamp
    "updatedAt": "2014-04-22T22:52:30.640Z"    // The item modify timestamp
  },
  {
    "id": "5356f2c3e5bde54e7e005b67",          // The item id
    "text": "Do this too",                     // The item text
    "done": false,                             // The item status; done or not
    "createdAt": "2014-04-22T22:52:51.268Z",   // The item create timestamp
    "updatedAt": "2014-04-22T22:52:51.268Z"    // The item modify timestamp
  }
]
```

### POST /api/todos
Add an item. NOTE! Requires valid session.

**Request Body**
```javascript
{
  "text": "Do something",                    // The item text
  "done": false                              // The item status; done or not
}
```

**Response**
```javascript
{
  "id": "5356f2aee5bde54e7e005b5d",          // The item id
  "text": "Do something",                    // The item text
  "done": false,                             // The item status; done or not
  "createdAt": "2014-04-22T22:52:30.640Z",   // The item create timestamp
  "updatedAt": "2014-04-22T22:52:30.640Z"    // The item modify timestamp
}
```

### GET /api/todos/:id
Get single item. NOTE! Requires valid session.

**Response**
```javascript
{
  "id": "5356f2aee5bde54e7e005b5d",          // The item id
  "text": "Do something",                    // The item text
  "done": false,                             // The item status; done or not
  "createdAt": "2014-04-22T22:52:30.640Z",   // The item create timestamp
  "updatedAt": "2014-04-22T22:52:30.640Z"    // The item modify timestamp
}
```

### PUT /api/todos/:id
Modify item. NOTE! Requires valid session.

**Request Body**
```javascript
{
  "text": "Do something",                    // The item text
  "done": true                               // The item status; done or not
}
```

**Response**
```javascript
{
  "id": "5356f2aee5bde54e7e005b5d",          // The item id
  "text": "Do something",                    // The item text
  "done": true,                              // The item status; done or not
  "createdAt": "2014-04-22T22:52:30.640Z",   // The item create timestamp
  "updatedAt": "2014-04-28T16:13:14.230Z"    // The item modify timestamp
}
```

### DELETE /api/todos/:id
Delete item. NOTE! Requires valid session.

**Response**
```javascript
{
  "deleted": "5356f2aee5bde54e7e005b5d"     // The delete operation response with id of deleted item.
}
```
