$(document).ready(function() {
			
	// declare url and path for proxy server
	var url = "http://localhost/projects/zephyr-health/process.php?path=";
	var path = "ct2/results?term=&Search=Search&displayxml=true";

	//// set global values for highcharts ////
	Highcharts.setOptions({
		chart: {
			type: 'column'
		},
		title: {
			text: 'Status Chart'
		},
		subtitle: {
			text: 'Source: clinicaltrials.gov'
		},
		yAxis: {
			min: 0,
			title: {
				text: '# of Studies'
			}
		},
		xAxis: {
			//categories: arr[0],
			title: {
				text: null
			}
		},
		legend: {
			layout: 'vertical',
			align: 'center',
			verticalAlign: 'bottom',
			x: 0,
			y: 0,
			floating: false,
			borderWidth: 1
		}
	});

	//// helper functions ////
	function fetchResults() {
		var searchTopic = $("#searchTopic").val().trim();
		
		// if user inputs search items
		if (searchTopic != '') {
			searchTopic = searchTopic.split(" ").join("+");
			path = "ct2/results?term="+searchTopic+"&Search=Search&displayxml=true";
		}
					
		// if user inputs results number
		var resultsCount = $("#resultsCount").val().trim();
		if (resultsCount != '') {
			resultsCount = "&count="+resultsCount.toString();
			path += path+resultsCount;
		}

		//console.log(path);
		
		$.ajax({
			dataType: "json",
			url: url+encodeURIComponent(path),
			error: function() {
				console.log("Error in accessing studies.");
			},
			success: function(data) {
				displayStudies(data);
			}				
		});
	}

	// organizes chart options, creates chart and appends to the DOM for display
	function displayStudies(info) {
		console.log(info);

		// call function to determine categories and values
		var chart1Data = chart1GetData(info);
		
		// call function to set options for new chart
		//var opts = createChart(chartData);
		var chart1 = new Highcharts.Chart({
			chart: {
				renderTo: 'charts'
			},
			xAxis: {
				categories: chart1Data[0]
			},
			series: [{
				data: chart1Data[1],
				name: 'Status'
			}],
			plotOptions: {
				series: {
					cursor: 'pointer',
					point: {
						events: {
							click: function() {
								chart2GetData(this.category);
							}
						}
					}
				}
			},			
		});
	}

	// find the categories for X-axis and respective values for first chart
	function chart1GetData(info) {
		// create empty arrays to hold category & value
		var catNames = [];
		var catValues = [];
		
		var items = info.clinical_study;

		// find all the categories from results
		for (item in items) {
			//console.log(items[item].status);
			
			if (catNames.length != 0) {
				for (var i=0;i<catNames.length;i++) {
					if (items[item].status == catNames[i])
						break;
					else if (i == catNames.length-1)
						catNames.push(items[item].status);
				}
			} else
				catNames.push(items[item].status);
		}
		
		// find all values for each categories
		for (var i=0;i<catNames.length;i++) {
			catValues[i] = 0;
			for (item in items) {
				if (items[item].status == catNames[i])
					catValues[i]++;
			}
		}
		
		return [catNames,catValues];		
	}
	
	function chart2GetData(category) {
		console.log(category);
	}
	
	//// event listeners ////
	$(document).on("click", "button", function() {
		fetchResults();
	});
	
	$(document).on("click", ".highcharts-container", function() {
		console.log('hi');
	});
	
});
































