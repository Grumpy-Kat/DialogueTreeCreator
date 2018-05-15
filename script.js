var objSelected = {key: "-1", category: "", __gohashid: -1 };
var $ = go.GraphObject.make;
var tree;

window.onload = function(){
	tree = $(go.Diagram, "graph", {
		"undoManager.isEnabled": true
	});
	var textNode = $(
		go.Node,
		"Table",
		new go.Binding("location", "loc"),
		$(go.Shape, "RoundedRectangle", {width: 125, height: 125, fill: "#00CCEE", portId: "", fromLinkable: true, toLinkable: true}),
		$(
			go.Panel,
			"Table",
			{defaultAlignment: go.Spot.Center},
			$(go.TextBlock, {row: 0, column: 0, editable: true, textAlign: "center"}, new go.Binding("text", "character")),
			$(go.TextBlock, {row: 1, column: 0, editable: true, textAlign: "center"}, new go.Binding("text", "dialogue"))
		)
	);
	var commandNode = $(
		go.Node,
		"Table",
		new go.Binding("location", "loc"),
		$(go.Shape, "RoundedRectangle", {width: 125, height: 125, fill: "#00FFCC", portId: "", fromLinkable: true, toLinkable: true}),
		$(
			go.Panel,
			"Table",
			{defaultAlignment: go.Spot.Center},
			$(go.TextBlock, {row: 0, column: 0, editable: true, textAlign: "center"}, new go.Binding("text", "commandName")),
			$(go.TextBlock, {row: 1, column: 0, editable: true, textAlign: "center"}, new go.Binding("text", "arguments"))
		)
	);
	var template = new go.Map("string", go.Node);
	template.add("text", textNode);
	template.add("command", commandNode);
	template.add("", textNode);
	tree.nodeTemplateMap = template;
	tree.linkTemplate = $(
		go.Link,
		{relinkableFrom: true, relinkableTo: true, routing: go.Link.Orthogonal},
		$(go.Shape, {strokeWidth: 3, stroke: "#555"})
	);
	tree.addDiagramListener("ObjectSingleClicked", function(e){
		var obj = e.subject.part.data;
		if(!(obj instanceof go.Link)){
			document.getElementById("category").value = obj.category;
			objSelected = obj;
		}
	});
	var nodeDataArray = [
		{key: "0", character: "One", dialogue: "Hello!", loc: new go.Point(100,100), category: "text"},
		{key: "1", character: "One", dialogue: "How are you?", loc: new go.Point(250, 100), category: "text"},
		{key: "2", character: "Two", dialogue: "Good!", loc: new go.Point(400, 25), category: "text"},
		{key: "3", character: "Two", dialogue: "Ugh.", loc: new go.Point(400, 175), category: "text"},
		{key: "4", character: "One", dialogue: "That's good!", loc: new go.Point(550, 25), category: "text"},
		{key: "5", commandName: "Relationship", arguments: "Clarke|Bellamy|15", loc: new go.Point(700, 25), category: "command"},
		{key: "6", character: "One", dialogue: "Oh, why?", loc: new go.Point(550, 175), category: "text"},
		{key: "7", commandName: "Scene", arguments: "dialogue1", loc: new go.Point(850, 100), category: "command"}
	];
	var linkDataArray = [
		{from: "0", to: "1"},
		{from: "1", to: "2"},
		{from: "1", to: "3"},
		{from: "2", to: "4"},
		{from: "3", to: "6"},
		{from: "4", to: "5"},
		{from: "5", to: "7"},
		{from: "6", to: "7"}
	];
	tree.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
	tree.toolManager.clickCreatingTool.archetypeNodeData = {key: tree.model.nodeDataArray.length.toString(), character: "", dialogue: " "};
	tree.toolManager.textEditingTool.isEnabled = true;
}

function editCategory(value){
	if(objSelected.key != "-1" && objSelected.__gohashid != -1){
		var model = tree.model;
		model.startTransaction("editCategory");
		model.setDataProperty(objSelected, "category", value);
		switch(value){
			case "command":
				model.setDataProperty(objSelected, "commandName", "Command Name");
				model.setDataProperty(objSelected, "arguments", "Arguments\n(separated by |)");
				break;
			case "text":
			default:
				model.setDataProperty(objSelected, "character", "Character Name");
				model.setDataProperty(objSelected, "dialogue", "Character's Dialogue");
				break;
		}
		model.commitTransaction("editCategory");
	}
}

function saveModel(){
	var fileName = prompt("File Name:") + ".json";
	var text = tree.model.toJson();
	console.log(text);
	var file = new Blob([text], {type: 'application/json'});
	var downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(file);
	downloadLink.download = fileName;
	downloadLink.innerHTML = "Download";
	document.getElementById("body").appendChild(downloadLink);
	downloadLink.style.display = "none";
	downloadLink.click();
	document.getElementById("body").removeChild(downloadLink);
}

function loadModel(){
	var element = document.createElement('div');
	element.innerHTML = '<input type="file">';
	var fileInput = element.firstChild;
	fileInput.addEventListener('change', function(){
		var file = fileInput.files[0];
		var reader = new FileReader();
		reader.onload = function(e){
			tree.model = go.Model.fromJson(reader.result);
		}
		reader.readAsText(file, 'application/json');
	});
	fileInput.click();
}

function newModel(){
	if(prompt("Would you like to save?").toUpperCase().startsWith("Y")){
		saveModel();
	}
	location.reload();
}