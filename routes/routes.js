var User = require('../models/user');
var Habit = require('../models/habit');

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
			Habit.find({'owner': LoggedInUser}, function(err, habits){
				res.render('dashboard', {
					title: "Quirk - Dashboard",
					user: user,
					habits: habits
				});
			});
        });
  });

  app.post('/addhabit', function(req, res, next){
    var newHabit = {
      owner: req.session.user,
      habit_name: req.body.habitName,
      habit_desc: req.body.habitDesc,
      weekly_goal: req.body.weeklyGoal
    }
    console.log(habit);
	var habit = new Habit(newHabit);
	habit.save()
	.then((savedHabit) => {
      res.redirect('/');
    }).catch((error) => {
      console.log(error);
      res.redirect('/');
    });

  });

}
