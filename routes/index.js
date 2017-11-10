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

}
