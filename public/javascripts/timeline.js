// timeline.js

var playback, currentTime, start, end, trip, trackMarker;
var do_not_display_keys = ["time","ll"]

function mapMyTimeline(route){
  //console.log(route);
  trip = route;

  start = (new Date(route.start)) * 1;
  end = (new Date(route.end)) * 1;
  currentTime = start;

  $("#slider").slider({
    min: start,
    max: end,
    val: start,
    slide: function(event, ui){
      currentTime = ui.value;
      updateSensorValues(currentTime);
      if(playback){
        $("#playbtn").removeClass("btn-inverse").addClass("btn-success");
        $("#playbtn i").removeClass("icon-stop").addClass("icon-play-circle");
        $("#playbtn span.txt").text("Play");
        window.clearInterval(playback);
        playback = null;
      }
    },
    range: "min"
  });
  
  // Leaflet marker
  if(trip.records.length){
    trackMarker = new L.Marker( new L.LatLng( trip.records[0].ll[0], trip.records[0].ll[1] ) );
    LeafletLib.map.addLayer(trackMarker);
  }
  
  // activate play button
  $("#playbtn").on("click", function(e){
    if(playback){
      window.clearInterval(playback);
      playback = null;
      $("#playbtn").removeClass("btn-inverse").addClass("btn-success");
      $("#playbtn i").removeClass("icon-stop").addClass("icon-play-circle");
      $("#playbtn span.txt").text("Play");
    }
    else{
      $("#playbtn").removeClass("btn-success").addClass("btn-inverse");
      $("#playbtn i").removeClass("icon-play-circle").addClass("icon-stop");
      $("#playbtn span.txt").text("Stop");
      playback = window.setInterval(moveTimeline, 60);
    }
  });
}

function moveTimeline(){
  var interval = (end-start) / 100;
  if(end < currentTime + interval){
    currentTime = end;
    window.clearInterval(playback);
    playback = null;
    $("#playbtn").removeClass("btn-inverse").addClass("btn-success");
    $("#playbtn i").removeClass("icon-stop").addClass("icon-play-circle");
    $("#playbtn span.txt").text("Play");
  }
  else{
    currentTime += interval;
  }
  updateSensorValues(currentTime);
  $("#slider").slider('value', currentTime);
}

function updateSensorValues(time){
  var mostRecentRecord = null;
  for(var r=0;r<trip.records.length;r++){
    if(trip.records[r].time > time){
      break;
    }
    mostRecentRecord = trip.records[r];
  }
  // update map marker
  if(trackMarker){
    trackMarker.setLatLng( new L.LatLng( mostRecentRecord.ll[0] * 1.0, mostRecentRecord.ll[1] * 1.0 ) );
  }
  // display sensor values
  $("#sensors").html("");
  for(key in mostRecentRecord){
    if(do_not_display_keys.indexOf(key) > -1){
      continue;
    }
    $("#sensors").append("<li><strong>" + key + "</strong>: " + mostRecentRecord[key] + "</li>");
  }
}