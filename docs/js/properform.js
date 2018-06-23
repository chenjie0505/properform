var projectStatistics;

function loadProjectStatistics(path) {
	projectStatistics = projectStatistics || (() => {
		var ds = new DataSet();
		var dv = ds.createView();
		dv.transform({
			type: 'fold',
			fields: ['AST Diff', 'Profile Diff'],
			key: 'stat',
			value: 'count'
		});
		var chart = new G2.Chart({
			container: 'statistics',
			forceFit: true,
			height: $('#statistics').width() * 0.5
		});
		chart.source(dv, {
			timestamp: {
				alias: 'Commit time',
				type: 'time',
				mask: 'YYYY-MM-DD HH:mm:ss',
				nice: false,
				tickCount: 8
			}
		});
		chart.axis('timestamp', {
			label: {
				formatter: val => {
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

		chart.on('click', ev => {
			var items = chart.getSnapRecords(ev);
			if (items.length > 0) {
				loadDiff(path, items[0]._origin.diff);
			}
		});

		chart.render();
		return [chart, dv];
	})();
	$.getJSON(path + "/statistics.json", data => {
		projectStatistics[1].source(data);
		loadDiff(path, data[0].diff);
	});
}

var diffGraph;

function loadDiff(path, diff) {
	diffGraph = diffGraph || (() => {
		G6.registerEdge('flowingEdge', {
			afterDraw: function afterDraw(item) {
				var keyShape = item.getKeyShape();
				keyShape.attr('lineDash', [10, 10]);
				keyShape.attr('lineDashOffset', 0);
				keyShape.animate({
					lineDashOffset: -20,
					repeat: true
				}, 500);
			}
		});

		var Template = G6.Plugins['template.maxSpanningForest'];
		var Mapper = G6.Plugins['tool.d3.mapper'];
		var nodeSizeMapper = new Mapper('node', 'weight', 'size', [8, 20], {
			legendCfg: null
		});
		var edgeSizeMapper = new Mapper('edge', 'weight', 'size', [1, 8], {
			legendCfg: null
		});
		var nodeColorMapper = new Mapper('node', 'weight', 'color', ['#FF9900', '#FF9922', '#FF9955', '#FF9988', '#FF99AA', '#FF99CC', '#FF99FF'], {
			legendCfg: null
		});
		var template = new Template();
		var graph = new G6.Graph({
			id: 'diffGraph', // dom id
			height: $('#diffGraph').width() * 0.5,
			fitView: 'cc',
			plugins: [template, nodeSizeMapper, nodeColorMapper, edgeSizeMapper],
			animate: true
		});
		graph.edge({
			style: function style(model) {
				return {
					stroke: graph.find(model.target).getModel().color,
					strokeOpacity: 0.8,
					endArrow: true
				};
			}
		});

		graph.changeLayout(new G6.Layouts.Dagre({
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
		}));

		graph.on('node:click', ev => {
			loadFunctionStatistics(path, ev.item.model.md5, ev.item.model.id)
		});

		var movedPoint = [0, 0];
		(graph => {
			var lastPoint = void 0;
			graph.on('drag', ev => {
				if (lastPoint) {
					movedPoint[0] -= ev.domX - lastPoint.x;
					movedPoint[1] -= ev.domY - lastPoint.y;
					graph.translate(ev.domX - lastPoint.x, ev.domY - lastPoint.y);
				}
				lastPoint = {
					x: ev.domX,
					y: ev.domY
				};
			});
			graph.on('dragend', ev => {
				lastPoint = undefined;
			});
		})(graph);

		return [graph, movedPoint];
	})();
	$('.commitDiff').text(diff);
	$.getJSON(path + "/diff/" + diff + ".json", data => {
		diffGraph[0].translate(diffGraph[1][0], diffGraph[1][1]);
		diffGraph[0].read(data);
		diffGraph[1][0] = 0;
		diffGraph[1][1] = 0;
		loadFunctionStatistics(path, data.nodes[0].md5, data.nodes[0].id)
	});
}

var functionStatistics;

function loadFunctionStatistics(path, func, id) {
	functionStatistics = functionStatistics || (() => {
		var ds = new DataSet();
		var dv = ds.createView();
		dv.transform({
			type: 'fold',
			fields: ['AST Diff', 'Profile Diff'],
			key: 'stat',
			value: 'count'
		});
		var chart = new G2.Chart({
			container: 'transition',
			forceFit: true,
			height: $('#transition').width() * 0.5
		});
		chart.source(dv, {
			timestamp: {
				alias: 'Commit time',
				type: 'time',
				mask: 'YYYY-MM-DD HH:mm:ss',
				nice: false,
				tickCount: 8
			}
		});
		chart.axis('timestamp', {
			label: {
				formatter: val => {
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
		return [chart, dv];
	})();
	$('.funcTransition').text(id);
	$.getJSON(path + "/func/" + func + ".json", data => {
		functionStatistics[1].source(data);
	});
}
