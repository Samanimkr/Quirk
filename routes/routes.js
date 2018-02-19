var User = require('../models/user');
var Habit = require('../models/habit');
var dateFormat = require('dateformat');

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

	app.get('/logout', function (req, res, next) {
		req.session.destroy();
		res.redirect('/login');
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

	app.get('/stats/:id', sessionChecker, function (req, res, next) {
        var LoggedInUser = req.session.user;
		var habit_id = req.params.id;


        User.findOne({ '_id': LoggedInUser }, function (err, user) {
			Habit.findOne({'_id': habit_id}, async function(err, habit){
				await sortHabit(habit);
				var stats = await getStreaks(habit);
				res.render('statistics', {
					title: "Quirk - Statistics",
					user: user,
					habit: habit,
					stats: stats
				});
			});
        });
  	});

  app.post('/addhabit', function(req, res, next){
    var newHabit = {
      owner: req.session.user,
      habit_name: req.body.habitName,
      habit_desc: req.body.habitDesc,
      weekly_goal: req.body.weeklyGoal,
	  num_of_weeks: req.body.numOfWeeks,
	  colour: req.body.colour
    }

	var habit = new Habit(newHabit);
	habit.save()
	.then((savedHabit) => {
      res.redirect('/');
    }).catch((error) => {
      console.log(error);
      res.redirect('/');
    });
  });

  app.get('/gethabits', function(req,res){
	  Habit.find({owner: req.session.user}, function(err, habits){
		  res.json(habits);
	  });
  });

  app.post('/updatehabit', function(req,res){
	  Habit.findOne({_id: req.body.habit_id}, function(err, habit){
		  if(habit.datesCompleted.includes(req.body.date)){ //if it already exists in the array => remove it =>(else) add it
			  var index = habit.datesCompleted.indexOf(req.body.date);
			  habit.datesFailed.push(req.body.date);
			  habit.datesCompleted.splice(index);
			  habit.save()
			  .then(() => {
				  res.send("failed");
			  })
		  } else if (habit.datesFailed.includes(req.body.date)) {
			  var index = habit.datesFailed.indexOf(req.body.date);
			  habit.datesFailed.splice(index);
			  habit.save()
			  .then(() => {
				  res.send("removed");
			  })
		  } else {
			  habit.datesCompleted.push(req.body.date);
			  habit.save()
			  .then(() => {
				  res.send("completed");
			  })
		  }
	  });
  });

  function sortHabit(habit){
	  habit.datesCompleted.sort(function(a,b){
		  var c = stringToDate(a, "dd/mm/yyyy", "/");
		  var d = stringToDate(b, "dd/mm/yyyy", "/");
		  return d.getTime() - c.getTime();
 	  });

	  habit.datesFailed.sort(function(a,b){
		  var c = stringToDate(a, "dd/mm/yyyy", "/");
		  var d = stringToDate(b, "dd/mm/yyyy", "/");
		  return d.getTime() - c.getTime();
 	  });
	  habit.save();
  }
  
  async function getStreaks(habit){
	  var streak = 0, maxStreak = 0, currentStreak=-1;
	  var failedDate, completedDate;
	  var temp=0;
	  for (var i=0; i<=habit.datesFailed.length; i++) {
		  if (habit.datesFailed.length==0 || i==habit.datesFailed.length) {
			  failedDate = 0;
		  } else {
			  failedDate = stringToDate(habit.datesFailed[i],"dd/mm/yyyy","/").getTime();
		  }

		  for (var j=temp; j<habit.datesCompleted.length; j++) {
    	  	completedDate = stringToDate(habit.datesCompleted[j],"dd/mm/yyyy","/").getTime();
			if (completedDate>failedDate) {
				streak++;
				temp=j+1;
			} else {
				if (currentStreak==-1) {
					currentStreak=streak;
				}
				maxStreak = streak>maxStreak? streak : maxStreak;
				streak = 0;
			}
    	  }
		  maxStreak = streak>maxStreak? streak : maxStreak;
	  }
	  if (currentStreak==-1) {
		  currentStreak=maxStreak;
	  }
	  stats = {
		  currentStreak: currentStreak,
		  maxStreak: maxStreak
	  }
	  return stats;
  }


	function stringToDate(_date,_format,_delimiter)
	{
        var formatLowerCase=_format.toLowerCase();
        var formatItems=formatLowerCase.split(_delimiter);
        var dateItems=_date.split(_delimiter);
        var monthIndex=formatItems.indexOf("mm");
        var dayIndex=formatItems.indexOf("dd");
        var yearIndex=formatItems.indexOf("yyyy");
        var month=parseInt(dateItems[monthIndex]);
        month-=1;
        var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
        return formatedDate;
		//https://stackoverflow.com/questions/5619202/converting-string-to-date-in-js
	}

  function isInArray(value, array) {
	  return array.indexOf(value) > -1;
  }

}
