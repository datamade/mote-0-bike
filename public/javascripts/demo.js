// click the play button, wait 30 seconds
function playTrip(){
  setTimeout(nextDemo,20000);
  $('#playbtn').click();
}

// load the next demo
function nextDemo(){
  console.log('next!');
  location.reload(false);
}

// on load, start a timer
$(function() {
  setTimeout(playTrip,2000);
});