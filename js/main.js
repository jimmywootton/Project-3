import { createTimeSlider } from "./slider.js";
import { createSouthAmericaMap } from "./southAmericaMap.js";
import { addMODISLayer, updateMODISLayer } from "./modisLayer.js";

const alpha3ToNum = {
    "ARG": "032",
    "BOL": "068",
    "BRA": "076",
    "CHL": "152",
    "COL": "170",
    "ECU": "218",
    "GUY": "328",
    "PRY": "600",
    "PER": "604",
    "SUR": "740",
    "URY": "858",
    "VEN": "862"
};

const sampleData = [
    { id: "076", value: 8 },
    { id: "604", value: 5 },
    { id: "170", value: 6 },
    { id: "032", value: 3 }
];
  
// Add initial MODIS layer
addMODISLayer("#map-container", "2005-01-01");

// Add choropleth overlay
createSouthAmericaMap(sampleData, "#map-container");

// Add slider
createTimeSlider({
    parentSelector: "#slider-container",
    startYear: 2005,
    endYear: 2024,
    onChange: (date) => {
        console.log("Selected date:", date);
        updateMODISLayer(date); // update MODIS layer dynamically
    }
});