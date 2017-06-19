# Stream Annotator Tool
This is a tool written in JavaScript designed for annotating videos or other time series data (e.g. audio, code history). The tool allows the user to view the stream, and then assign labels on different time spans on the stream. It can also save the annotations as a .json file for easy processing. The stream, labels, and label colors can be customized for your needs. This may be useful for data collection tasks in several fields like empathic computing.

## Features
1. Customizable labels.
2. Callback functions allow you to perform actions when the slider is moved, so it can easily be plugged in to different applications.
3. Currently only supports single annotation at any given moment. If you put an annotation on top of another existing annotation, it will be overwritten.

## Annotation Procedure
1. You can move the slider to select the desired time.
2. Click a label to add annotation at that point.
3. Drag the arrow to adjust range of annotation.
4. Right click on an annotation to remove it.

## Images and Live Demo
![Code Annotation Screenshot](https://raw.githubusercontent.com/thomastiamlee/stream-annotator-tool/master/demo/code.PNG)

![Commercial Annotation Screenshot](https://raw.githubusercontent.com/thomastiamlee/stream-annotator-tool/master/demo/commercial.PNG)

Refer to `code.html` and `commercial.html` in the demos folder for an example application.

You can try out `code.html` (Code annotation) live in this [link](https://cdn.rawgit.com/thomastiamlee/stream-annotator-tool/94d5ef0d/demo/code.html).

## Dependencies
You must have the following referenced in order for this tool to work.
1. [JQuery 3](http://jquery.com/download/)
2. [JQuery-UI CSS](http://jqueryui.com/download/)

## Usage
1. To use, first reference `stream-annotator-tool.js` in your code.

`<script src="stream-annotator-tool.js"></script>`

2. Create a `<div>` with `id="stream-annotator-tool"`.

`<div id="stream-annotator-tool">	</div>`

3. Call the function `streamAnnotatorToolInitialize(options)` to initialize the tool.

```
streamAnnotatorToolInitialize({
	duration: 2206,
	step: 1,
	labels: [
		{labelid: 1, color: "#c8ed8e", font: "black", name: "(ENGAGED)"},
		{labelid: 2, color: "#ffeb9e", font: "black", name: "(CONFUSED)"},
		{labelid: 3, color: "#f4b29a", font: "black", name: "(FRUSTRATED)"},
		{labelid: 4, color: "#93c6ed", font: "black", name: "(BORED)"},
	],
	slidercallback: function(value) { $("video#playback").get(0).currentTime = value }
});
```

#### Options
- **duration** (required): The length of the stream
- **step** (defaults to 1 if not provided): The increment value of the slider
- **labelbackground** (defaults to "black" if not provided): The color of the background where the annotations are placed.
- **labels** (required): An array of JavaScript objects representing a label
    - Each label object has the following properties:
    - **labelid**  (required): An ID assigned to the label, used to identify it in the resulting JSON file. Must be unique.
    - **color** (required): The color assigned to the label.
    - **font** (defaults to "black" if not provided): The font color assigned to the label.
    - **name** (required): The name of the label.
- **sliderCallback** (optional): A function to be called whenever the slider is moved. Use this function to update the stream whenever the user moves the slider control.

4. To save the annotation, call the `save()` function on the `div`.

```
var tool = document.getElementById("stream-annotator-tool");
tool.save();
```

**Note: Save feature is currently only supported on Google Chrome and Opera. Use the getAnnotations() function instead for other browsers.**

5. To get the annotation as a JavaScript object, call the `getAnnotations()` function on the `div`.

```
var tool = document.getElementById("stream-annotator-tool");
tool.getAnnotations();
```

6. To remove all the annotations and start over, call the `clear()` function on the `div`.

```
var tool = document.getElementById("stream-annotator-tool");
tool.clear();
```

## Feedback and Bug Reports
For comments and bug reports, please send an email to thomasjamestiamlee@gmail.com.