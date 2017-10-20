module.exports = (app) => {

  app.get('/', function(req, res, next){
    res.render('index', {
      title: "Home",
    });
  });

  app.get('/login', function(req, res, next){
    res.render('login', {
      title: "Quirk - Loign",
    });
  });

  app.get('/dashboard', function(req, res, next){
    res.render('dashboard', {
      title: "Quirk - Dashboard",
    });
  });
  
}
