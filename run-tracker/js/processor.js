
var marker;
var map;
var recordingStatus = false; //Initial condition: not recording a run
var recordedPath = []; //Initialise Path Array
var initCentre = false; //Inititialising map to centre when user loads map
var saveStatus = false; //Unsaved initial status

setMessageArea(""); //Initialise message area
var user = localStorage.getItem("loggedInUser"); //Finds the logged in user

navigator.geolocation.watchPosition(tracker); //follows position indefinitely and location information goes to tracker function

//Initialise the map
function initMap() {
    var mapOptions = {
        zoom: 17,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    //Puts the blue circle and region around your location
    var GeoMarker = new GeolocationMarker(map);

    //Map centres on your current position
    //Get geolocation marker to follow movement
/*    google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
        map.setCenter(this.getPosition());
        map.fitBounds(this.getBounds());
    });*/
/* 	            
    
	//Set Geolocation marker options
	GeoMarker.setCircleOptions({
        fillColor: '#808080'
    });

	//Print error message if GeoMarker fails
    google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {         //Catch errors in geolocation
        alert('There was an error obtaining your position. Message: ' + e.message);
    });
	//Apply geolocation to map
    GeoMarker.setMap(map); */
	
	// We add a DOM event here to show an alert if the DIV containing the
	// map is clicked.
	//google.maps.event.addDomListener(mapDiv, 'click', function() {
	//  window.alert('Map was clicked!');
	//});
}


//this is where the magic happens: anything that requires location goes in this function
function tracker(position) {
    var lat = position.coords.latitude; 
    var lng = position.coords.longitude; 
    var latLng = new google.maps.LatLng(lat, lng);

    latLngGlobal = latLng;

    if (initCentre === false) {
        map.panTo(latLng);
        initCentre = true;
        console.log("Centre Map initialisation location: " + latLng)
    };

    if (recordingStatus === true) {
        map.panTo(latLng); //moves centre of map to current position

        recordedPath[recordedPathIndex] = {
            position: latLng,
            time: getCurrentTime(),
            date: getCurrentDate()
        };
        console.log("recordedPath: " + recordedPath);

        if (recordedPathIndex > 2) {
            var polylinePoints = [recordedPath[recordedPathIndex - 1].position, recordedPath[recordedPathIndex].position];
            console.log("polylinePoints: " + polylinePoints)
            drawPolyline(map, polylinePoints);
            distSoFar += Number(twoPointDistance(polylinePoints)); //distSoFar holds the cumulative distance walked in m
            calorieBurn = ((distSoFar / 1000) * 70).toFixed(1); //calorieBurn converts to km then applies calorie formula


            var timeDiff = ((new Date()) - startTime) / 1000 //Time difference in sec

            if (timeDiff < 60) { //Returns a correctly formatted time string depending on the minute
                var mins = 0;
                var seconds = Math.floor(timeDiff);
            } else {
                var mins = Math.floor(timeDiff / 60);
                var seconds = Math.floor(timeDiff % 60);
            }

            timeSoFar = mins + "min " + seconds + "s";      //Writes time to a string
            avgSpeed = distSoFar / timeDiff;                //Computes average speed

            //All the informations
            setMessageArea(distSoFar.toFixed(2) + "m, " + timeSoFar + ", " + calorieBurn + "Cal");
        };
        console.log("recordedPathIndex: " + recordedPathIndex);
        recordedPathIndex++;
    };

};

function drawPolyline(map, coordinatesArray) {
    var polyline = new google.maps.Polyline({
        path: coordinatesArray,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    polyline.setMap(map);
};

function getCurrentTime() {
    var currentDate = new Date();
    var currentTime = currentDate.toLocaleTimeString();
    return currentTime;
};

function getCurrentDate() {
    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth();
    var year = now.getFullYear();
    var dateString = "";
    var dateString = day + "/" + month + "/" + year;
    return dateString;
};


function startTracking() {
    recordedPath = ["", ""]; //Resets the recorded path array
    recordingStatus = true;
    this.recordedPathIndex = 2;
    setMessageArea("Started");
    setMarker(latLngGlobal, "Start Marker");
    distSoFar = 0;
    startTime = new Date();
    calorieBurn = 0;
    document.getElementById("startStopButton").innerHTML = "STOP"; //Change the button name!
    document.getElementById("startStopButton").setAttribute("onclick", "stopTracking()"); //Change the button function!
};

function stopTracking() {
    recordingStatus = false;
    document.getElementById("startStopButton").innerHTML = "START"; //Change the button name!
    document.getElementById("startStopButton").setAttribute("onclick", "startTracking()"); //Change the button function!
    setMessageArea("Stopped");
    setMarker(latLngGlobal, "End Marker")
};

function setMarker(coordinatesObject, text) {
    new google.maps.Marker({
        position: coordinatesObject,
        map: map,
        title: text
    })
};

function centreMap() {
    map.panTo(latLngGlobal);
    setMessageArea("Map centred");
};

function clearMap() {
    if (saveStatus === true) {
        initMap();
        setMessageArea("Map cleared");
        saveStatus = false;
    } else {
        var saveCheck = confirm("Route not saved, press OK to continue without saving, or cancel to go back and save the route.");
        if (saveCheck === true) {
            initMap();
            setMessageArea("Map cleared");
        };
    };
};

function saveLastRun() {
    //Not logged in error
    var loginStatus = localStorage.getItem("loginStatus");
    if (loginStatus === false) {
        alert('You must be logged in to save runs')
    } else {
        var routeName = prompt("Enter route name: ");
        recordedPath[0] = localStorage.getItem("loggedInUser");
        var runData = {
            route_name: routeName,
            distance: distSoFar,
            calorieBurn: calorieBurn,
            total_time: timeSoFar,
            speed: avgSpeed
        }
        recordedPath[1] = runData;
        localStorage.setItem("RUN " + routeName, JSON.stringify(recordedPath));
        setMessageArea("Run saved: access from menu above");

    };
};

function setMessageArea(text) {
    document.getElementById("message-area").innerHTML = text;
    console.log(text);
};

function twoPointDistance(points) {
    return (google.maps.geometry.spherical.computeDistanceBetween(points[0], points[1]).toFixed(2))
        //Uses the GMaps API to calculate distance between two points.
}
