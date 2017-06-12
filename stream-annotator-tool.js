streamAnnotatorToolInitialize = function(options) {
	var duration = options.duration;
	var step = options.step;
	var labels = options.labels;
	var slidercallback = options.slidercallback;
	var isSelectingRange = false; // true if the user is currently dragging the range of the annotation
	// Annotation data
	var annotations = [];
	function addAnnotationData(labelid, color, start, end) {
		if (start > end) {
			var temp = start;
			start = end;
			end = temp;
		}
		annotations.push({labelid: labelid, color: color, start: start, end: end});
	}
	// current selection
	var currentSelection = {
		start: null,
		end: null,
		labelid: null,
		color: null
	}
	function setSelection(labelid, color) {
		currentSelection.labelid = labelid;
		currentSelection.color = color;
	}
	function setSelectionRange(start, end) {
		currentSelection.start = start;
		currentSelection.end = end;
	}
	function hasCurrentSelection() {
		return currentSelection.start ? true : false;
	}
	function removeCurrentSelection() {
		currentSelection = {
			start: null,
			end: null,
			labelid: null,
			color: null
		}
	}
	
	// Canvas variables
	var canvas = null;
	var context = null;
	
	// Redraw labels and arrows
	function redrawElements() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = 0; i < annotations.length; i++) {
			var annotation = annotations[i];
			context.fillStyle = annotation.color;
			context.fillRect(annotation.start, 0, annotation.end - annotation.start, canvas.height);
		}
		if (currentSelection.start != null) {
			var labelid = currentSelection.labelid;
			var start = currentSelection.start;
			var end = currentSelection.end;
			var color = currentSelection.color;
			context.fillStyle = color;
			if (start < end) {
				context.fillRect(start, 0, end - start, canvas.height);
			}
			else {
				context.fillRect(end, 0, start - end, canvas.height);
			}
		}
	}
	
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
		// Create the range control
		target.append($("<div></div>")
			.attr({id: "stream-annotator-tool-range"})
		);
		$("div#stream-annotator-tool-range").append($("<div></div>")
			.attr({id: "stream-annotator-tool-range-arrow"})
		);
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
			$("div#stream-annotator-tool-slider").on( "slidechange", function(value) {
				slidercallback($(this).slider("value"));
			});
		}
	}
	
	// attach annotation events
	function attachAnnotationEvents() {
		$("a.stream-annotator-label").click(function() {
			if (hasCurrentSelection()) {
				addAnnotationData(currentSelection.labelid, currentSelection.color, currentSelection.start, currentSelection.end);
				removeCurrentSelection();
			}
			
			var labelid = $(this).find("span.stream-annotator-hidden").text();
			var currentTime = $("div#stream-annotator-tool-slider").slider("value");
			var start = currentTime - 2;
			var end = currentTime + 2;
			var color = $(this).css("background-color");
			setSelection(labelid, color);
			setSelectionRange(start, end);
			redrawElements();
			
			var arrow = $("div#stream-annotator-tool-range-arrow");
			var arrowWidth = arrow.outerWidth();
			var normalized = currentTime / duration * $("div#stream-annotator-tool-slider").outerWidth();
			// Compute position of arrow
			var offset = normalized + 2;
			arrow.css({left: offset + "px", visibility: "visible"});
			// Add range selection events
			arrow.mousedown(function() {
				isSelectingRange = true;
			});			
			$(document).mouseup(function() {
				if (isSelectingRange) {
					isSelectingRange = false;
				}
			});
			$(document).mousemove(function(event) {
				if (isSelectingRange) {
					var x = event.pageX - $("div#stream-annotator-tool-range").offset().left;
					arrow.css({left: (x - arrowWidth / 2) + "px", visibility: "visible"});
					var real = (x - arrowWidth / 2) / $("div#stream-annotator-tool-slider").outerWidth() * duration;
					setSelectionRange(currentSelection.start, real);
					$("div#stream-annotator-tool-slider").slider("value", real);
					redrawElements();
				}
			});
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