(function () {
    'use strict';

    // add your script here
    var map = L.map('map').setView([21.2785, -157.8327], 13);
    var marker = L.marker([21.2782, -157.8326]).addTo(map);
    var circle = L.circle([21.4160, -157.7956], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);
    var polygon = L.polygon([
        [21.678140, -158.046585],
        [21.668140, -158.036585],
        [21.658140, -158.056585]
    ]).addTo(map);
    var popup = L.popup()
        .setLatLng([51.513, -0.09])
        .setContent("I am a standalone popup.")
        .openOn(map);




    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    marker.bindPopup("This is the resort I used to hula dance at!").openPopup();
    circle.bindPopup("This is the general neighborhood I<br>used to live at with my aunt and uncle");
    polygon.bindPopup("This is where my friends and I would hang out a lot");

    var popup = L.popup();

    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    }

    map.on('click', onMapClick);
}());