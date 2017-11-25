const express = require('express');
const mongoose = require("mongoose");
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require("express-session");
const fs = require("fs");
const path = require('path');

if (fs.existsSync("credentials.json")) {
  var Credentials = JSON.parse(fs.readFileSync("credentials.json"));
}

const PORT = 3000; //node app port
const DB_URL = "mongodb://localhost/quirk";
const app = express(); //Init app

mongoose.Promise = require('bluebird');
mongoose.connect(DB_URL, {useMongoClient: true});

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: Credentials.session_secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }//set to true for production mode!
}));

app.engine('hbs', handlebars({defaultLayout: 'main'})); //View engine (Handlebars)
app.set( 'view engine', 'hbs');

app.listen(PORT, function(){
  console.log("(port: "+PORT+") Server is now running...");
});

require('./routes/routes')(app);
require('./routes/login')(app);
