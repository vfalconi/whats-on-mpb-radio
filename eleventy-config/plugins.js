const eleventySass = require("@grimlink/eleventy-plugin-sass");
const sass = require("sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, { sass });
};
