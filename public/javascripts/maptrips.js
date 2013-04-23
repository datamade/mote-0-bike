// maptrips.js

$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 90; // Calculate the top offset
  $('#map').css('height', (h - offsetTop));
}).resize();

LeafletLib.initialize($("#map")[0], {}, [41.8781136, -87.66779], 11);

var tripsloaded = 0;
for(trip in trips){
  $.getJSON("/api/trip/" + (trips[trip]["_id"] || trips[trip]["id"] || trips[trip]), function(data){
    var trippts = [ ];
    for(record in data.records){
      //console.log( data.records[ record ] );
      trippts.push( new L.LatLng( data.records[record].ll[0], data.records[record].ll[1] ));
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
  });
}