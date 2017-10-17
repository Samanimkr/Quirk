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

app.engine('handlebars', handlebars({defaultLayout: 'main'})); //View engine (Handlebars)
app.set( 'view engine', 'handlebars');

app.listen(PORT, function(){
  console.log("(port: "+PORT+") Server is now running...");
});

app.get('/', function(req, res, next){
  res.render('index', {
    title: "Home",
  });
});

app.get('/dashboard', function(req, res, next){
  res.render('dashboard', {
    title: "Quirk - Dashboard",
  });
});
