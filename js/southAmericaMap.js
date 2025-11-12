import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * createSouthAmericaMap
 *
 * Draws South America country outlines over a raster (MODIS) layer.
 * The projection is aligned to match the MODIS bounding box exactly.
 *
 * @param {Object[]} southAmerica - Array of GeoJSON Feature objects (countries)
 * @param {string} selector - CSS selector of container for the SVG
 */

export function createSouthAmericaMap(southAmerica, selector) {
    const container = document.querySelector(selector);

    // Match the MODIS image size
    const WIDTH = container.clientWidth || 600;
    const HEIGHT = container.clientHeight || 800;

    // MODIS bounding box (must match modisLayer.js)
    const south = -47;
    const west = -81.4;
    const north = 13;
    const east = -34;

    // Center of bounding box
    const centerLon = (west + east) / 2;  // -55.5
    const centerLat = (south + north) / 2; // -22

    // Projection aligned with MODIS
    const projection = d3.geoMercator()
        .center([centerLon, centerLat])
        .scale(WIDTH*1.3)       // tweak scale to match MODIS aspect
        .translate([WIDTH / 2, HEIGHT / 2]);

    const path = d3.geoPath(projection);

    // Remove any existing SVG
    d3.select(selector).select("svg").remove();

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0)
        .style("z-index", "2"); // draw above MODIS

    // 👇 Clip a little bit off the bottom (e.g. 5%)
    // const CLIP_BOTTOM = HEIGHT * 0.95; // keeps the top 95%
    // svg.append("clipPath")
    //     .attr("id", "bottom-clip")
    //     .append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", WIDTH)
    //     .attr("height", CLIP_BOTTOM);
    // Draw country borders with vertical flattening
    svg.append("g")
        .attr("transform", "translate(20, 62.5) scale(0.95, 0.85)") // flatten vertically; adjust as needed
        .selectAll("path")
        .data(southAmerica)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 5);
}
