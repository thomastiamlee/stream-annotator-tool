streamAnnotatorToolInitialize = function() {
	// Initialize the UI of the annotator tool.
	function initializeUI() {
		// Create the slider.
		target.append($("<input />")
			.attr({id: "stream-annotator-tool-slider", type: "range", min: "0", max: "100", step: "1"})
			)
	}
	
	target = $("div#stream-annotator-tool");
	// Check if there is only one target div in the page.
	if (target.length != 1) {
		console.error("Error initializing stream-annotator-tool. No unique <div> with id stream-annotator-tool found.");
		return;
	}
	initializeUI();
};