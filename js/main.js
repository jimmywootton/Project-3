import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";
import { createTimeSlider } from "./slider.js";
import { createSouthAmericaMap } from "./southAmericaMap.js";
import { addMODISLayer, updateMODISLayer } from "./modisLayer.js";

async function init() {
    // Load world TopoJSON
    const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    const countries = topojson.feature(world, world.objects.countries).features;

    // Filter South America
    const southAmericaCodes = new Set([
        "032","068","076","152","170","218","328","600","604","740","858","862"
    ]);
    const southAmerica = countries.filter(d => southAmericaCodes.has(d.id));

    // Add MODIS layer
    addMODISLayer("#map-container", "2005-01-01");

    // Add country borders
    createSouthAmericaMap(southAmerica, "#map-container");

    // Add slider
    createTimeSlider({
        parentSelector: "#slider-container",
        startYear: 2005,
        endYear: 2024,
        onChange: (date) => updateMODISLayer(date)
    });
}

init();