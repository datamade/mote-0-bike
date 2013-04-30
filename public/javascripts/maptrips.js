// maptrips.js

$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 90; // Calculate the top offset
  $('#map').css('height', (h - offsetTop));
}).resize();

LeafletLib.initialize($("#map")[0], {}, [41.8781136, -87.66779], 11);

var tripsloaded = 0;
for(trip in trips){
  if((typeof trips[trip].records == "undefined") && (typeof trips[trip].simplified == "undefined")){
    $.getJSON("/api/trip/" + (trips[trip]["_id"] || trips[trip]["id"] || trips[trip]), loadTrip);
  }
  else{
    loadTrip( trips[trip] );
  }
}

function loadTrip(data){
  var trippts = [ ];
  if(typeof trips[trip].records != "undefined"){
    for(record in data.records){
      trippts.push( new L.LatLng( data.records[record].ll[0], data.records[record].ll[1] ));
    }
  }
  else{
    for(record in data.simplified){
      trippts.push( new L.LatLng( data.simplified[record][0], data.simplified[record][1] ));
    }
  }
  //console.log(tripline);
  var tripline = new L.Polyline( trippts, { width: 10, color: "#f00" } );
  LeafletLib.map.addLayer( tripline );
  LeafletLib.addBoundedBox( tripline.getBounds() );

  tripsloaded++;

  if(typeof mapMyTimeline == 'function'){
    mapMyTimeline(data);
  }
  if(typeof finishedTrips == 'function' && tripsloaded == trips.length){
    finishedTrips();
  }
  if(typeof L.Marker.prototype.bindLabel == 'function'){
    tripline.on("click", function(e){
      window.location = "/viewtrip/" + data._id;
    });
    var label = "";
    if(typeof data.distance != "undefined"){
      label += "Distance: " + data.distance;
      label += "<br/>";
    }
    label += "Start: " + moment(new Date(data.start)).format('M/D h:mm a');
    label += "<br/>";
    label += "End: " + moment(new Date(data.end)).format('M/D h:mm a');
    label += "<br/>";
    label += "Click line to select";
    tripline.bindLabel(label);
  }
}