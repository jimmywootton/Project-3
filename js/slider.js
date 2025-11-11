import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

/**
 * createTimeSlider
 * Renders a time slider with monthly resolution between startYear and endYear.
 *
 * @param {Object} config
 * @param {String} config.parentSelector - container to place the slider into
 * @param {Number} config.startYear - first year in the timeline
 * @param {Number} config.endYear - last year in the timeline
 * @param {Function} config.onChange - callback when slider value changes: (dateString) => {}
 */
export function createTimeSlider({
    parentSelector = "#slider-container",
    startYear = 2005,
    endYear = 2024,
    onChange = () => {},
    }) {
    // ---- 1. Generate date list (YYYY-MM-01 for each month) ----
    const dates = [];
    for (let y = startYear; y <= endYear; y++) {
        dates.push(`${y}-01-01`);
    }
    // ---- 2. Basic SVG setup ----
    const width = 1000;
    const height = 80;
  
    const svg = d3
        .select(parentSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
  
    const padding = 50;
  
    // ---- 3. X scale (index → pixel) ----
    const xScale = d3
        .scaleLinear()
        .domain([0, dates.length - 1])
        .range([padding, width - padding]);
  
    // ---- 4. Axis (one tick per year) ----
    const tickIndices = [];
    for (let i = 0; i < dates.length; i += 4) {
        tickIndices.push(i);
    }
    if (!tickIndices.includes(dates.length - 1)) tickIndices.push(dates.length - 1);
    const axis = d3.axisBottom(xScale)
    .tickValues(tickIndices)
    .tickFormat(i => dates[i].slice(0, 4));
  
    svg
        .append("g")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(axis);

    // ---- 5. Drag handle ----
    const handle = svg
        .append("circle")
        .attr("cx", xScale(0))
        .attr("cy", height / 2)
        .attr("r", 8)
        .attr("fill", "steelblue")
        .style("cursor", "grab");
  
    // ---- 6. Drag behavior ----
    const drag = d3
        .drag()
        .on("drag", (event) => {
        // Convert pixel → index
            const rawIndex = xScale.invert(event.x);
            const clampedIndex = Math.max(0, Math.min(dates.length - 1, Math.round(rawIndex)));

            handle.attr("cx", xScale(clampedIndex));
            onChange(dates[clampedIndex]);
        });
    handle.call(drag);
  
    // ---- 7. Programmatic controls ----
    function setDate(dateStr) {
        const index = dates.indexOf(dateStr);
        if (index !== -1) {
            handle.attr("cx", xScale(index));
            onChange(dateStr);
      }
    }
    // ---- 8. Click behavior ----
    svg.on("click", (event) => {
        // Ignore clicks on the handle itself (handled by drag)
        if (event.target === handle.node()) return;
    
        const [mouseX] = d3.pointer(event);               // get x-coordinate
        const rawIndex = xScale.invert(mouseX);           // convert pixel → index
        const nearestIndex = Math.max(0, Math.min(dates.length - 1, Math.round(rawIndex)));
        handle.transition().duration(200).attr("cx", xScale(nearestIndex));
        onChange(dates[nearestIndex]);
    });
  
    // Emit initial value
    onChange(dates[0]);

    return {
        setDate,
        dates,
    };
}