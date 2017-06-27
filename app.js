const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res){
  res.render('index', {
    title: "home",
    name: "samani"
  });
});

app.listen(8080, function(){
  console.log("hi");
});
