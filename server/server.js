var port = process.env.PORT || 8080;

// express and express middleware
var express = require('express');
var express_body_parser = require("body-parser");
var express_method_override = require("express-method-override");
var express_client_sessions = require("client-sessions");
var express_cookie_parser = require("cookie-parser");

var app = express();
app.use(express.static(require('path').resolve(__dirname, '../html5client')));
app.use(express_body_parser());
app.use(express_method_override());
app.use(express_cookie_parser());

// api routes
require('./api/routes.js')(app);

// main
app.listen(port);
console.log("Todo Server started! Open http://localhost:" + port + " in your web browser to test locally.");
