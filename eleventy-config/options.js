module.exports.options = {
	markdownTemplateEngine: 'md',
	htmlTemplateEngine: 'njk',
	dataTemplateEngine: 'njk',
	templateFormats: [ 'html', 'md', 'txt' ],
	dir: {
		input: 'src/templates',
		data: '_data',
		includes: '_partials',
		output: 'build',
	},
};
