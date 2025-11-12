import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * createSouthAmericaMap
 *
 * Draws a simple D3 map of South America country outlines.
 * 
 * This function takes pre-filtered South America GeoJSON features and renders
 * their borders inside an SVG element. It is useful for overlaying vector
 * boundaries on top of raster layers (e.g., MODIS imagery).
 *
 * @param {Object[]} southAmerica - Array of GeoJSON Feature objects representing South American countries.
 * @param {string} selector - CSS selector of the container where the SVG map should be appended.
 **/

export function createSouthAmericaMap(southAmerica, selector) {
    const width = 0, height = 1000;
  
    const projection = d3.geoMercator()
      .fitSize([width, height], { type: "FeatureCollection", features: southAmerica });
  
    const path = d3.geoPath(projection);
  
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("position", "relative")
        .style("z-index", "2");
  
    // Country borders only
    svg.selectAll("path")
      .data(southAmerica)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.7);
}
  