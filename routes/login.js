var fs = require("fs");
var axios = require("axios");
var User = require('../models/user');

//checking if the credentials file exists. If it does then load it, otherwise, output facebook login wont work
var credsAvailable;
if (fs.existsSync("credentials.json")) {
    credsAvailable = true;
    var Credentials = JSON.parse(fs.readFileSync("credentials.json"));
} else {
    console.log("[Warning] Facebook login needs credentials.json to work!");
    credsAvailable = false;
}

module.exports = (app) => { //export all of this to the main app.js file

    //when user clicks login with facebook, redirect them to facebook's login page
    app.get('/fblogin', function(req, res) {
        if (credsAvailable) { //if the credentials file wasn't loaded then just redirect user back to the login page
            res.redirect(`https://www.facebook.com/v2.10/dialog/oauth?client_id=${Credentials.client_id}&redirect_uri=${Credentials.redirect_uri}`);
        } else {
            res.redirect("/login");
        }
    });

    //user is redirected here after they login with facebook
    app.get('/fbredirect', function(req, res) {
        var code = req.query.code; //this is code that is received from facebook after a successful login
        var err = req.query.error; //any errors are stored here

        if (err) console.log(err);

        //make a GET request to get an access_token for the user from sending facebook the code that was received
        axios.get(`https://graph.facebook.com/v2.10/oauth/access_token?client_id=${Credentials.client_id}&redirect_uri=${Credentials.redirect_uri}&client_secret=${Credentials.client_secret}&code=${req.query.code}`)
            .then(response => {
                var data = response.data;
                var access_token = data.access_token; //this is the access token

                //make a last request sending the access token to get the user's profile
                axios.get(`https://graph.facebook.com/v2.10/me?fields=id%2Cname%2Cpicture&access_token=${access_token}&redirect_uri=http://localhost:3000/`)
                    .then(person => {
                        var profile = {
                            _id: person.data.id,
                            name: person.data.name,
                            photoUrl: person.data.picture.data.url
                        }

                        //create a login session using the user's id
                        req.session.user = profile._id;

                        //check to see if the id already exists
                        //if it does then just update the photoUrl because its changed by facebook frequently
                        //if it doesnt then save the new user to the database
                        User.findOne({
                            '_id': profile._id
                        }, function(err, user) {
                            if (err) console.log("err: " + err);
                            if (user == null) {
                                var newUser = new User(profile);
                                newUser.save()
                                .catch(err => {
                                    console.log("err: " + err);
                                });
                            } else {
                                user.photoUrl = profile.photoUrl;
                                user.save();
                            }
                            res.redirect('/'); //redirect user to dashboard
                        });

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
