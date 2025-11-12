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
    const color = d3.scaleQuantize()
        .domain(d3.extent(data, d => d.value))
        .range(d3.schemeYlGn[5]);   

    // 5️⃣ SVG setup
    const svgWidth = 700, svgHeight = 600;
    const svg = d3.select(parentSelector)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("background", "#eef6f9");

    // --- 6️⃣ Projection & path ---
    const projection = d3.geoMercator()
        .fitSize([svgWidth, svgHeight], { type: "FeatureCollection", features: southAmerica });
    const path = d3.geoPath(projection);

    // --- 7️⃣ Tooltip ---
    const tooltip = d3.select(parentSelector)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "6px 10px")
        .style("background", "rgba(0,0,0,0.75)")
        .style("color", "white")
        .style("border-radius", "6px")
        .style("visibility", "hidden");

    // --- 8️⃣ Draw map ---
    svg.selectAll("path")
        .data(southAmerica)
        .join("path")
        .attr("d", path)
        .attr("fill", d => color(valuemap.get(d.id) || 0))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mousemove", (event, d) => {
            tooltip
            .style("visibility", "visible")
            .style("top", event.pageY - 30 + "px")
            .style("left", event.pageX + 10 + "px")
            .text(`${d.properties.name}: ${valuemap.get(d.id) ?? "N/A"}`);
        })
        .on("mouseleave", () => tooltip.style("visibility", "hidden"));

    // 9️⃣ Add legend inside SVG (bottom-right)
    const legendWidth = 120, legendHeight = 15;
    const legendX = svgWidth - legendWidth - 20;
    const legendY = svgHeight - 40;

    const legend = svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    // Draw legend rectangles for each bin
    color.range().forEach((c, i) => {
    const [binStart, binEnd] = color.invertExtent(c);
    legend
        .append("rect")
        .attr("x", i * (legendWidth / color.range().length))
        .attr("y", 0)
        .attr("width", legendWidth / color.range().length)
        .attr("height", legendHeight)
        .attr("fill", c);

    // Label start of bin
    legend.append("text")
        .attr("x", i * (legendWidth / color.range().length) + (legendWidth / color.range().length)/2)
        .attr("y", legendHeight + 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(binStart.toFixed(0));
    });

    // Legend title
    legend
        .append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Value scale");

    return svg.node();
}
