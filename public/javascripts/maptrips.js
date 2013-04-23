// maptrips.js

$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 90; // Calculate the top offset
  $('#map').css('height', (h - offsetTop));
}).resize();

LeafletLib.initialize($("#map")[0], {}, [41.8781136, -87.66779], 11);

for(trip in trips){
  $.getJSON("/api/trip/" + trips[trip]["_id"], function(data){
    var tripline = [ ];
    for(record in data.records){
      //console.log( data.records[ record ] );
      tripline.push( new L.LatLng( data.records[record].ll[0], data.records[record].ll[1] ));
    }
    //console.log(tripline);
    LeafletLib.map.addLayer(new L.Polyline( tripline, { width: 10, color: "#f00" } ));
    
    if(typeof mapMyTimeline == 'function'){
      mapMyTimeline(data);
    }
  });
}