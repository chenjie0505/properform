function loadProjectStatistics(path) {
	$.getJSON(path + "/statistics.json", function(data) {
		var ds = new DataSet();
		var dv = ds.createView().source(data);
		dv.transform({
			type: 'fold',
			fields: ['astDiff', 'profileDiff'], // 展开字段集
			key: 'stat', // key字段
			value: 'count' // value字段
		});
		var chart = new G2.Chart({
			container: 'statistics',
			forceFit: true,
			height: window.innerHeight
		});
		chart.source(dv, {
			timestamp: {
				alias: '时间',
				type: 'time',
				mask: 'YYYY-MM-DD HH:mm:ss',
				nice: false,
				tickCount: 8
			}
		});
		chart.axis('timestamp', {
			label: {
				formatter: function(val) {
					if (val.substring(val.length - 9) == ' 00:00:00') {
						return val.substring(0, val.length - 9);
					}
					return val;
				}
			}
		});
		chart.tooltip({
			crosshairs: {
				type: 'line'
			}
		});
		chart.line().position('timestamp*count').color('stat');
		chart.point().position('timestamp*count').color('stat').size(4).shape('circle').style({
			stroke: '#fff',
			lineWidth: 1
		});
		chart.render();
	});
	loadDiff(path);
}

function loadDiff(path, diff) {
	$.getJSON(path + "/../g6-index.json", function(data) {
		var Template = G6.Plugins['template.maxSpanningForest'];
		var Mapper = G6.Plugins['tool.d3.mapper'];
		var nodeSizeMapper = new Mapper('node', 'weight', 'size', [8, 20], {
			legendCfg: null
		});
		var edgeSizeMapper = new Mapper('edge', 'weight', 'size', [1, 8], {
			legendCfg: null
		});
		var nodeColorMapper = new Mapper('node', 'weight', 'color', ['#E0F5FF', '#BAE7FF', '#91D5FF', '#69C0FF', '#3DA0F2', '#1581E6', '#0860BF'], {
			legendCfg: null
		});
		var template = new Template();
		var graph = new G6.Graph({
			id: 'diffGraph', // dom id
			height: window.innerHeight,
			plugins: [template, nodeSizeMapper, nodeColorMapper, edgeSizeMapper],
			animate: true
		});
		var force = template.layout;
		var circle = new G6.Layouts['Circle']({
			sort: function sort(a, b) {
				return a.weight - b.weight;
			}
		});
		var grid = new G6.Layouts['Grid']({
			sort: function sort(a, b) {
				return b.weight - a.weight;
			}
		});
		var dagre = new G6.Layouts['Dagre']({
			nodesep: function nodesep() {
				return graph.getWidth() / 50;
			},
			ranksep: function ranksep() {
				return graph.getHeight() / 25;
			},
			marginx: function marginx() {
				return graph.getWidth() / 8;
			},
			marginy: function marginy() {
				return graph.getHeight() / 8;
			},

			useEdgeControlPoint: false
		});
		var spiral = new G6.Layouts['ArchimeddeanSpiral']({
			sort: function sort(a, b) {
				return b.weight - a.weight;
			}
		});
		graph.edge({
			style: function style(model) {
				return {
					stroke: graph.find(model.target).getModel().color,
					strokeOpacity: 0.8
				};
			}
		});
		graph.read(data);
		setInterval(function() {
			if (document.visibilityState === 'visible') {
				var layouts = [circle, dagre, force, grid, spiral];
				layouts = layouts.filter(function(layout) {
					return layout !== graph.getLayout();
				});
				var layout = layouts[parseInt(layouts.length * Math.random())];
				graph.changeLayout(layout);
			}
		}, 2000);
	});
}
