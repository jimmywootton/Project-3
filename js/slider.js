import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

export function createTimeSlider({
    parentSelector = "#slider-container",
    startYear = 2005,
    endYear = 2024,
    onChange = () => {},
}) {
    // 1. Generate date list (yearly for now)
    const dates = [];
    for (let y = startYear; y <= endYear; y++) {
        dates.push(`${y}-01-01`);
    }

    // 2. SVG setup
    const width = 1000;
    const height = 120;
    const padding = 80;

    const svg = d3.select(parentSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // 3. Scale
    const xScale = d3.scaleLinear()
        .domain([0, dates.length - 1])
        .range([padding, width - padding]);

    // 4. Track (background line)
    svg.append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(dates.length - 1))
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 12)
        .attr("stroke-linecap", "round");

    // 5. Progress line (fill behind handle)
    const progress = svg.append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 12)
        .attr("stroke-linecap", "round");

    // 6. Axis ticks
    const tickIndices = [];
    for (let i = 0; i < dates.length; i += 1) tickIndices.push(i);
    const axis = d3.axisBottom(xScale)
        .tickValues(tickIndices)
        .tickFormat(i => dates[i].slice(0, 4));

    svg.append("g")
        .attr("transform", `translate(0, ${height / 2 + 20})`) // push down a bit
        .call(axis)
        .selectAll("text")
        .style("font-size", "14px")
        .style("fill", "#333");

    // 7. Handle
    const handle = svg.append("circle")
        .attr("cx", xScale(0))
        .attr("cy", height / 2)
        .attr("r", 15)
        .attr("fill", "steelblue")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", "grab")
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");

    // 8. Drag behavior
    const drag = d3.drag()
        .on("drag", event => {
            const rawIndex = xScale.invert(event.x);
            const clampedIndex = Math.max(0, Math.min(dates.length - 1, Math.round(rawIndex)));

            handle.attr("cx", xScale(clampedIndex));
            progress.attr("x2", xScale(clampedIndex));
            onChange(dates[clampedIndex]);
        });
    handle.call(drag);

    // 9. Click behavior
    svg.on("click", event => {
        if (event.target === handle.node()) return;
        const [mouseX] = d3.pointer(event);
        const rawIndex = xScale.invert(mouseX);
        const nearestIndex = Math.max(0, Math.min(dates.length - 1, Math.round(rawIndex)));

        handle.transition().duration(200).attr("cx", xScale(nearestIndex));
        progress.transition().duration(200).attr("x2", xScale(nearestIndex));
        onChange(dates[nearestIndex]);
    });

    // 10. Programmatic control
    function setDate(dateStr) {
        const index = dates.indexOf(dateStr);
        if (index !== -1) {
            handle.attr("cx", xScale(index));
            progress.attr("x2", xScale(index));
            onChange(dateStr);
        }
    }

    onChange(dates[0]); // initial value

    return { setDate, dates };
}
