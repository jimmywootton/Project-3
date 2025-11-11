import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { createTimeSlider } from "./slider.js";

createTimeSlider({
    startYear: 2005,
    endYear: 2024,
    onChange: (date) => {
      console.log("Selected date:", date);
      // Later: update the MODIS image here
    }
  });