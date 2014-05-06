var port = process.env.PORT || 8080;

// express and express middleware
var express = require('express');
var express_body_parser = require("body-parser");
var express_method_override = require("express-method-override");
var express_client_sessions = require("client-sessions");
var express_cookie_parser = require("cookie-parser");

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express_body_parser());
app.use(express_method_override());
app.use(express_cookie_parser());

// routes
require('./lib/routes.js')(app);

// main
app.listen(port);
console.log("Todo server started. Listening port " + port);
