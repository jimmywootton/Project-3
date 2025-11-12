import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

/**
 * createSouthAmericaMap
 * 
 * Renders a choropleth map of South America using TopoJSON and D3.
 * 
 * @param {Object[]} data - Array of { id: ISO_A3, value: number }
 * @param {String} parentSelector - CSS selector for parent element
 */
export async function createSouthAmericaMap(data, parentSelector = "#map-container") {
  // 1️⃣ Load Geo data (Natural Earth or similar TopoJSON)
  const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
  const countries = topojson.feature(world, world.objects.countries).features;

  // Filter only South America countries by ISO codes
  const southAmericaCodes = new Set([
    "032", "068", "076", "152", "170", "218", "328",
    "600", "604", "740", "858", "862",
  ]);
  const southAmerica = countries.filter(d => southAmericaCodes.has(d.id));

  // 2️⃣ Build value map
  const valuemap = new Map(data.map(d => [d.id, d.value]));

  // 3️⃣ Color scale
  const color = d3.scaleSequential()
    .domain(d3.extent(data, d => d.value))
    .interpolator(d3.interpolateYlGn);

  // 4️⃣ Projection & path
  const width = 700, height = 600;
  const projection = d3.geoMercator()
    .center([-60, -15])
    .scale(400)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath(projection);

  // 5️⃣ SVG setup
  const svg = d3.select(parentSelector)
    .append("svg")
    .attr("width", 500)
    .attr("height", 600)
    .style("background", "#eef6f9");

  // 6️⃣ Tooltip
  const tooltip = d3.select(parentSelector)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "rgba(0,0,0,0.75)")
    .style("color", "white")
    .style("border-radius", "6px")
    .style("visibility", "hidden");

  // 7️⃣ Draw map
  svg.selectAll("path")
    .data(southAmerica)
    .join("path")
    .attr("d", path)
    .attr("fill", d => color(valuemap.get(d.id) || 0))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mousemove", (event, d) => {
      tooltip.style("visibility", "visible")
        .style("top", event.pageY - 30 + "px")
        .style("left", event.pageX + 10 + "px")
        .text(`${d.properties.name}: ${valuemap.get(d.id)?.toFixed(2) ?? "N/A"}`);
    })
    .on("mouseleave", () => tooltip.style("visibility", "hidden"));

  // 8️⃣ Add legend (simple gradient)
  const legendWidth = 200, legendHeight = 10;
  const legendSvg = svg.append("g").attr("transform", "translate(50,550)");

  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient");

  linearGradient.selectAll("stop")
    .data(d3.ticks(0, 1, 10))
    .join("stop")
    .attr("offset", d => `${d * 100}%`)
    .attr("stop-color", d => color(d3.interpolate(d3.extent(data, d => d.value)[0], d3.extent(data, d => d.value)[1])(d)));

  legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  legendSvg.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .text("Value scale");

  return svg.node();
}
