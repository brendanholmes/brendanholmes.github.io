
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


(function(){/*
 geolocation-marker version 2.0.4
 @copyright 2012, 2015 Chad Killingsworth
 @see https://github.com/ChadKillingsworth/geolocation-marker/blob/master/LICENSE.txt
*/
'use strict';var b,d=this;
function g(a,c,e){google.maps.MVCObject.call(this);this.a=this.b=null;this.g=-1;var f={clickable:!1,cursor:"pointer",draggable:!1,flat:!0,icon:{url:"https://chadkillingsworth.github.io/geolocation-marker/images/gpsloc.png",size:new google.maps.Size(34,34),scaledSize:new google.maps.Size(17,17),origin:new google.maps.Point(0,0),anchor:new google.maps.Point(8,8)},optimized:!1,position:new google.maps.LatLng(0,0),title:"Current location",zIndex:2};c&&(f=h(f,c));c={clickable:!1,radius:0,strokeColor:"1bb6ff",
strokeOpacity:.4,fillColor:"61a0bf",fillOpacity:.4,strokeWeight:1,zIndex:1};e&&(c=h(c,e));this.b=new google.maps.Marker(f);this.a=new google.maps.Circle(c);google.maps.MVCObject.prototype.set.call(this,"accuracy",null);google.maps.MVCObject.prototype.set.call(this,"position",null);google.maps.MVCObject.prototype.set.call(this,"map",null);this.set("minimum_accuracy",null);this.set("position_options",{enableHighAccuracy:!0,maximumAge:1E3});this.a.bindTo("map",this.b);a&&this.f(a)}
(function(){var a=google.maps.MVCObject;function c(){}c.prototype=a.prototype;g.prototype=new c;g.prototype.constructor=g;for(var e in a)if(d.Object.defineProperties){var f=d.Object.getOwnPropertyDescriptor(a,e);void 0!==f&&d.Object.defineProperty(g,e,f)}else g[e]=a[e]})();b=g.prototype;b.set=function(a,c){if(k.test(a))throw"'"+a+"' is a read-only property.";"map"===a?this.f(c):google.maps.MVCObject.prototype.set.call(this,a,c)};b.i=function(){return this.get("map")};b.l=function(){return this.get("position_options")};
b.w=function(a){this.set("position_options",a)};b.c=function(){return this.get("position")};b.m=function(){return this.get("position")?this.a.getBounds():null};b.j=function(){return this.get("accuracy")};b.h=function(){return this.get("minimum_accuracy")};b.v=function(a){this.set("minimum_accuracy",a)};
b.f=function(a){google.maps.MVCObject.prototype.set.call(this,"map",a);a?navigator.geolocation&&(this.g=navigator.geolocation.watchPosition(this.A.bind(this),this.o.bind(this),this.l())):(this.b.unbind("position"),this.a.unbind("center"),this.a.unbind("radius"),google.maps.MVCObject.prototype.set.call(this,"accuracy",null),google.maps.MVCObject.prototype.set.call(this,"position",null),navigator.geolocation.clearWatch(this.g),this.g=-1,this.b.setMap(a))};b.u=function(a){this.b.setOptions(h({},a))};
b.s=function(a){this.a.setOptions(h({},a))};
b.A=function(a){var c=new google.maps.LatLng(a.coords.latitude,a.coords.longitude),e=null==this.b.getMap();if(e){if(null!=this.h()&&a.coords.accuracy>this.h())return;this.b.setMap(this.i());this.b.bindTo("position",this);this.a.bindTo("center",this,"position");this.a.bindTo("radius",this,"accuracy")}this.j()!=a.coords.accuracy&&google.maps.MVCObject.prototype.set.call(this,"accuracy",a.coords.accuracy);!e&&null!=this.c()&&this.c().equals(c)||google.maps.MVCObject.prototype.set.call(this,"position",
c)};b.o=function(a){google.maps.event.trigger(this,"geolocation_error",a)};function h(a,c){for(var e in c)!0!==l[e]&&(a[e]=c[e]);return a}var l={map:!0,position:!0,radius:!0},k=/^(?:position|accuracy)$/i;function m(){g.prototype.getAccuracy=g.prototype.j;g.prototype.getBounds=g.prototype.m;g.prototype.getMap=g.prototype.i;g.prototype.getMinimumAccuracy=g.prototype.h;g.prototype.getPosition=g.prototype.c;g.prototype.getPositionOptions=g.prototype.l;g.prototype.setCircleOptions=g.prototype.s;g.prototype.setMap=g.prototype.f;g.prototype.setMarkerOptions=g.prototype.u;g.prototype.setMinimumAccuracy=g.prototype.v;g.prototype.setPositionOptions=g.prototype.w;return g}
"function"===typeof this.define&&this.define.amd?this.define([],m):"object"===typeof this.exports?this.module.exports=m():this.GeolocationMarker=m();}).call(this)
//# sourceMappingURL=geolocation-marker.js.map