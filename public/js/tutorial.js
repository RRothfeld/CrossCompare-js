// Set up crossfilter
var ndx = crossfilter([
	{time: "15", type: "tab"},
	{time: "16", type: "tab"},
	{time: "16", type: "visa"},
	{time: "17", type: "tab"},
	{time: "18", type: "tab"},
	{time: "18", type: "tab"},
	{time: "18", type: "cash"},
	{time: "19", type: "tab"},
	{time: "20", type: "tab"},
	{time: "20", type: "tab"},
	{time: "21", type: "cash"},
	{time: "21", type: "visa"}
]);

// Define dimensions
var time = ndx.dimension(function(d) { return d.time; }),
		type = ndx.dimension(function(d) { return d.type; });

// Define groups
var timeGroup = time.group(),
		typeGroup = type.group();

//--------------------------------DC----------------------------------------------------

// Define charts properties
var timeChart = dc.barChart('#bar-chart'),
		typeChart = dc.rowChart('#row-chart');

timeChart
.dimension(time)
.group(timeGroup)

.x(d3.scale.linear().domain([15, 22]));

typeChart
.dimension(type)
.group(typeGroup);

// OPTIONAL
timeChart.round(dc.round.floor)
var width = $('#width').width();
timeChart.width(width);
typeChart.width(width); // für CC nich nötig

// Update all charts
dc.renderAll();

//-------------------------------CC-----------------------------------------------

crosscompare
.add(timeChart)
.add(typeChart, { type: 'bar', order: 'desc' });