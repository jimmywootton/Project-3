// timeline-events.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Event data - you can expand this with more events
const events = {
  "2005": [
    { title: "Amazon Drought", description: "Severe drought affected the Amazon basin", icon: "🌵" }
  ],
  "2007": [
    { title: "Deforestation Peak", description: "High rates of Amazon deforestation recorded", icon: "🪓" }
  ],
  "2010": [
    { title: "Major Drought", description: "Second major drought in 5 years", icon: "☀️" }
  ],
  "2012": [
    { title: "Forest Code Reform", description: "Brazil Forest Code is significantly reformed", icon: "📜" }
  ],
  "2015": [
    { title: "El Niño", description: "Strong El Niño event caused drought conditions", icon: "🌊" }
  ],
  "2016": [
    { title: "Paris Agreement", description: "Climate agreement entered into force", icon: "🌍" }
  ],
  "2019": [
    { title: "Amazon Wildfires", description: "Numerous fires in the Amazon", icon: "🔥" }
  ],
  "2020": [
    { title: "COVID-19 Pandemic", description: "Global pandemic, reduced human activity", icon: "🦠" },
  ],
  "2021": [
    { title: "Drought Returns", description: "Severe drought in parts of Brazil", icon: "🌵" }
  ],
  "2023": [
    { title: "Record Temperatures", description: "Record temperatures recorded in the Amazon", icon: "🌡️" }
  ],
  "2024": [
    { title: "Forest Fires", description: "Most devestating forest fire season in over 2 decades", icon: "🔥" }
  ],
};

export function createTimelineEvents(parentSelector, currentYear = "2005") {
  const container = d3.select(parentSelector);
  
  // Create events panel
  const panel = container.append("div")
    .attr("id", "events-panel")
    .style("position", "absolute")
    .style("right", "-200px")
    .style("top", "20px")
    .style("width", "320px")
    .style("max-height", "500px")
    .style("background", "white")
    .style("border-radius", "12px")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
    .style("padding", "20px")
    .style("font-family", "Arial, sans-serif")
    .style("z-index", "1000")
    .style("overflow-y", "auto");

  // Header
  const header = panel.append("div")
    .style("border-bottom", "2px solid #1e90ff")
    .style("padding-bottom", "10px")
    .style("margin-bottom", "15px");

  header.append("div")
    .attr("id", "events-year")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("color", "#1e90ff")
    .text(currentYear);

  header.append("div")
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "4px")
    .text("Notable Events");

  // Events container
  const eventsContainer = panel.append("div")
    .attr("id", "events-list");

  // Function to update events display
  function updateEvents(year) {
    // Update year in header
    d3.select("#events-year").text(year);

    const yearEvents = events[year] || [];
    
    // Clear existing events
    eventsContainer.selectAll("*").remove();

    if (yearEvents.length === 0) {
      eventsContainer.append("div")
        .style("color", "#999")
        .style("font-style", "italic")
        .style("padding", "20px 0")
        .style("text-align", "center")
        .text("No major events recorded for this year");
      return;
    }

    // Add events
    const eventItems = eventsContainer.selectAll(".event-item")
      .data(yearEvents)
      .enter()
      .append("div")
      .attr("class", "event-item")
      .style("background", "#f8f9fa")
      .style("border-left", "4px solid #1e90ff")
      .style("border-radius", "6px")
      .style("padding", "12px")
      .style("margin-bottom", "12px")
      .style("transition", "transform 0.2s, box-shadow 0.2s")
      .on("mouseover", function() {
        d3.select(this)
          .style("transform", "translateX(4px)")
          .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)");
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("transform", "translateX(0)")
          .style("box-shadow", "none");
      });

    // Event icon and title
    const eventHeader = eventItems.append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "6px");

    eventHeader.append("span")
      .style("font-size", "20px")
      .style("margin-right", "8px")
      .text(d => d.icon);

    eventHeader.append("span")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .style("color", "#333")
      .text(d => d.title);

    // Event description
    eventItems.append("div")
      .style("font-size", "12px")
      .style("color", "#666")
      .style("line-height", "1.4")
      .text(d => d.description);
  }

  // Initial display
  updateEvents(currentYear);

  return { updateEvents };
}