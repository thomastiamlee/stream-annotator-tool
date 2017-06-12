streamAnnotatorToolInitialize = function() {
	target = $("div#stream-annotator-tool");
	/* Check if there is only one target div in the page */
	if (target.size() != 1) {
		console.error("Error initializing stream-annotator-tool. No unique <div> with id stream-annotator-tool found.");
		return;
	}
};