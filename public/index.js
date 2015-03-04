"use strict";
(function() {

var isMouseDown = false;
var isHighlighted;
var preferredMode = true;

$(document).ready(function() {
	$(document).mouseup(function () {
      	isMouseDown = false;
    });
    
  	$("#dataTable td")
  		.mousedown(function () {
	      	isMouseDown = true; //Set mousedown to true

            //Mousedown and not Times/Days
	      	if (!$(this).hasClass("tblTime")) {
                $(this).toggleClass("highlighted"); //Toggle highlighted class
            }

	      	isHighlighted = $(this).hasClass("highlighted");
	      	return false; // prevent text selection
    	})
    	.mouseover(function () {
            //console.log($(this));

            //Mousedown and not Times/Days
            if (isMouseDown && !$(this).hasClass("tblTime")) { 
                $(this).toggleClass("highlighted", isHighlighted);
	      	}
            return false;
    	});

  	

});

function pauseEvent(e){
    e.stopPropagation();
    e.preventDefault();
    return false;
}

})();