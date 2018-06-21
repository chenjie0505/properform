function loadProjectStatistics(path) {
	$.getJSON(path + "/statistics.json", data => {
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
			height: $('#statistics').width() * 0.5
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
		loadDiff(path, data[0].diff);
	});
}

function loadDiff(path, diff) {
	$.getJSON(path + "/../g6-index.json", data => {
		var graph = new G6.Graph({
			id: 'diffGraph', // dom id
			height: $('#diffGraph').width() * 0.5,
			plugins: [new G6.Plugins['template.maxSpanningForest']()],
			animate: true
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

		(graph => {
			var lastPoint = void 0;
			graph.on('drag', ev => {
				if (lastPoint) {
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
	});
}
