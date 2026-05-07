//[Dashboard Javascript]

//Project:	Azurex Admin - Responsive Admin Template
//Primary use:   Used only for the main dashboard (index.html)


$(function () {

  'use strict';
	
	jQuery('#world-map-markers').vectorMap(
		{
			map: 'world_mill_en',
			backgroundColor: '#fff',
			borderColor: '#818181',
			borderOpacity: 0.25,
			borderWidth: 1,
			color: '#f4f3f0',
			regionStyle : {
				initial : {
				  fill : '#f18024'
				}
			  },
			markerStyle: {
			  initial: {
							r: 9,
							'fill': '#fff',
							'fill-opacity':1,
							'stroke': '#000',
							'stroke-width' : 5,
							'stroke-opacity': 0.4
						},
						},
			enableZoom: true,
			hoverColor: '#0a89c1',
			hoverOpacity: null,
			normalizeFunction: 'linear',
			scaleColors: ['#b6d6ff', '#005ace'],
			selectedColor: '#c9dfaf',
			selectedRegions: [],
			showTooltip: true,
			onRegionClick: function(element, code, region)
			{
				var message = 'You clicked "'
					+ region
					+ '" which has the code: '
					+ code.toUpperCase();

				alert(message);
			}
		});
	
	
	
	  Apex.grid = {
		  padding: {
			right: 0,
			left: 0
		  }
		}

		Apex.dataLabels = {
		  enabled: false
		}

		var randomizeArray = function (arg) {
		  var array = arg.slice();
		  var currentIndex = array.length, temporaryValue, randomIndex;

		  while (0 !== currentIndex) {

			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		  }

		  return array;
		}

		// data for the sparklines that appear below header area
		var sparklineData = [47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46];

		var spark1 = {
		  chart: {
			id: 'sparkline1',
			group: 'sparklines',
			type: 'area',
			height: 260,
			sparkline: {
			  enabled: true
			},
		  },
		  stroke: {
			curve: 'straight'
		  },
		  fill: {
			opacity: 1,
			colors: ['#dc3545']
		  },
		  series: [{
			name: 'Sales',
			data: randomizeArray(sparklineData)
		  }],
		  labels: [...Array(24).keys()].map(n => `2018-09-0${n+1}`),
		  yaxis: {
			min: 0
		  },
		  xaxis: {
			type: 'datetime',
		  },
		  colors: ['#dc3545'],

		}

		new ApexCharts(document.querySelector("#spark1"), spark1).render();
	
	
	  var optionsBar = {
		  chart: {
			type: 'bar',
			height: 250,
			width: '100%',
			stacked: true,
			foreColor: '#999'
		  },
		  plotOptions: {
			bar: {
			  dataLabels: {
				enabled: false
			  },
			  columnWidth: '75%',
			  endingShape: 'rounded'
			}
		  },
		  colors: ["#00C5A4", '#F3F2FC'],
		  series: [{
			name: "Sale",
			data: [20, 16, 24, 28, 26, 22, 15, 5, 14, 16, 22, 29, 24, 19, 15, 10, 11, 15, 19, 23],
		  }, {
			name: "Views",
			data: [20, 16, 24, 28, 26, 22, 15, 5, 14, 16, 22, 29, 24, 19, 15, 10, 11, 15, 19, 23],
		  }],
		  labels: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4],
		  xaxis: {
			axisBorder: {
			  show: false
			},
			axisTicks: {
			  show: false
			},
			crosshairs: {
			  show: false
			},
			labels: {
			  show: false,
			  style: {
				fontSize: '14px'
			  }
			},
		  },
		  grid: {
			xaxis: {
			  lines: {
				show: false
			  },
			},
			yaxis: {
			  lines: {
				show: false
			  },
			}
		  },
		  yaxis: {
			axisBorder: {
			  show: false
			},
			labels: {
			  show: false
			},
		  },
		  tooltip: {
			shared: true
		  }

		}

		var chartBar = new ApexCharts(document.querySelector('#bar'), optionsBar);
		chartBar.render();
	
	

}); // End of use strict

