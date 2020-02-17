
var g_map = null;
var g_bus_marker_layer;

function init() {
  map = new OpenLayers.Map("basicMap");


  var options = {
    displayOutsideMaxExtent:true,
    transitionEffect:'resize',
    "attribution": "ok"
  };

  //var mapnik         = new OpenLayers.Layer.OSM( );
  //var mapnik         = new OpenLayers.Layer.OSM( "?", "ok", options);
  var mapnik         = new OpenLayers.Layer.OSM("layer",null, options);
  var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
  var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
  var position       = new OpenLayers.LonLat(-76.5019, 42.444).transform( fromProjection, toProjection);
  var zoom           = 15; 

  map.addLayer(mapnik);
  map.setCenter(position, zoom );

  g_bus_marker_layer = new OpenLayers.Layer.Markers( "Bus" );

  g_map = map;

  g_map.addLayer(g_bus_marker_layer);
  g_map.setLayerIndex(g_bus_marker_layer, 98);

  g_map.addControl(new OpenLayers.Control.Zoom({"zoomInId":"customZoomIn", "zoomOutId":"customZoomOut"}));

  add_marker();

  //document.getElementsByClassName('olControlAttribution')[0].style.left='95vw';
  //document.getElementsByClassName('olControlAttribution')[0].style.top='95vh';

}

function add_marker() {
  var lon = -76.5019, lat = 42.444;

  var stop_w = 36, stop_h = 45;
  var size = new OpenLayers.Size(stop_w, stop_h);
  var offset = new OpenLayers.Pixel( -(size.w/2), -(size.h/2) );

  var icon = new OpenLayers.Icon("img/bus_gw.png", size, offset);


  var lonlat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"),g_map.getProjectionObject());
  var osm_marker = new OpenLayers.Marker(lonlat, icon);

  g_bus_marker_layer.addMarker(osm_marker);


}


function _add_marker() {

  var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
  var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
  var position       = new OpenLayers.LonLat(-76.5019, 42.444).transform( fromProjection, toProjection);

  var markers = new OpenLayers.Layer.Markers("Markers");
  g_map.addLayer(markers);
  markers.addMarker(new OpenLayers.Marker(position));

   
}
