var fs = require("fs");
var axios = require("axios");

var User = require('../models/user');

var credsAvailable;
if (fs.existsSync("credentials.json")) {
  credsAvailable = true;
  var Credentials = JSON.parse(fs.readFileSync("credentials.json"));
} else {
  console.log("[Warning] Facebook login needs credentials.json to work!");
  credsAvailable = false;
}

module.exports = (app) => {

  app.get('/fblogin', function(req, res){
    if(credsAvailable){
      res.redirect(`https://www.facebook.com/v2.10/dialog/oauth?client_id=${Credentials.client_id}&redirect_uri=${Credentials.redirect_uri}`);
    } else {
      res.redirect("/login");
    }
  });

  app.get('/fbredirect', function(req, res){
    var code = req.query.code;
    var err = req.query.error;

    if (err) console.log(err);

    axios.get(`https://graph.facebook.com/v2.10/oauth/access_token?client_id=${Credentials.client_id}&redirect_uri=${Credentials.redirect_uri}&client_secret=${Credentials.client_secret}&code=${req.query.code}`)
    .then(response => {
      var data = response.data;
      var access_token = data.access_token;

      axios.get(`https://graph.facebook.com/v2.10/me?fields=id%2Cname%2Cpicture&access_token=${access_token}&redirect_uri=http://localhost:3000/`)
      .then(person => {

        var profile = {
          _id: person.data.id,
          name: person.data.name,
          photoUrl: person.data.picture.data.url
        }

		req.session.user = profile._id;

        User.findOne({'_id': profile._id}, function(err, user) {
          if (err) console.log("err: " + err);
          console.log("user:" +user);
          if (user==null){
            var newUser = new User(profile);
            newUser.save()
            .then(savedUser => {
              console.log("user saved: " + savedUser);
            }).catch(err => {
              console.log("err: "+err);
            });
          }
        });


        //save profile to database or session because res.redirect doesnt let you insert data to be sent
        res.redirect('/');
      })
      .catch(error => {
        console.log(error);
      })
    })
    .catch(error => {
      console.log(error);
    })

  });

}
