// modisLayer.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * NASA GIBS WMS endpoint and layer configuration
 */
const GIBS_URL = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const LAYER = "MODIS_Aqua_L4_Net_Photosynthesis_8Day";

/**
 * Default bounding box covering the Amazon (south, west, north, east)
 * Adjust as needed: lat/lon in EPSG:4326
 */

const DEFAULT_BBOX = "-41,-81.4,13,-34";

/**
 * Default image resolution
 */
const WIDTH = 800;
const HEIGHT = 1000;

/**
 * Build the WMS URL for a given date and bounding box
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} bbox - bounding box string "south,west,north,east"
 */
function buildWMSUrl(dateStr, bbox = DEFAULT_BBOX) {
  const params = new URLSearchParams({
      service: "WMS",
      version: "1.3.0",
      request: "GetMap",
      layers: LAYER,
      styles: "",
      format: "image/png",
      transparent: "true",
      crs: "EPSG:4326",
      bbox: bbox,
      width: WIDTH,
      height: HEIGHT,
      time: dateStr
  });
  return `${GIBS_URL}?${params.toString()}`;
}

export function addMODISLayer(parentSelector, dateStr = "2020-01-01") {
  const container = d3.select(parentSelector);
  let img = container.select("#modis-image");

  if (img.empty()) {
      img = container.append("img")
          .attr("id", "modis-image")
          .style("position", "absolute")
          .style("top", "0")
          .style("left", "0")
          .style("width", `${WIDTH}px`)
          .style("height", `${HEIGHT}px`)
          .style("z-index", "0")
          .style("opacity", "1");
  }

  img.attr("src", buildWMSUrl(dateStr));
}

export function updateMODISLayer(dateStr) {
  d3.select("#modis-image").attr("src", buildWMSUrl(dateStr));
}

export function setMODISBBox(bbox) {
  DEFAULT_BBOX = bbox;
}
