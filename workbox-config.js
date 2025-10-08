module.exports = {
	globDirectory: "dist/",
	globPatterns: [
		"**/*.{css,js,json,ico,ttf,txt,png,jpg,svg,html}",
	],
	swDest: "dist/sw.js",
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	skipWaiting: true,
	clientsClaim: true,
};