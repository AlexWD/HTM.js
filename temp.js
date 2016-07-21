/**
 * Created by Alexander on 9/24/2015.
 */
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
};

Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
};


var circles = [];

function pointData () {
    var data = {
        points: []
    };
    for (var i = 0; i < circles.length;++i) {
        var circle = circles[i];
        data.points.push({
            center: circle.getCenter().toString(),
            radius: circle.getRadius().toString()
        });
    }
    return data;
}

function loadJson (data) {
    var points = data.points;
    for (var i = 0;i < points.length;++i) {
        var point = points[i];


    }
}

function addPoint () {

}

function initAutocomplete () {
    google.maps.LatLng.prototype.destinationPoint = function(brng, dist) {
        dist = dist / 6371;
        brng = brng.toRad();

        var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
            Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

        var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                Math.cos(lat1),
                Math.cos(dist) - Math.sin(lat1) *
                Math.sin(lat2));

        if (isNaN(lat2) || isNaN(lon2)) return null;

        return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
    };

    var pointA = new google.maps.LatLng(34.155260, -118.787163);   // Circle center
    var radius = 1;                                      // 10km

    var mapOpt = {
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        center: pointA,
        zoom: 10
    };



    var map = new google.maps.Map(document.getElementById("map"), mapOpt);


    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    google.maps.event.addListener(map, 'click', function(event) {

        // Draw the circle
        var newCircle = new google.maps.Circle({
            center: event.latLng,
            radius: radius * 1000,       // Convert to meters
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            map: map
        });

        // Show marker at circle center
        var newMarker = new google.maps.Marker({
            position: event.latLng,
            map: map
        });

        // add UI

        var tmpl = document.getElementById('map-point');
        document.getElementById("map-points").appendChild(tmpl.content.cloneNode(true));

        var pid = circles.length;

        var newItem = $('#map-points li:last');

        newItem.find('.p-center').html(newCircle.getCenter().toUrlValue());

        newItem.find('.remove').click(function() {
            // remove circle
            newCircle.setMap(null);
            // remove marker
            newMarker.setMap(null);
            // remove UI
            newItem.remove();
            // remove circle object
            circles.splice(circles.indexOf(newCircle), 1);
        });

        // radius slider
        $('#map-points li:last .radius-slider').slider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        }).on('change', function (event) {
            newCircle.setRadius(event.value.newValue);
        });

        // pan to point
        newItem.click(function() {
            map.panTo(newCircle.getCenter());

            $('#map-points li').css('background-color', '#FFF');
            $(this).css('background-color', '#ACF19A');
        });

        circles.push(newCircle);
    });
}
$(function() {
    $('.log-data').click(function() {
        console.log(JSON.stringify(pointData()));
    });
});