// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Perform a GET request to the query URl
d3.json(queryUrl).then(function(data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // define a function that we want to run for each feature in the features array.
    //give each feature a popup that describes the place and time of the earhquake.

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p>`);
    };


    // Create a GeoJson Layer that contains the features array on the earthquakeData object
    //Run the onEachFeature function once for each piece of data in the array.

    function createCircleMarker(feature, latlng){
        let options = {
            //radius of circlemarkers will be detrmined by magnitude size
            radius: feature.properties.mag*5,
            fillColor: chooseColor(feature.properties.mag),
            color: chooseColor(feature.properties.mag),
            weight: 1,
            opacity: 0.75,
            fillOpacity: 0.3
        }
        return L.circleMarker(latlng, options);
    };

    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker

    });

    //send our earthquakes layer to the createMap functions

    createMap(earthquakes);
};

// Circles color palette based on mag (feature) data marker: data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
// Selected colors usinf HTML color picker https://www.w3schools.com/colors/colors_picker.asp
function chooseColor(mag){
    switch(true){
        case(0 <= mag && mag <= 1.0):
            return "#00ffbf"; // lime Green
        case(1.0 <= mag && mag <= 2.5):
            return "#35BC00";
        case (2.5 <= mag && mag <=4.0):
            return "#ffff00";
        case (4.0 <= mag && mag <=5.5):
            return "#ffbf00";
        case (5.5 <= mag && mag <= 8.0):
            return "#ff4000";
        case (8.0 <= mag && mag <=20.0):
            return "#ff0000";
        default:
            return "#E2FFAE";
    }
};

// Create map legend to provide context for map data
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0, 1.0, 2.5, 4.0, 5.5, 8.0];
    let labels= [];
    let legendInfo = "<h4>Magnitude Scale</h4>";

    div.innerHTML = legendInfo

    //Go through each magnitude item to label and color the legend
    // push to labels arrays as list item
    for (let i = 0; i < grades.length; i++) {
        labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
      }

        // add each label list item to the div under the <ul> tag
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  
    return div;
};

function createMap(earthquakes) {
    //Create the base layers.
    let street= L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    //Create a baseMaps object

    let baseMaps = {
        "Street Map" : street,
        "Topographic Map": topo
    };

    //create a overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    //Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 4,
        layers: [street, earthquakes]
      });

      // Create a layer control.
      //Pass it our baseMaps and overlaysMap
      //Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
      }).addTo(myMap);
      legend.addTo(myMap);



};