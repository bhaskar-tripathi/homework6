$(document).ready(function () {

  // Set Weather API key
  var apiKey = "832cd237949a3fbe0046858b8cbf4c29";

  const citylistStoreID = "citylist";
  var cityList = JSON.parse(localStorage.getItem(citylistStoreID));
  if(cityList === null){ cityList= []};

  //-------------------------***START***-----------------------------
  //                Function Definition: displaySearchHistory()
  //-----------------------------------------------------------------
  function displaySearchHistory(){
    $("#searchHistory").empty();
    $.each(cityList, function (index, item){
      
      var listItem = $("<li class='list-group-item'>");

      listItem.text(item);
      listItem.attr("data-cityname",item);
      
      $("#searchHistory").prepend(listItem);
    });
  };

  //--------------------------***END***------------------------------
  //                Function Definition: displaySearchHistory()
  //-----------------------------------------------------------------

  //-------------------------***START***-----------------------------
  //                Function Definition: getWeather()
  //-----------------------------------------------------------------
  function getWeather(lat, lon, city) {

    //var city = $("#citySearchTextField").val();
    var baseURL = "https://api.openweathermap.org/data/2.5/";

    if (lat !== undefined && lon !== undefined) {
      var queryParam = "lat=" + lat + "&lon=" + lon;
    }
    else {
      var queryParam = "q=" + city;
    };


    var openWeatherUrl = baseURL + "weather?&units=imperial&" + queryParam + "&APPID=" + apiKey;
    openWeatherUrl = encodeURI(openWeatherUrl);

    // Call Weather API for general weather
    $.ajax({
      url: openWeatherUrl,
      method: "GET"


    }).then(function (responseW) {

      $("#currentDate").html(" (" + moment().format("M/D/YYYY") + ")");

      $("#cityName").html(responseW.name); 
      $("#temperature").html("Temperature: "+ responseW.main.temp + " &#8457");
      $("#humidity").html("Humidity: "+ responseW.main.humidityy + "%");
      $("#windSpeed").html("Wind Speed: "+ responseW.wind.speed + " MPH");

      // Set weather icon
      var image_src = "https://openweathermap.org/img/wn/" + responseW.weather[0].icon +"@2x.png";
      $("#currentImg").attr("src",image_src);
      
      // Call Weather API for UV Index
      var uvIndexUrl = baseURL + "uvi?lat=" + responseW.coord.lat + "&lon=" + responseW.coord.lon + "&APPID=" + apiKey;
      $.ajax({
        url: uvIndexUrl,
        method: "GET"

      }).then(function (responseU) {
        $("#uvIndex").html("UV Index: <span class='bg-danger text-white py-1 px-2 rounded' >" + responseU.value +"</span>");
      })

    });
  };
  //--------------------------***END***------------------------------
  //                Function Definition: getWeather()
  //-----------------------------------------------------------------

  //-------------------------***START***-----------------------------
  //                Function Definition: getFiveDayWeather()
  //-----------------------------------------------------------------
  function getFiveDayWeather(lat, lon, city){

    //var city = $("#citySearchTextField").val();
    var baseURL = "https://api.openweathermap.org/data/2.5/forecast?&cnt=5&units=imperial&";
    if (lat !== undefined && lon !== undefined) {
      var queryParam = "lat=" + lat + "&lon=" + lon;
    }
    else {
      var queryParam = "q=" + city;
    };

    var openWeatherUrl = baseURL + queryParam + "&APPID=" + apiKey;
    openWeatherUrl = encodeURI(openWeatherUrl);

    // call Weather API for daily forcast
    $.ajax({
      url: openWeatherUrl,
      method: "GET"

    }).then(function (response5DailyW) {

      
      $.each(response5DailyW.list, function(index, item){
        var dayField = "#day"+ (index+1); 
        var tempField = "#temperaturePlus"+ (index+1);
        var humidField = "#humidityPlus"+ (index+1);
        var imageField = "#imgDay"+ (index+1);

        $(dayField).text(moment().add(index+1, "days").format("M/D/YYYY"));
        $(tempField).html("Temp: "+ item.main.temp + " &#8457");
        $(humidField).html("Humidity: "+ item.main.humidity + "%");

        // Set weather image
        var image_src_forecast = "https://openweathermap.org/img/wn/" + item.weather[0].icon +"@2x.png";
        $(imageField).attr("src",image_src_forecast);
      });



    });

  };
  //--------------------------***END***------------------------------
  //                Function Definition: getFiveDayWeather()
  //-----------------------------------------------------------------

  //-------------------------***START***-----------------------------
  //                Function Definition: init()
  //-----------------------------------------------------------------
  function init() {

    displaySearchHistory();

    navigator.geolocation.getCurrentPosition(locatePosition);

    function locatePosition(position) {
      getWeather(position.coords.latitude, position.coords.longitude,undefined);
      getFiveDayWeather(position.coords.latitude, position.coords.longitude,undefined);
    };
  };
  //--------------------------***END***------------------------------
  //                Function Definition: init()
  //-----------------------------------------------------------------


  //-----------------------------------------------------------------
  //                Attach and Call functions
  //-----------------------------------------------------------------
  //initialize the dashboard
  init();

  // Trigges Weather search
  $("#searchButton").on("click", function (event) {
    event.preventDefault();

    // Add city to search history    
    var cityIndex = cityList.indexOf($("#citySearchTextField").val());
    if(cityIndex >= 0){ cityList.splice(cityIndex,1)};
    if(cityList.length >= 5){cityList.shift()};
    cityList.push($("#citySearchTextField").val());
    localStorage.setItem(citylistStoreID,JSON.stringify(cityList));
    displaySearchHistory();

    getWeather(undefined,undefined,$("#citySearchTextField").val());
    getFiveDayWeather(undefined,undefined,$("#citySearchTextField").val());
  });

  // Attach autocomplete
  var input = document.getElementById('citySearchTextField');
  var options = {
    types: ["(cities)"]
  };
  new google.maps.places.Autocomplete(input, options);

  // Attach click to past searched list
  $("#searchHistory").on("click","li", function(){
    getWeather(undefined,undefined,this.dataset.cityname);
    getFiveDayWeather(undefined,undefined,this.dataset.cityname);
  });


});