// modisLayer.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const GIBS_URL = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const LAYER = "MODIS_Aqua_L4_Net_Photosynthesis_8Day";
const DEFAULT_BBOX = "-41,-81.4,13,-34";
const WIDTH = 800;
const HEIGHT = 1000;

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

/**
 * Transform continuous MODIS colors to discrete categories
 */
function transformToCategories(imageData) {
  const data = imageData.data;
  
  // Define discrete color categories
  const categories = [
    { name: "Very Low", threshold: 60, color: [101, 67, 33] },     // Brown
    { name: "Low", threshold: 120, color: [230, 180, 100] },       // Tan
    { name: "Medium", threshold: 180, color: [200, 230, 100] },    // Yellow-Green
    { name: "High", threshold: 220, color: [100, 200, 100] },      // Light Green
    { name: "Very High", threshold: 256, color: [0, 100, 0] }      // Dark Green
  ];
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Skip transparent/no-data pixels
    if (a === 0 || (r === 0 && g === 0 && b === 0)) continue;
    
    // Use green channel as proxy for productivity
    const value = g;
    
    // Find appropriate category
    let newColor = categories[0].color;
    for (const cat of categories) {
      if (value < cat.threshold) {
        newColor = cat.color;
        break;
      }
    }
    
    data[i] = newColor[0];
    data[i + 1] = newColor[1];
    data[i + 2] = newColor[2];
  }
  
  return imageData;
}

/**
 * Process image through canvas
 */
function processImageOnCanvas(imgElement) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    try {
      ctx.drawImage(imgElement, 0, 0, WIDTH, HEIGHT);
      const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      const transformed = transformToCategories(imageData);
      ctx.putImageData(transformed, 0, 0);
      resolve(canvas.toDataURL());
    } catch (err) {
      reject(err);
    }
  });
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

  loadAndDisplayImage(dateStr);
}

export function updateMODISLayer(dateStr) {
  loadAndDisplayImage(dateStr);
}

function loadAndDisplayImage(dateStr) {
  const url = buildWMSUrl(dateStr);
  const img = d3.select("#modis-image");
  
  // Always apply transformation
  const tempImg = new Image();
  tempImg.crossOrigin = "anonymous";
  
  tempImg.onload = async function() {
    try {
      const dataUrl = await processImageOnCanvas(tempImg);
      img.attr("src", dataUrl);
    } catch (err) {
      console.error("Error processing image:", err);
      // Fallback to original
      img.attr("src", url);
    }
  };
  
  tempImg.onerror = function() {
    console.error("Error loading image, displaying original");
    img.attr("src", url);
  };
  
  tempImg.src = url;
}

export function setMODISBBox(bbox) {
  DEFAULT_BBOX = bbox;
}