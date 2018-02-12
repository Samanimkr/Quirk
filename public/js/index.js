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
  });

    // var d = new Date("02/12/2018");

    getDays();

    function getDays(){
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var today = new Date();
        var currentDay = (today.getDay() > 2) ? today.getDay()-2 : today.getDay()-2+7; //gets the position of the name in the array days

        for (var i = 1; i <= 5; i++) {
            $(`.content#dashboard_content .habits ul li #habit_middle ul li:nth-of-type(${i})`).text(days[currentDay]);
            currentDay++;
            if (currentDay > 6) currentDay-=7;
        }



        // var dd = today.getDate();
        //
        // var mm = today.getMonth()+1;
        // var yyyy = today.getFullYear();
        // if(dd<10)
        // {
        //     dd='0'+dd;
        // }
        //
        // if(mm<10)
        // {
        //     mm='0'+mm;
        // }
        // today = dd+'/'+mm+'/'+yyyy;
    }
});
