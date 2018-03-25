var User = require('../models/user');
var Habit = require('../models/habit');
var dateFormat = require('dateformat');

module.exports = (app) => {

    // middleware function to check for logged-in users
    var sessionChecker = (req, res, next) => {
        if (!req.session.user) { //if user isn't logged in then they get redirected to the login page, otherwise, they connect to the page
            res.redirect('/login');
        } else {
            next();
        }
    };

    //user requesting for '/login' using the http GET method
    app.get('/login', function(req, res, next) {
        if (req.session.user) { //if user is logged in then redirect them to the dashboard, otherwise render the login page
            res.redirect("/");
        } else {
            res.render('login', {
                title: "Quirk - Login",
            });
        }
    });

    //user requesting for '/logout' using the http GET method
    app.get('/logout', function(req, res, next) {
        req.session.destroy(); //destroy the login session
        res.redirect('/login');
    });

    app.get('/', sessionChecker, function(req, res, next) {
        var LoggedInUser = req.session.user; //getting the user's id from the login session

        //getting the user's profile and habits from database and sending it to the handlebars page
        User.findOne({
            '_id': LoggedInUser
        }, function(err, user) {
            Habit.find({
                'owner': LoggedInUser
            }, function(err, habits) {
                res.render('dashboard', {
                    title: "Quirk - Dashboard",
                    user: user,
                    habits: habits
                });
            });
        });
    });
    //user requesting for the stats page for a habit using the http GET method
    app.get('/stats/:id', sessionChecker, function(req, res, next) {
        var LoggedInUser = req.session.user;
        var habit_id = req.params.id; //getting the habit_id from the url


        User.findOne({
            '_id': LoggedInUser
        }, function(err, user) {
            Habit.find({
                'owner': LoggedInUser
            }, async function(err, habits) { //async stops this function from being synchronous
                habit = await habits[habits.findIndex(i => i._id == habit_id)]; //finding the habit requested by searching through habits
                await sortHabit(habit); //wait for the result from sorthHabit()
                var stats = await getStreaks(habit); //wait for result from getStreaks()
                res.render('statistics', {
                    title: "Quirk - " + habit.habit_name + " Statistics",
                    user: user,
                    habit: habit,
                    habits: habits,
                    stats: stats
                });

            });
        });
    });

    //route for a user POST-ing the updated habit
    app.post('/stats/:id/edit', sessionChecker, function(req, res, next) {
        var LoggedInUser = req.session.user;
        var habit_id = req.params.id;

        //finding the habit using id then updating it and redirecting the user back to the stats page
        Habit.findOne({
            '_id': habit_id
        }, function(err, habit) {
            habit.habit_name = req.body.habitName;
            habit.habit_desc = req.body.habitDesc;
            habit.weekly_goal = req.body.weeklyGoal;
            habit.num_of_weeks = req.body.numOfWeeks;
            habit.colour = req.body.colour;
            habit.save();
            res.redirect(`/stats/${habit_id}`);
        });
    });

    //user deleting the habit
    app.get('/stats/:id/delete', sessionChecker, function(req, res, next) {
        var LoggedInUser = req.session.user;
        var habit_id = req.params.id;

        Habit.findOne({
            '_id': habit_id
        }).remove().exec().then(() => { //deleting it after being found in db
            res.redirect("/"); //redirecting to dashboard
        })
    });

    //POST-ing a new habbit
    app.post('/addhabit', function(req, res, next) {
        var newHabit = {
            owner: req.session.user,
            habit_name: req.body.habitName,
            habit_desc: req.body.habitDesc,
            weekly_goal: req.body.weeklyGoal,
            num_of_weeks: req.body.numOfWeeks,
            colour: req.body.colour
        }

        var habit = new Habit(newHabit); //creating a new habit object
        habit.save() //saving it to db
            .then((savedHabit) => { //if successful
                res.redirect('/');
            }).catch((error) => { //if there's an error then output it
                console.log(error);
                res.redirect('/');
            });
    });

    //user GET-ing all the habits owned by the logged in user
    app.get('/gethabits', function(req, res) {
        Habit.find({
            owner: req.session.user
        }, function(err, habits) {
            res.json(habits); //send result in JSON format
        });
    });

    //When a user updates a date as successful or failed or to skip it
    //if date is:
    //  - not stored then store in datesCompleted  (completed)
    //  - in datesCompleted then move to datesFailed  (failed)
    //  - in datesFailed then remove it (skipped)
    app.post('/updatedate', function(req, res) {
        Habit.findOne({
            _id: req.body.habit_id
        }, function(err, habit) { //when habit is found:
            if (habit.datesCompleted.includes(req.body.date)) { //if date already exists in the successful dates array
                var index = habit.datesCompleted.indexOf(req.body.date); //find the index of the date in datesCompleted Array
                habit.datesCompleted.splice(index); //remove the date
                habit.datesFailed.push(req.body.date); //and push it to the datesFailed array
                habit.save()
                    .then(() => {
                        res.send("failed"); //respond with "failed"
                    })
            } else if (habit.datesFailed.includes(req.body.date)) { //if date is in datesFailed array
                var index = habit.datesFailed.indexOf(req.body.date); //find index of it in that array
                habit.datesFailed.splice(index); //and remove it
                habit.save()
                    .then(() => {
                        res.send("skipped");
                    })
            } else { //if not stored then store it in datesCompleted
                habit.datesCompleted.push(req.body.date);
                habit.save()
                    .then(() => {
                        res.send("completed");
                    })
            }
        });
    });

    //function to sort datesCompleted and datesFailed "by date"
    function sortHabit(habit) {
        habit.datesCompleted.sort(function(a, b) { //go through the array
            var c = stringToDate(a, "dd/mm/yyyy", "/");
            var d = stringToDate(b, "dd/mm/yyyy", "/");
            return d.getTime() - c.getTime(); //and return the earlier date
        });

        habit.datesFailed.sort(function(a, b) {
            var c = stringToDate(a, "dd/mm/yyyy", "/");
            var d = stringToDate(b, "dd/mm/yyyy", "/");
            return d.getTime() - c.getTime();
        });
        habit.save(); //save habit to db
    }

    //asynchronous function to calculate the streaks of the user
    async function getStreaks(habit) {
        //setting the initial values
        var streak = 0,
            maxStreak = 0,
            currentStreak = -1,
            temp = 0,
            failedDate,
            completedDate;

        //for loop going through the failed dates
        for (var i = 0; i <= habit.datesFailed.length; i++) {
            if (habit.datesFailed.length == 0 || i == habit.datesFailed.length) { //if datesFailed is empty or i has passed the last date
                failedDate = 0;
            } else {
                //Change the date from a string to date format and get its time in milliseconds from 01/01/1970
                failedDate = stringToDate(habit.datesFailed[i], "dd/mm/yyyy", "/").getTime();
            }

            //for loop going from 'temp' through to length of datesCompleted
            for (var j = temp; j < habit.datesCompleted.length; j++) {
                completedDate = stringToDate(habit.datesCompleted[j], "dd/mm/yyyy", "/").getTime();
                if (completedDate > failedDate) { //if the completed date is more recent than the failed date then:
                    streak++; //add 1 to streak
                    temp = j + 1; //move temp to the next date
                } else { //if the failed date is more recent then:
                    currentStreak = (currentStreak==-1)? streak: currentStreak; //if 'currentStreak' is still set to -1 then set it to equal 'streak'
                    maxStreak = (streak > maxStreak)? streak : maxStreak; //if 'streak' is more than the current 'maxStreak' then update it to equal 'streak'
                    streak = 0; //reset streak
                }
            }
            //if the completedDates are always more recent than the failed dates then else statement above,
            //doesnt run so I set the maxStreak to equal streak
            maxStreak = (streak > maxStreak)? streak : maxStreak;
        }
        //if currentStreak still equals -1 then that means its supposed to be equal to maxStreak
        currentStreak = (currentStreak==-1)? maxStreak: currentStreak;
        //add the streaks to the stats object
        stats = {
            currentStreak: currentStreak,
            maxStreak: maxStreak
        }
        return stats; //and return it
    }


    //function that will convert string dates into actual dates with any format you want
    function stringToDate(_date, _format, _delimiter) {
        var formatLowerCase = _format.toLowerCase(); //sets the format all to lowercase
        //splits up the format. For example dd/mm/yyyy with the _delimiter "/" will be split up to dd and mm and yyyy
        var formatItems = formatLowerCase.split(_delimiter);
        //splits up date in the same way
        var dateItems = _date.split(_delimiter);
        //gets the indexes of dd, mm and yyyy from 'formatItems'
        var monthIndex = formatItems.indexOf("mm");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        //this has to be done because months in the js dates object start at 0 not 1 so we have to subtract 1 from all of them
        var month = parseInt(dateItems[monthIndex]);
        month -= 1;
        //creates the js date using the format required
        var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
        return formatedDate; //returns it to user
        //https://stackoverflow.com/questions/5619202/converting-string-to-date-in-js
    }

    //small function that will return whether or not an item is in the array given
    function isInArray(value, array) {
        return array.indexOf(value) > -1;
    }

}
