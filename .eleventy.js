const filters = require('./eleventy-config/filters');
const collections = require('./eleventy-config/collections')
const { options } = require('./eleventy-config/options');
const eleventySass = require("@grimlink/eleventy-plugin-sass");
const sass = require("sass");

module.exports = function(eleventyConfig) {
	Object.keys(filters).forEach((name) => {
		eleventyConfig.addFilter(name, filters[name]);
	});

	Object.keys(collections).forEach((name) => {
		eleventyConfig.addCollection(name, collections[name]);
	});

	eleventyConfig.addPlugin(eleventySass, { 
		sass,
		outputStyle: 'compressed',
	 });

	return options;
};
