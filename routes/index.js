module.exports = (app) => {

  app.get('/login', function(req, res, next){
    res.render('login', {
      title: "Quirk - Loign",
    });
  });

  app.get('/', function(req, res, next){
    res.render('dashboard', {
      title: "Quirk - Dashboard",
    });
  });

}
