streamAnnotatorToolInitialize = function(options) {
	var duration = options.duration;
	var step = options.step;
	var labels = options.labels;
	var slidercallback = options.slidercallback;
	
	// Initialize the UI of the annotator tool.
	function initializeUI() {
		// Create the slider.
		target.append($("<input />")
			.attr({id: "stream-annotator-tool-slider", type: "range", min: "0", max: duration, step: step, value: 0})
			);
		// Create the canvas for labels
		target.append($("<canvas></canvas>")
			.attr({id: "stream-annotator-tool-labels", width: duration})
		);
		// Create the buttons
		target.append($("<div></div>")
			.attr({id: "stream-annotator-labels-div"})
		);
		var labelsTarget = $("div#stream-annotator-labels-div");
		
		for (var i = 0; i < labels.length; i++) {
			labelsTarget.append($("<a></a>")
				.addClass("stream-annotator-label")
				.css({"background-color": labels[i].color})
				.html(labels[i].name)
			);
		}
	}
	
	target = $("div#stream-annotator-tool");
	// Check if there is only one target div in the page.
	if (target.length != 1) {
		console.error("Error initializing stream-annotator-tool. No unique <div> with id stream-annotator-tool found.");
		return;
	}
	initializeUI();
	
	// attach callback event for slider
	if (slidercallback) {
		$("input#stream-annotator-tool-slider").on( "input", function(value) {
			slidercallback(value.currentTarget.value);
		});
	}
};