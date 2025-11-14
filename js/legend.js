// legend.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function createMODISLegend(parentSelector) {
  const categories = [
    { name: "No Activity", range: "0", color: [255, 255, 255] },
    { name: "0.0005 - 0.024", color: [101, 67, 33] },
    { name: "0.024 - 0.048", color: [230, 180, 100] },
    { name: "0.048 - 0.072", color: [200, 230, 100] },
    { name: "0.072 - 0.096", color: [100, 200, 100] },
    { name: "0.096 - 0.12", color: [0, 100, 0] }
  ];

  const container = d3.select(parentSelector);
  
  const legend = container.append("div")
    .attr("id", "modis-legend")
    .style("position", "absolute")
    .style("bottom", "20px")
    .style("right", "20px")
    .style("background", "white")
    .style("padding", "15px")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.2)")
    .style("font-family", "Arial, sans-serif")
    .style("z-index", "1000");

  legend.append("div")
    .style("font-weight", "bold")
    .style("margin-bottom", "5px")
    .style("font-size", "14px")
    .text("Net Photosynthesis");

  legend.append("div")
    .style("font-size", "11px")
    .style("color", "#666")
    .style("margin-bottom", "10px")
    .text("(kgC/m²)");

  const items = legend.selectAll(".legend-item")
    .data(categories)
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .style("display", "flex")
    .style("align-items", "center")
    .style("margin-bottom", "6px");

  items.append("div")
    .style("width", "20px")
    .style("height", "20px")
    .style("margin-right", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "3px")
    .style("background-color", d => `rgb(${d.color[0]}, ${d.color[1]}, ${d.color[2]})`);

  items.append("span")
    .style("font-size", "12px")
    .style("color", "#333")
    .text(d => d.name || d.range);
}