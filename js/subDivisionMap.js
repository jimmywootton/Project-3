import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * createSubdivisionMap
 *
 * Draws South America subdivisions (states/provinces)
 * on top of an existing projection.
 *
 * @param {Object} subdivisions - GeoJSON FeatureCollection
 * @param {string} selector - CSS selector for SVG container
 * @param {d3.GeoProjection} projection - existing projection (e.g. from country map)
 * @param {number} verticalSquish - scale factor for vertical compression (default: 0.85)
 */
export function createSubdivisionMap(subdivisions, selector, projection, verticalSquish = 1.01) {
    const container = document.querySelector(selector);
    const WIDTH = container.clientWidth || 600;
    const HEIGHT = container.clientHeight || 800;

    // Remove any old SVG
    d3.select(selector).select("svg.subdivisions").remove();

    const svg = d3.select(selector)
        .append("svg")
        .attr("class", "subdivisions")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0)
        .style("z-index", "3");

    console.log("Loaded subdivision features:", subdivisions.features.length);

    const path = d3.geoPath(projection);

    svg.append("g")
        .attr("transform", `translate(-5, 30) scale(1.01, ${verticalSquish})`) // Move down and squish
        .selectAll("path")
        .data(subdivisions.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#444")
        .attr("stroke-width", 1.5 / verticalSquish); // Adjust stroke width to compensate

    // Add legend for MODIS layer
    const legendWidth = 300;
    const legendHeight = 300;
    const padding = 20;

    svg.append("image")
        .attr("href", "https://gibs.earthdata.nasa.gov/legends/MODIS_Net_Photosynthesis_V.svg")
        .attr("x", WIDTH - legendWidth)
        .attr("y", HEIGHT - legendHeight)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("pointer-events", "none");
}