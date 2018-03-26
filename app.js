//importing all the node modules
const express = require('express');
const mongoose = require("mongoose");
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const mongoDBStore = require('connect-mongodb-session')(session);
const fs = require("fs");
var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window); 
const path = require('path');

//if credentials.json exists then import its content
if (fs.existsSync("credentials.json")) {
    var Credentials = JSON.parse(fs.readFileSync("credentials.json"));
}

const PORT = 3000; //node app port
const DB_URL = "mongodb://localhost/quirk";
const app = express(); //Initalising the express app

//connecting to the mongoose database
mongoose.Promise = require('bluebird');
mongoose.connect(DB_URL, {
    useMongoClient: true
});

//storing all login sessions that will be created into the database
var store = new mongoDBStore({
    uri: DB_URL,
    collection: 'sessions'
});
// Catch errors
store.on('error', function(error) {
    if (error) console.log(error);
});

//making the express app use the modules that we imported
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(session({
    //settings of the login sessions
    key: 'user_sid',
    secret: 'znxbcuzxxiyekjnadc',
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 1000
    } //cookies expire in 1 hour
}));

//Setting the Templating engine to Handlebars
app.engine('hbs', handlebars({
    helpers: {
        select: function (value, options) {
            var $el = $('<select />').html( options.fn(this) );
            $el.find('[value="' + value + '"]').attr({'selected':'selected'});
            return $el.html();
        }
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

//app is listening to the PORT for a connection
app.listen(PORT, function() {
    console.log("(port: " + PORT + ") Server is now running...");
});

//importing the other routes and sending them the express 'app' variable
require('./routes/routes')(app);
require('./routes/login')(app);
