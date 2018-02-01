const express = require('express');
const mongoose = require("mongoose");
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const mongoDBStore = require('connect-mongodb-session')(session);
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

var store = new mongoDBStore({uri: DB_URL, collection: 'sessions'});
// Catch errors
store.on('error', function(error) {
  if (error) console.log(error);
});

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
  key: 'user_sid',
  secret: 'znxbcuzxxiyekjnadc',
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000, //10mins if you remove one zero
    // secure: true //ENABLE when HTTPS is setup!!
  }
}));

app.use(function(req, res, next) {
  res.locals.LoggedIn = (req.session.user && req.cookies.user_sid) ? true : false;
  next();
});

app.engine('hbs', handlebars({defaultLayout: 'main'})); //View engine (Handlebars)
app.set( 'view engine', 'hbs');

app.listen(PORT, function(){
  console.log("(port: "+PORT+") Server is now running...");
});


require('./routes/routes')(app);
require('./routes/login')(app);
