streamAnnotatorToolInitialize = function(options) {
	var duration = options.duration;
	var step = options.step;
	var labels = options.labels;
	var slidercallback = options.slidercallback;
		
	// Annotation data
	var annotationData = {
		annotations: []
	};
	
	// Canvas variables
	var canvas = null;
	var context = null;
	
	// Initialize the UI of the annotator tool.
	function initializeUI() {
		// Create the slider.
		target.append($("<div></div>")
			.attr({id: "stream-annotator-tool-slider", type: "range", min: "0", max: duration, step: step, value: 0})
			);
		$("div#stream-annotator-tool-slider").slider({min: 0, max: duration, step: step, value: 0});
		// Create the canvas for labels
		target.append($("<canvas></canvas>")
			.attr({id: "stream-annotator-tool-labels", width: duration})
		);
		// Initialize canvas tools
		canvas = $("canvas#stream-annotator-tool-labels").get(0);
		context = canvas.getContext("2d");
		// Create the buttons
		target.append($("<div></div>")
			.attr({id: "stream-annotator-labels-div"})
		);
		var labelsTarget = $("div#stream-annotator-labels-div");
		
		for (var i = 0; i < labels.length; i++) {
			var label = labelsTarget.append($("<a></a>")
				.addClass("stream-annotator-label")
				.css({"background-color": labels[i].color})
				.html(labels[i].name)
				.append($("<span></span>")
					.addClass("stream-annotator-hidden")
					.html(labels[i].labelid)
				)
			);
		}
	}
	
	// attach callback event for slider
	function attachSliderCallback() {
		if (slidercallback) {
			$("div#stream-annotator-tool-slider").on( "slide", function(value) {
				slidercallback($(this).slider("value"));
			});
			$("div#stream-annotator-tool-slider").on( "change", function(value) {
				slidercallback($(this).slider("value"));
			});
		}
	}
	
	// attach annotation events
	function attachAnnotationEvents() {
		$("a.stream-annotator-label").click(function() {
			var labelid = $(this).find("span.stream-annotator-hidden").text();
			var currentTime = $("div#stream-annotator-tool-slider").slider("value");
			var color = $(this).css("background-color");
			
			context.fillStyle = color;
			context.fillRect(currentTime - 2, 0, 4, canvas.height);
			
		});
	}
	
	target = $("div#stream-annotator-tool");
	// Check if there is only one target div in the page.
	if (target.length != 1) {
		console.error("Error initializing stream-annotator-tool. No unique <div> with id stream-annotator-tool found.");
		return;
	}
	initializeUI();
	attachSliderCallback();
	attachAnnotationEvents();
};