import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

export function createTimeSlider({
    parentSelector = "#slider-container",
    startYear = 2005,
    endYear = 2024,
    onChange = () => {},
}) {
    const dates = [];
    for (let y = startYear; y <= endYear; y++) {
        dates.push(`${y}-06-01`);
    }

    const width = 1000;
    const height = 80;
    const padding = 80;

    const svg = d3.select(parentSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Scale
    const xScale = d3.scaleLinear()
        .domain([0, dates.length - 1])
        .range([padding, width - padding]);

    // Slider track gradient
    svg.append("defs")
        .append("linearGradient")
        .attr("id", "slider-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#a0c4ff" },
            { offset: "50%", color: "#4dabf5" },
            { offset: "100%", color: "#1e90ff" }
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Track
    svg.append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(dates.length - 1))
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "url(#slider-gradient)")
        .attr("stroke-width", 14)
        .attr("stroke-linecap", "round");

    // Progress fill
    const progress = svg.append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "#1e90ff")
        .attr("stroke-width", 14)
        .attr("stroke-linecap", "round");

    // Axis
    const tickIndices = [];
    for (let i = 0; i < dates.length; i++) tickIndices.push(i);
    const axis = d3.axisBottom(xScale)
        .tickValues(tickIndices)
        .tickFormat(i => dates[i].slice(0, 4));

    svg.append("g")
        .attr("transform", `translate(0, ${height / 2 + 20})`)
        .call(axis)
        .selectAll("text")
        .style("font-size", "13px")
        .style("fill", "#333");

    // Handle with shadow and hover effect
    const handle = svg.append("circle")
        .attr("cx", xScale(0))
        .attr("cy", height / 2)
        .attr("r", 16)
        .attr("fill", "#fff")
        .attr("stroke", "#1e90ff")
        .attr("stroke-width", 3)
        .style("cursor", "grab")
        .style("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.2))")
        .on("mouseover", () => handle.transition().duration(100).attr("r", 20))
        .on("mouseout", () => handle.transition().duration(100).attr("r", 16));

    // Tooltip for showing year while dragging
    const tooltip = d3.select(parentSelector)
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(30, 144, 255, 0.9)")
        .style("color", "#fff")
        .style("padding", "6px 12px")
        .style("border-radius", "6px")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("transition", "opacity 0.2s");

    function showTooltip(dateStr, x, y) {
        tooltip.style("opacity", 1)
            .html(dateStr.slice(0, 4))
            .style("left", `${x}px`)
            .style("top", `${y - 40}px`);
    }

    function hideTooltip() {
        tooltip.style("opacity", 0);
    }

    // Track last committed index to avoid redundant updates
    let lastCommittedIndex = 0;

    // Drag behavior - only update visual during drag, call onChange on end
    const drag = d3.drag()
        .on("start", () => {
            handle.style("cursor", "grabbing");
        })
        .on("drag", event => {
            const rawIndex = xScale.invert(event.x);
            const clampedIndex = Math.max(0, Math.min(dates.length - 1, Math.round(rawIndex)));

            // Update visuals immediately
            handle.attr("cx", xScale(clampedIndex));
            progress.attr("x2", xScale(clampedIndex));
            
            // Show tooltip
            showTooltip(dates[clampedIndex], event.x, height / 2);
        })
        .on("end", event => {
            const rawIndex = xScale.invert(event.x);
            const clampedIndex = Math.max(0, Math.min(dates.length - 1, Math.round(rawIndex)));
            
            // Only call onChange if the date actually changed
            if (clampedIndex !== lastCommittedIndex) {
                lastCommittedIndex = clampedIndex;
                onChange(dates[clampedIndex]);
            }
            
            handle.style("cursor", "grab");
            hideTooltip();
        });

    handle.call(drag);

    // Click to move handle
    svg.on("click", event => {
        if (event.target === handle.node()) return;
        const [mouseX] = d3.pointer(event);
        const rawIndex = xScale.invert(mouseX);
        const nearestIndex = Math.max(0, Math.min(dates.length - 1, Math.round(rawIndex)));

        handle.transition().duration(250).attr("cx", xScale(nearestIndex));
        progress.transition().duration(250).attr("x2", xScale(nearestIndex));
        
        if (nearestIndex !== lastCommittedIndex) {
            lastCommittedIndex = nearestIndex;
            onChange(dates[nearestIndex]);
        }
    });

    // Programmatic control
    function setDate(dateStr) {
        const index = dates.indexOf(dateStr);
        if (index !== -1) {
            lastCommittedIndex = index;
            handle.attr("cx", xScale(index));
            progress.attr("x2", xScale(index));
            onChange(dateStr);
        }
    }

    onChange(dates[0]); // emit initial value

    return { setDate, dates };
}