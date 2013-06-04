// timeline.js

var playback, currentTime, start, end, trip, trackMarker;
var do_not_display_keys = ["time","ll","ALT","BEARING","MPH","LIGHT"]

function mapMyTimeline(route){
  LeafletLib.fitFeatures();

  //console.log(route);
  trip = route;

  start = (new Date(route.start)) * 1;
  end = (new Date(route.end)) * 1;
  currentTime = start;

  for(var key in trip.records[0]){
    if(do_not_display_keys.indexOf(key) > -1){
      continue;
    }
    
    var datapoints = [ ];
    for(var r=0;r<trip.records.length;r++){
      datapoints.push( [ trip.records[r].time * 1.0, trip.records[r][key] ] );
    }
    
    $("#sensors").append("<div id='current_value_" + key + "' class='badge badge-info'></div>");
    $("#sensors").append("<div id='graph_" + key + "' style='height:100px;'></div><hr/>");
    $("#graph_" + key).highcharts({
      chart: {
        type: 'line'
      },
      title: {
        text: ""
      },
      xAxis: {
        labels: {
          enabled: false
        }
      },
      yAxis: {
        title: {
          text: getUnits(key)
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      series: [{
        name: key,
        data: datapoints
      }],
      plotOptions: {
        series: {
          marker: {
            enabled: false
          }
        }
      },
      tooltip: {
        formatter: tooltipFunction(key)
      }
    });
  }
  updateSensorValues( start );

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
    trackMarker = new L.Marker( new L.LatLng( trip.records[0].ll[0], trip.records[0].ll[1] ), { clickable: false } );
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

function tooltipFunction(key){
  return function(){
    var datetime = moment(this.point.x).format('h:mm a');
    return "<strong>" + datetime + "</strong><br/><strong>" + key + "</strong>: " + this.point.y
  };
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
  for(var key in mostRecentRecord){
    if(do_not_display_keys.indexOf(key) > -1){
      continue;
    }
    $('#graph_' + key).highcharts().xAxis[0].removePlotLine('plot-line-x');
    $('#graph_' + key).highcharts().xAxis[0].addPlotLine({
      value: mostRecentRecord.time,
      color: 'red',
      width: 2,
      id: 'plot-line-x'
    });
  }
  
  // update map marker
  if(trackMarker){
    trackMarker.setLatLng( new L.LatLng( mostRecentRecord.ll[0] * 1.0, mostRecentRecord.ll[1] * 1.0 ) );
  }

  // display sensor values from most recent reading
  //$("#sensors").html("");
  for(key in mostRecentRecord){
    if(do_not_display_keys.indexOf(key) > -1){
      continue;
    }
    $("#current_value_" + key).html("<strong>" + key + "</strong>: " + mostRecentRecord[key]);
    //$("#sensors").append("<li><strong>" + key + "</strong>: " + mostRecentRecord[key] + "</li>");
  }
}

function getUnits(key){
  if(typeof trip.units == 'undefined'){
    return key;
  }
  else if(typeof trip.units[key] != 'undefined'){
    return key + " (" + trip.units[key] + ")";
  }
  else{
    return key;
  }
}