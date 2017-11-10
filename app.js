const express = require('express');
const mongoose = require("mongoose");
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');

const PORT = 3000; //node app port
const DB_URL = "mongodb://localhost/quirk";
const app = express(); //Init app

mongoose.Promise = global.Promise; //this is very slow so change to bluebird for example
mongoose.connect(DB_URL, {useMongoClient: true});

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.engine('hbs', handlebars({defaultLayout: 'main'})); //View engine (Handlebars)
app.set( 'view engine', 'hbs');

app.listen(PORT, function(){
  console.log("(port: "+PORT+") Server is now running...");
});

require('./routes/index')(app);
require('./routes/login')(app);
var User = require('./models/user');
