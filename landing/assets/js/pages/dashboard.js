//[Dashboard Javascript]

//Project:	Azurex Admin - Responsive Admin Template
//Primary use:   Used only for the main dashboard (index.html)


$(function () {

  'use strict';
	
	$('.bandwidth').sparkline(
	  [32,24,26,24,32,26,40,34,22,24,32,24,26,24,32,26,40,34,22,24],
	  {
		type: 'bar',
		width: '100%',
		height: '129',
		barWidth: '2',
		resize: true,
		barSpacing: '6',
		barColor: 'rgba(255, 255, 255, 0.3)'
	  }
	);
	
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

	// the default colorPalette for this dashboard
	//var colorPalette = ['#01BFD6', '#5564BE', '#F7A600', '#EDCD24', '#F74F58'];
	var colorPalette = ['#00D8B6','#008FFB',  '#FEB019', '#FF4560', '#775DD0']

	var spark1 = {
	  chart: {
		id: 'sparkline1',
		group: 'sparklines',
		type: 'area',
		height: 160,
		sparkline: {
		  enabled: true
		},
	  },
	  stroke: {
		curve: 'straight'
	  },
	  fill: {
		opacity: 1,
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
	  colors: ['#28a745'],
	  title: {
		text: '$424,652',
		offsetX: 0,
		style: {
		  fontSize: '24px',
		  cssClass: 'apexcharts-yaxis-title'
		}
	  },
	  subtitle: {
		text: 'Sales',
		offsetX: 0,
		style: {
		  fontSize: '14px',
		  cssClass: 'apexcharts-yaxis-title'
		}
	  }
	}

	var spark2 = {
	  chart: {
		id: 'sparkline2',
		group: 'sparklines',
		type: 'area',
		height: 160,
		sparkline: {
		  enabled: true
		},
	  },
	  stroke: {
		curve: 'straight'
	  },
	  fill: {
		opacity: 1,
	  },
	  series: [{
		name: 'Expenses',
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
	  title: {
		text: '$235,312',
		offsetX: 0,
		style: {
		  fontSize: '24px',
		  cssClass: 'apexcharts-yaxis-title'
		}
	  },
	  subtitle: {
		text: 'Expenses',
		offsetX: 0,
		style: {
		  fontSize: '14px',
		  cssClass: 'apexcharts-yaxis-title'
		}
	  }
	}

	var spark3 = {
	  chart: {
		id: 'sparkline3',
		group: 'sparklines',
		type: 'area',
		height: 160,
		sparkline: {
		  enabled: true
		},
	  },
	  stroke: {
		curve: 'straight'
	  },
	  fill: {
		opacity: 1,
	  },
	  series: [{
		name: 'Profits',
		data: randomizeArray(sparklineData)
	  }],
	  labels: [...Array(24).keys()].map(n => `2018-09-0${n+1}`),
	  xaxis: {
		type: 'datetime',
	  },
	  yaxis: {
		min: 0
	  },
	  colors: ['#17a2b8'],
	  //colors: ['#5564BE'],
	  title: {
		text: '$135,965',
		offsetX: 0,
		style: {
		  fontSize: '24px',
		  cssClass: 'apexcharts-yaxis-title'
		}
	  },
	  subtitle: {
		text: 'Profits',
		offsetX: 0,
		style: {
		  fontSize: '14px',
		  cssClass: 'apexcharts-yaxis-title'
		}
	  }
	}
	
	new ApexCharts(document.querySelector("#spark1"), spark1).render();
	new ApexCharts(document.querySelector("#spark2"), spark2).render();
	new ApexCharts(document.querySelector("#spark3"), spark3).render();
	
	 if ($('#online-revenue-chart').length) {
      var onlineRevenueCanvas = $("#online-revenue-chart").get(0).getContext("2d");

      var gradient1 = onlineRevenueCanvas.createLinearGradient(0, 0, 0, 300);
      gradient1.addColorStop(0, 'rgba(5, 541, 186, .2)');
      gradient1.addColorStop(1, 'rgba(255,255,255,.2)');
      var gradient2 = onlineRevenueCanvas.createLinearGradient(0, 0, 0, 500);
      gradient2.addColorStop(0, '#ffe7d3');
      gradient2.addColorStop(1, 'rgba(255,255,255,0)');

      var data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        datasets: [
          {
            label: 'Offline',
            data: [500, 550, 620, 510 , 640, 740, 710, 820],
            borderColor: [
              '#17a2b8'
            ],
            borderWidth: 4,
            fill: true,
            backgroundColor: gradient1
          },
          {
            label: 'Online',
            data: [500, 790, 590, 900, 820 , 1140, 780, 890],
            borderColor: [
              '#f18024'
            ],
            borderWidth: 4,
            fill: true,
            backgroundColor: gradient2
          }

        ]
      };
      var options = {
        scales: {
          yAxes: [{
            display: true,
            gridLines: {
              drawBorder: false,
              lineWidth: 1,
              color: "#f1f3f9",
              zeroLineColor: "#f1f3f9",
            },
            ticks: {
              min: 200,
              max: 1200,
              stepSize: 200,
              fontColor: "#979797",
              fontSize: 11,
              fontStyle: 400,
              padding: 15
            }
          }],
          xAxes: [{
            display: true,
            gridLines: {
              display: false,
              drawBorder: false,
              lineWidth: 1,
              color: "#e9e9e9",
            },
            ticks : {
              fontColor: "#979797",
              fontSize: 11,
              fontStyle: 400,
              padding: 15,
            }
          }]
        },
        legend: {
          display: false
        },
        legendCallback : function(chart) {
          var text = [];
          text.push('<div class="d-flex align-items-center">');
            text.push('<small class="text-muted">Online</small>');
            text.push('<div class="ml-3" style="width: 12px; height: 12px; background-color: ' + chart.data.datasets[0].borderColor[0] +' "></div>');
          text.push('</div>');
          text.push('<div class="d-flex align-items-center mt-2">');
            text.push('<small class="text-muted">Offline</small>');
            text.push('<div class="ml-3" style="width: 12px; height: 12px; background-color: ' + chart.data.datasets[1].borderColor[0] +' "></div>');
          text.push('</div>');
          return text.join('');
        },
        elements: {
          point: {
            radius: 2,
          },
          line :{
            tension: .35
          }
        },
        stepsize: 1,
        layout : {
          padding : {
            top: 30,
            bottom : 0,
            left : 0,
            right: 0
          }
        }
      };
      var onlineRevenue = new Chart(onlineRevenueCanvas, {
        type: 'line',
        data: data,
        options: options
      });
      document.getElementById('online-revenue-legend').innerHTML = onlineRevenue.generateLegend();
    }
	
	
	
	
		/*********** REAL TIME UPDATES **************/

    var data = [], totalPoints = 50;

    function getRandomData() {
      if (data.length > 0)
      data = data.slice(1);
      while (data.length < totalPoints) {
        var prev = data.length > 0 ? data[data.length - 1] : 50,
        y = prev + Math.random() * 10 - 5;
        if (y < 0) {
          y = 0;
        } else if (y > 100) {
          y = 100;
        }
        data.push(y);
      }
      var res = [];
      for (var i = 0; i < data.length; ++i) {
        res.push([i, data[i]])
      }
      return res;
    }


    // Set up the control widget
	 var updateInterval = 1000;

    var plot5 = $.plot('#flotRealtime2', [ getRandomData() ], {
      colors: ['#17a2b8'],
		  series: {
        lines: {
          show: true,
          lineWidth: 0,
          fill: 0.9
        },
        shadowSize: 0	// Drawing is faster without shadows
		  },
      grid: {
        borderColor: '#ddd',
        borderWidth: 1,
        labelMargin: 5
		  },
      xaxis: {
        color: '#eee',
        font: {
          size: 10,
          color: '#999'
        }
      },
		  yaxis: {
				min: 0,
				max: 100,
        color: '#eee',
        font: {
          size: 10,
          color: '#999'
        }
		  }
	 });
   function update_plot5() {
		  plot5.setData([getRandomData()]);
		  plot5.draw();
		  setTimeout(update_plot5, updateInterval);
	 }
   update_plot5();

	
	
	// Initialize module
// ------------------------------

// When content loaded
document.addEventListener('DOMContentLoaded', function() {
    Widgetschart.init();
});
	
	

	
	//sparkline
		$("#barchart4").sparkline([32,24,26,24,32,26,40,34,22,24], {
			type: 'bar',
			height: '50',
			width: '80%',
			barWidth: 5,
			barSpacing: 4,
			barColor: '#17a2b8',
		});
	

	
	
	
	
		



}); // End of use strict

