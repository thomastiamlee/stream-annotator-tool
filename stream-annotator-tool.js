streamAnnotatorToolInitialize = function(options) {
	var duration = options.duration;
	var step = options.step ? options.step : 1;
	var labels = options.labels;
	var labelbackground = options.labelbackground ? options.labelbackground : "black";
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
		reevaluateAnnotations();
	}
	// Current selection
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
		return currentSelection.start != null;
	}
	function removeCurrentSelection() {
		currentSelection = {
			start: null,
			end: null,
			labelid: null,
			color: null
		}
		var arrow = $("div#stream-annotator-tool-range-arrow");
		arrow.css({visibility: "hidden"});
	}
	
	// Canvas variables
	var canvas = null;
	var context = null;
		
	// Redraw labels and arrows
	function redrawElements() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = labelbackground;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.imageSmoothingEnabled = false;
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
			var min = 2 * duration / $("canvas#stream-annotator-tool-labels").width()
			if (start < end) {
				context.fillRect(start, 0, Math.max(end - start, min), canvas.height);
			}
			else {
				context.fillRect(end, 0, Math.max(start - end, min), canvas.height);
			}
		}
	}
	
	// Check for overlapping labels and sort / re-evaluate all annotations.
	function reevaluateAnnotations() {
		var points = [];
		var rec = [];
		var col = [];
		var res = [];
		for (var i = 0; i < annotations.length; i++) {
			var a = annotations[i];
			if (points.indexOf(a.start) == -1) {
				points.push(a.start);
			}
			if (points.indexOf(a.end) == -1) {
				points.push(a.end);
			}
		}
		points.sort(function(a, b) { return a - b; });
		for (var i = 0; i < points.length - 1; i++) {
			var s = points[i];
			var e = points[i + 1];
			for (var j = annotations.length - 1; j >= 0; j--) {
				var a = annotations[j];
				if (!(a.start >= e || a.end <= s)) {
					rec[i] = a.labelid;
					col[i] = a.color;
					break;
				}
			}
		}
		for (var i = 0; i < points.length - 1; i++) {
			if (rec[i] != undefined && rec[i + 1] != undefined) {
				if (rec[i] == rec[i + 1]) {
					points[i + 1] = points[i];
					points.splice(i, 1);
					rec.splice(i, 1);
					col.splice(i, 1);
					i--;
				}
			}
		}	
		annotations = [];
		for (var i = 0; i < points.length - 1; i++) {
			if (rec[i] != undefined) {
				annotations.push({
					start: points[i],
					end: points[i + 1],
					labelid: rec[i],
					color: col[i]
				});
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
			labels[i].font = labels[i].font ? labels[i].font : "black";
			var label = labelsTarget.append($("<a></a>")
				.addClass("stream-annotator-label")
				.css({"background-color": labels[i].color, "color": labels[i].font})
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
				if (hasCurrentSelection()) {
					addAnnotationData(currentSelection.labelid, currentSelection.color, currentSelection.start, currentSelection.end);
					removeCurrentSelection();
					isSelectingRange = false;
				}
			});
			$("div#stream-annotator-tool-slider").on( "slidechange", function(value) {
				slidercallback($(this).slider("value"));
			});
		}
	}
	
	// Attach annotation events
	function attachAnnotationEvents() {
		$("a.stream-annotator-label").click(function() {
			if (hasCurrentSelection()) {
				addAnnotationData(currentSelection.labelid, currentSelection.color, currentSelection.start, currentSelection.end);
				removeCurrentSelection();
			}
			
			var labelid = $(this).find("span.stream-annotator-hidden").text();
			var currentTime = $("div#stream-annotator-tool-slider").slider("value");
			var start = currentTime;
			var end = currentTime;
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
					var real = (x - arrowWidth / 2) / $("div#stream-annotator-tool-slider").outerWidth() * duration;
					if (real < 0 || real > duration) {
						return;
					}
					var c1 = step * (Math.floor(real / step));
					if ((real - c1) < (step / 2)) {
						real = c1;
					}
					else {
						real = Math.min(duration, c1 + step);
					}
					var normalized = real / duration * $("div#stream-annotator-tool-slider").outerWidth();
					var offset = normalized + 2;
					arrow.css({left: offset + "px", visibility: "visible"});
					setSelectionRange(currentSelection.start, real);
					$("div#stream-annotator-tool-slider").slider("value", real);
					redrawElements();
				}
			});
		});
	}
	
	// Attach events for deleting existing annotations
	function attachCanvasEvents() {
		$("canvas#stream-annotator-tool-labels").on("contextmenu", function(event) {
			if (hasCurrentSelection()) {
				addAnnotationData(currentSelection.labelid, currentSelection.color, currentSelection.start, currentSelection.end);
				removeCurrentSelection();
				isSelectingRange = false;
			}
			var x = event.pageX - $("div#stream-annotator-tool-range").offset().left;
			var arrow = $("div#stream-annotator-tool-range-arrow");
			var arrowWidth = arrow.outerWidth();
			var real = (x - arrowWidth / 2) / $("div#stream-annotator-tool-slider").outerWidth() * duration;
			for (var i = annotations.length - 1; i >= 0; i--) {
				var a = annotations[i];
				if (a.start < real && a.end >= real) {
					annotations.splice(i, 1);
					redrawElements();
					break;
				}
			}
			return false;
		});
	}
	
	// Save the annotation data
	$("div#stream-annotator-tool").get(0).save = function() {
		if (hasCurrentSelection()) {
			addAnnotationData(currentSelection.labelid, currentSelection.color, currentSelection.start, currentSelection.end);
			removeCurrentSelection();
		}
		var toDownload = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(annotations));
		var dummyElement = document.createElement("a");
		dummyElement.setAttribute("href", toDownload);
		dummyElement.setAttribute("download", "result.json");
		dummyElement.click();
	}
	
	$(window).resize(function() {
		var currentTime = $("div#stream-annotator-tool-slider").slider("value");
		var arrow = $("div#stream-annotator-tool-range-arrow");
		var arrowWidth = arrow.outerWidth();
		var normalized = currentTime / duration * $("div#stream-annotator-tool-slider").outerWidth();
		// Compute position of arrow
		var offset = normalized + 2;
		arrow.css({left: offset + "px"});
	});
	
	target = $("div#stream-annotator-tool");
	// Check if there is only one target div in the page.
	if (target.length != 1) {
		console.error("Error initializing stream-annotator-tool. No unique <div> with id stream-annotator-tool found.");
		return;
	}
	initializeUI();
	attachSliderCallback();
	attachAnnotationEvents();
	attachCanvasEvents();
	redrawElements();
};