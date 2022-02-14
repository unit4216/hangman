$(function() {

    if(localStorage.getItem('firstVisit')==null){
        //splash screen "enter" function, fades out splash screen and fades in app and allows keypress event listener to function
        $('#start').click(function() { 
            localStorage.setItem('ready', true);    //enable keypress input
            $(this).parent().fadeOut(500);
            $('#hangApp').fadeIn(500);
            //splash screen only shows up on first session
            localStorage.setItem('firstVisit', false);
        });
    } else {
        //set splash screen to hidden and app to visible
        document.getElementById('splash').style.display = 'none';
        document.getElementById('hangApp').style.display = 'block';
    }

});