// maptrips.js

$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 90; // Calculate the top offset
  $('#map').css('height', (h - offsetTop));
}).resize();

LeafletLib.initialize($("#map")[0], {}, [41.8781136, -87.66779], 11);

for(trip in trips){
  var tripline = [ ];
  for(record in trips[trip].records){
    if(trips[trip].records[record][0] && trips[trip].records[record][1]){
      tripline.push( new L.LatLng( trips[trip].records[record][0], trips[trip].records[record][1] ));
    }
  }
  console.log(tripline);
  LeafletLib.map.addLayer(new L.Polyline( tripline, { width: 10, color: "#f00" } ));
}