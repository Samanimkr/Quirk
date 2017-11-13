//Facebook analytics
window.fbAsyncInit = function() {
    FB.init({
      appId      : '130915754333328',
      xfbml      : true,
      version    : 'v2.10'
    });

    FB.AppEvents.logPageView();

  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

$(document).ready(function(){

  var animSpeed = 200;

  //When 'Add habit' button is pressed => drop down menu
  $('header#dashboard_header a#add_habit').click(function(){
    $('.content#dashboard_content .add_habit_tab').slideToggle(animSpeed); //Slide toggle the drop down menu
    $('header#dashboard_header a#add_habit').toggle(function(){
      $('header#dashboard_header a#add_habit').css('color','F9F9F9');
    });
  });

});
