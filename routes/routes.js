module.exports = (app) => {
	
	// middleware function to check for logged-in users
	var sessionChecker = (req, res, next) => {
	  if (!req.session.user || !req.cookies.user_sid) {
		res.redirect('/login');
	  } else {
		next();
	  }
	};

  app.get('/login', function(req, res, next){
    res.render('login', {
      title: "Quirk - Login",
    });
  });

  app.get('/', sessionChecker, function(req, res, next){
    res.render('dashboard', {
      title: "Quirk - Dashboard",
    });
  });

  app.post('/addhabit', function(req, res, next){
    var habit = {
      owner: 0,
      habit_name: req.body.habitName,
      habit_desc: req.body.habitDesc,
      weekly_goal: req.body.weeklyGoal
    }
    console.log(habit);
  });

}
