const express = require('express');
const handlebars = require('express-handlebars');
const redis = require('redis');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const port = 3000; //node app port
const app = express(); //Init app
let client = redis.createClient();

client.on('connect', function(){
  console.log("Connected to redis!");
});

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

app.engine('handlebars', handlebars({defaultLayout: 'test-main'})); //View engine (Handlebars)
app.set( 'view engine', 'handlebars');

app.listen(port, function(){
  console.log("(port: "+port+") Server is now running...");
});

app.get('/', function(req, res, next){
  res.render('test-index', {
    title: "Home",
  });
});
app.get('/adduser', function(req, res, next){
  res.render('adduser', {
    title: "Add User",
  });
});

app.post('/search', function(req, res, next){
  let id = req.body.id;

  client.hgetall(id, function(err, obj){
    if(!obj){
      res.render('test-index', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj
      });
    }
  });
});

app.post('/adduser', function(req, res, next){
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  console.log(first_name + ";" + last_name + ";" + phone);

  client.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function(err, reply) {
    if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});

app.delete('/deleteuser/:id', function(req, res, next){
  client.del(req.params.id);
  res.redirect('/');
});
