"use strict";
(function() {

$(document).ready(function() {
	
});
var isMouseDown = false;
var isHighlighted;

$(document).ready(function() {
	$(document).mouseup(function () {
      	isMouseDown = false;
    });
    
  	$("#dataTable td")
  		.mousedown(function () {
	      	isMouseDown = true; //Set mousedown to true
	      	$(this).toggleClass("highlighted"); //Toggle highlighted class
	      	isHighlighted = $(this).hasClass("highlighted");
	      	return false; // prevent text selection
    	})
    	.mouseover(function () {
	      	if (isMouseDown) {
	        	$(this).toggleClass("highlighted", isHighlighted);
	      	}
    	});

  	

});

function pauseEvent(e){
    e.stopPropagation();
    e.preventDefault();
    return false;
}

})();