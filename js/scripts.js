$(document).ready(function() {
    // all custom jQuery will go here
    var $home = $('#home');
    var $about = $('#about');
    var $header = $('#header');
    var $projects = $('#projects');
    var $projectsContainer = $('#projects-container'); 

    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    //set height of wecome screen section
	var $window = $(window).on('resize', function(){
	    var height = windowHeight  - $(header).height();;
	    $home.height(height);
    }).trigger('resize');

	//set height of about section
	var $window = $(window).on('resize', function(){
	    $about.height(windowHeight);
    }).trigger('resize');

    //set height of about section
    var $window = $(window).on('resize', function(){
        $projects.height($projectsContainer.height());
    }).trigger('resize');

	//can combine all sections and set padding
    $projects.css('padding-left', function(){
    	return windowWidth * 0.15;
    })

    $projects.css('padding-right', function(){
    	return windowWidth * 0.15;
    })

    $about.css('padding-left', function(){
    	return windowWidth * 0.15;
    })

    $about.css('padding-right', function(){
    	return windowWidth * 0.15;
    })


});