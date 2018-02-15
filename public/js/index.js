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

    getHabits();
    function getHabits(){
        axios.get('/gethabits')
        .then(response => {
            var data = response.data;
            var html;
            for (var habit = 0; habit < data.length; habit++) {

                var d = new Date();
                d.setDate(d.getDate() - 2);

                for (var i=0; i<5; i++){
                    var dd = d.getDate();
                    var mm = d.getMonth()+1;
                    var yyyy = d.getFullYear();
                    if (dd<10) dd = "0" + dd;
                    if (mm<10) mm = "0" + mm;
                    var currentDay = dd+"/"+mm+"/"+yyyy;
                    if (data[habit].datesCompleted.includes(currentDay)) {
                        $(`li#HabitID_${data[habit]._id} #habit_middle ul li:nth-of-type(${i+1})`).css("backgroundColor", "#ddffdd");
                    } else if (data[habit].datesFailed.includes(currentDay)){
                        $(`li#HabitID_${data[habit]._id} #habit_middle ul li:nth-of-type(${i+1})`).css("backgroundColor", "#ffdddd");
                    } else {
                        $(`li#HabitID_${data[habit]._id} #habit_middle ul li:nth-of-type(${i+1})`).css("backgroundColor", "#FFF");
                    }
                    d.setDate(d.getDate()+1);
                }
            }
            getDays();
        }).catch(err => {
            console.log(err);
        });
    }

    function getDays(){
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var today = new Date();
        var currentDay = (today.getDay() > 1) ? today.getDay()-2 : today.getDay()-2+7; //gets the position of the name in the array days

        for (var i = 1; i <= 5; i++) {
            $(`.content#dashboard_content .habits ul li #habit_middle ul li:nth-of-type(${i})`).text(days[currentDay]);
            currentDay++;
            if (currentDay > 6) currentDay-=7;
        }
        $(`.content#dashboard_content .habits ul li #habit_middle ul li:nth-of-type(3)`).text("Today");
    }


    $(document).on('click', '.content#dashboard_content .habits ul li #habit_middle ul li', function(){
        console.log("clicked");
        var posting = false;
        var dayClicked = $(this).index();
        var date = getDate(dayClicked);
        var habit_name = $(this).parent().parent().parent().attr('id');
        var id = habit_name.substr(8);

        console.log("date: " + date);
        // Send a POST request
        if(!posting){
            posting=true;
            axios.post('/updatehabit', {
                habit_id: id,
                date: date
            })
            .then(function (response) {
                posting=false;
                if(response.data == "completed"){
                    $(`.content#dashboard_content .habits ul li#${habit_name} #habit_middle ul li:nth-of-type(${dayClicked+1})`).css("backgroundColor", "#ddffdd");
                } else if (response.data == "failed"){
                    $(`.content#dashboard_content .habits ul li#${habit_name} #habit_middle ul li:nth-of-type(${dayClicked+1})`).css("backgroundColor", "#ffdddd");
                } else {
                    $(`.content#dashboard_content .habits ul li#${habit_name} #habit_middle ul li:nth-of-type(${dayClicked+1})`).css("backgroundColor", "#fff");
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        }

    })

    function getDate(dayClicked){
        var today = new Date();
        var dateOffset = (24*60*60*1000) * (2-dayClicked); //5 days
        today.setTime(today.getTime() - dateOffset);

        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        if(dd<10) dd='0'+dd;
        if(mm<10) mm='0'+mm;

        return `${dd}/${mm}/${yyyy}`;
    }
});
