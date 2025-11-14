import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { createTimeSlider } from "./slider.js";
import { addMODISLayer, updateMODISLayer } from "./modisLayer.js";
import { createSubdivisionMap } from "./subDivisionMap.js";
import { createMODISLegend } from "./legend.js";
import { createTimelineEvents } from "./timeline-events.js";

const subdivisions = await d3.json("data/south_america.json");
window.subdivisions = subdivisions;

const amazonCountries = new Set(["BRA","COL","PER","VEN","BOL","ECU","GUY","SUR","FRA"]);

const projection = d3.geoMercator()
    .center([-60, -15])
    .scale(975)
    .translate([360, 470]);

const filtered = {
    type: "FeatureCollection",
    features: subdivisions.features.filter(f => {
        const [lon, lat] = d3.geoCentroid(f);
        return lon > -10;
    })
};

async function init() {
    // Add MODIS layer with transformation
    addMODISLayer("#map-container", "2005-06-01");

    // Add subdivisions
    createSubdivisionMap(filtered, "#map-container", projection);

    // Add legend
    createMODISLegend("#map-container");

    // Add timeline events panel
    const { updateEvents } = createTimelineEvents("#map-container", "2005");

    // Add time slider
    createTimeSlider({
        parentSelector: "#slider-container",
        startYear: 2005,
        endYear: 2024,
        onChange: (date) => {
            const year = date.slice(0, 4);
            updateMODISLayer(date);
            updateEvents(year);
        }
    });
}

init();