const express = require('express');
const handlebars = require('express-handlebars');
const redis = require('redis');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const port = 3000;
const app = express(); //Init app

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

app.engine('handlebars', handlebars({defaultLayout: 'main'})); //View engine (Handlebars)
app.set( 'view engine', 'handlebars');

app.listen(port, function(){
  console.log("(port: "+port+") Server is now running...");
});

app.get('/', function(req, res){
  res.render('index', {
    title: "home",
    name: "samani"
  });
});
