var fs = require("fs");
var axios = require("axios");

var User = require('../models/user');

var Credentials = JSON.parse(fs.readFileSync("credentials.json"));

module.exports = (app) => {

  app.get('/fblogin', function(req, res){
    res.redirect(`https://www.facebook.com/v2.10/dialog/oauth?client_id=${Credentials.client_id}&redirect_uri=${Credentials.redirect_uri}`);
  });

  app.get('/fbredirect', function(req, res){
    var code = req.query.code;
    var err = req.query.error;

    if (err) console.log(err);

    axios.get(`https://graph.facebook.com/v2.10/oauth/access_token?client_id=${Credentials.client_id}&redirect_uri=${Credentials.redirect_uri}&client_secret=${Credentials.client_secret}&code=${req.query.code}`)
    .then(response => {
      var data = response.data;
      var access_token = data.access_token;

      axios.get(`https://graph.facebook.com/v2.10/me?fields=id%2Cname%2Cpicture&access_token=${access_token}&redirect_uri=http://localhost:3000/dashboard`)
      .then(person => {

        var profile = {
          _id: person.data.id,
          name: person.data.name,
          photoUrl: person.data.picture.data.url
        }


        var newUser = new User(profile);
        User.update(
          {_id: profile._id},
          {$setOnInsert: newUser},
          {upsert: true},
          function(err, numAffected) {
            console.log("err:" + err);
            console.log("num: " + numAffected);
          }
        );
        // data.save()
        // .then((savedUser) => {
        //   console.log(savedUser);
        // }).catch((error) => {
        //   console.log(error);
        // });

        res.render('dashboard', {user: profile});
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
