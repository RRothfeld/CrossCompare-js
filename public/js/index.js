// Common chart properties
var options = { 
  padding: { top: 0, right: 0, bottom: -10, left: 0 },
  axis: { x: { show: false } },
  legend: { show: false },
  color: { pattern: ['#B1D4E7'] },
  tooltip: { show: false }
};

// Generate first chart
var first = c3.generate($.extend({
  bindto: '#first',
  data: { json: { data: [13, 15, 14] }, type: 'bar' },
  bar: { width: { ratio: 0.95 } },
}, options));

// Generate second chart
var second = c3.generate($.extend({
	bindto: '#second',
	data: { json: { data: [9, 10, 9, 11, 12] }, type: 'area' },
}, options));

// Generate third chart
var third = c3.generate($.extend({
	bindto: '#third',
		data: { json: {	data1: [25], data2: [20], data3: [75] }, type : 'pie' },
	pie: { label: { show: false }, expand: false },
}, options));