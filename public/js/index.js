$(document).ready(function() {

    var animSpeed = 200; //used to keep the animation speed the same throughout the webpage

    //When 'Add habit' button is pressed => drop down menu
    $('header a#add_habit').click(function() {
        $('.content#dashboard_content .habit_tab').slideToggle(animSpeed); //Slide toggle the drop down menu
    });

    //When 'Edit habit' button is pressed => drop down menu
    $('header a#edit_habit').click(function() {
        $('.content#stats_content .habit_tab').slideToggle(animSpeed); //Slide toggle the drop down menu
    });

    //functions that run as soon as the website is loaded
    setDays(); //sets the name of each day (e.g. Saturday, Sunday, Today, Tuesday, Wednesday)
    loadColours(); //loads all the colours of the habits
    function loadColours() {
        axios.get('/gethabits') //get request to "/gethabits" to get all the user's habits and their data
            .then(response => { //request successful
                var data = response.data;
                for (var habit = 0; habit < data.length; habit++) { //loop through all the habits from GET response
                    //getting the date of the 1st box:
                    var d = new Date();
                    d.setDate(d.getDate() - 2);

                    for (var i = 0; i < 5; i++) { //loop through boxes
                        //changing from date format to string by the seperation of the date:
                        var dd = d.getDate();
                        var mm = d.getMonth() + 1;
                        var yyyy = d.getFullYear();
                        if (dd < 10) dd = "0" + dd;
                        if (mm < 10) mm = "0" + mm;
                        var currentDay = dd + "/" + mm + "/" + yyyy;

                        if (data[habit].datesCompleted.includes(currentDay)) { //if the date of the current box is found in the array 'datesCompleted'
                            //date is successful so make box green
                            $(`li#HabitID_${data[habit]._id} #habit_middle ul li:nth-of-type(${i+1})`).css("backgroundColor", "#ddffdd");
                        } else if (data[habit].datesFailed.includes(currentDay)) { //if date of current box is in 'datesFailed'
                            //user failed that day so make the box red
                            $(`li#HabitID_${data[habit]._id} #habit_middle ul li:nth-of-type(${i+1})`).css("backgroundColor", "#ffdddd");
                        } else {
                            //this means that the user has skipped this day so make the box white
                            $(`li#HabitID_${data[habit]._id} #habit_middle ul li:nth-of-type(${i+1})`).css("backgroundColor", "#FFF");
                        }
                        d.setDate(d.getDate() + 1); //get the date of the next box
                    }
                }
            }).catch(err => {//request failed
                console.log(err); //output error
            });
    }

    function setDays() {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; //array with day names
        var today = new Date(); //get todays date
        //gets the position of the 1st day by subtracting 2 from today (since today is the box in the middle then the 1st day is 2 boxes to the left)
        //if the day today is less than 1 (Sunday or Monday) then add 7 so it loops to the beginning of the array 'days'
        var currentDay = (today.getDay() > 1) ? today.getDay() - 2 : today.getDay() - 2 + 7;

        for (var i = 1; i <= 5; i++) { //loop through the 5 boxes shown to user
            $(`li #habit_middle ul li:nth-of-type(${i})`).text(days[currentDay]); //set the text inside to equal that day of the week
            currentDay++; //next day
            if (currentDay > 6) currentDay -= 7; //currentDay has to loop back to beginning when passes the the last day in the array (Saturday)
        }
        $(`li #habit_middle ul li:nth-of-type(3)`).text("Today"); //set the text of the box in the middle to 'Today'
    }

    //When a box/day is clicked then send a post request.
    $(document).on('click', '.content#dashboard_content .habits ul li #habit_middle ul li', function() {
        var dayClicked = $(this).index(); //get index of which day was clicked
        var date = getDate(dayClicked); //get its date in string format
        var habit_name = $(this).parent().parent().parent().attr('id'); //getting the name of the habit's box that was clicked
        var id = habit_name.substr(8); //getting just the id of it from the name

        // Sending a POST request
        axios.post('/updatedate', {
                habit_id: id,
                date: date
            })
        .then(function(response) {
            if (response.data == "completed") { //make box green if the day is successful
                $(`li#${habit_name} #habit_middle ul li:nth-of-type(${dayClicked+1})`).css("backgroundColor", "#ddffdd");
            } else if (response.data == "failed") { //make box red if the day is unsuccessful
                $(`li#${habit_name} #habit_middle ul li:nth-of-type(${dayClicked+1})`).css("backgroundColor", "#ffdddd");
            } else if (response.data == "skipped") { //make box white if the day has been skipped
                $(`li#${habit_name} #habit_middle ul li:nth-of-type(${dayClicked+1})`).css("backgroundColor", "#fff");
            }
        })
        .catch(function(error) { //output error
            console.log(error);
        });
    })

    function getDate(dayClicked) {
        //finding the offset from today, changing it into a date and returning it in the format dd/mm/yyyy
        var today = new Date();
        var dateOffset = (24 * 60 * 60 * 1000) * (2 - dayClicked); //5 days
        today.setTime(today.getTime() - dateOffset);

        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        return `${dd}/${mm}/${yyyy}`;
    }

    //when statisics on the nav is clicked, show the habits for user to select to see the stats for and the dark background
    $("#nav_stats_link").click(function() {
        $(".StatsModal").show(animSpeed);
        $(".StatsModalBackground").fadeIn(animSpeed);
    });

    $(".StatsModalBackground").click(function() { //when dark background is clicked, the statistics modal is hidden
        $(".StatsModal").hide(animSpeed);
        $(".StatsModalBackground").fadeOut(animSpeed);
    });


    // ======================================{ Stats Page }===========================================]

    if (window.location.pathname.substr(0, 6) == "/stats") { //when stats page is navigated to
        var habit_id = window.location.pathname.substr(7, 24) //get the habit id of the habit stats open right now

        axios.get('/gethabits') //get all the habits' data
        .then(response => loadCharts(response.data)) //send response to loadCharts()
        .catch(e => { //if error then output it
            console.log(e);
        });
    }


    function loadCharts(data) {
        var index = data.findIndex(i => i._id == habit_id) //find the habit with the habit id of this stats page
        var habit = data[index];
        var stats = { //calculate the stats
            currentStreak: habit.currentStreak,
            maxStreak: habit.maxStreak,
            daysCompleted: habit.datesCompleted.length,
            daysFailed: habit.datesFailed.length,
            totalDays: habit.weekly_goal * habit.num_of_weeks
        }
        //these had to be calculated outside because they require other stats already created (e.g. daysMarked requires daysCompleted & daysFailed)
        stats.daysMarked = stats.daysCompleted + stats.daysFailed;
        stats.successRate = Math.round((stats.daysCompleted / stats.daysMarked) * 100);
        stats.daysLeft = stats.totalDays - stats.daysMarked < 0 ? 0 : stats.totalDays - stats.daysMarked;

        //outputting the success rate and total days on the page
        document.getElementById("#current_streak").innerText = stats.currentStreak;
        document.getElementById("#max_streak").innerText =  stats.maxStreak;
        document.getElementById("#success_rate").innerText = stats.successRate + "%";
        document.getElementById("#total_days").innerText = stats.daysMarked;


        Chart.defaults.global.defaultFontFamily = "Rubik"; //setting the font of the chart

        var ProgressChart = new Chart(mychart, { //create a doughnut chart using the chartjs library imported in the html with these settings:
            type: 'doughnut',
            data: {
                labels: ["completed", "failed", "days left"],
                datasets: [{
                    data: [stats.daysCompleted, stats.daysFailed, stats.daysLeft], //using the stats that were calculated earlier in the chart
                    backgroundColor: ["#4CFF7F", "#FF4C7F", "#f3f3f3"],
                    borderWidth: 1,
                    borderColor: "#aaa"
                }]
            },
            options: {
                title: {
                    display: true,
                    text: `Progress To Completing ${stats.totalDays} Days`,
                    fontSize: 18
                }
            }
        });
    }
});


//Facebook analytics that come with the facebook login
window.fbAsyncInit = function() {
    FB.init({appId: '130915754333328',xfbml: true,version: 'v2.10'});
    FB.AppEvents.logPageView();
};
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
