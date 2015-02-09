"use strict";
(function() {

    var mouseDown = false;

    $(document).ready(function() {
        $('td').hover(function(e) {
            //console.log(mouseDown);
            pauseEvent(e);
            if (mouseDown) {
                //if (!$(this).hasClass('.tableActive')) {
                    $(this).addClass('tableActive');
                //}
            }
        });

        $(document).mousedown(function() { 
            mouseDown = true;
        });
        $(document).mouseup(function() {
            mouseDown = false;
        });

    });

    function pauseEvent(e){
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

})();