var User = require('../models/user');

module.exports = (app) => {
	
	// middleware function to check for logged-in users
	var sessionChecker = (req, res, next) => {
	  if (!req.session.user) {
		res.redirect('/login');
	  } else {
		next();
	  }
	};

    app.get('/login', function (req, res, next) {
        if (req.session.user) {
            res.redirect("/");
        } else {
            res.render('login', {
                title: "Quirk - Login",
            });
        }
    });

    app.get('/', sessionChecker, function (req, res, next) {
        var LoggedInUser = req.session.user;

        User.findOne({ '_id': LoggedInUser }, function (err, user) {
            if (err) console.log("err: " + err);
            res.render('dashboard', {
                title: "Quirk - Dashboard",
                user: user
            });
        });
  });

  app.post('/addhabit', function(req, res, next){
    var habit = {
      owner: req.session.user,
      habit_name: req.body.habitName,
      habit_desc: req.body.habitDesc,
      weekly_goal: req.body.weeklyGoal
    }
    console.log(habit);
  });

}
