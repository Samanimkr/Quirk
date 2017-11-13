module.exports = (app) => {

  app.get('/login', function(req, res, next){
    res.render('login', {
      title: "Quirk - Login",
    });
  });

  app.get('/', function(req, res, next){
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
