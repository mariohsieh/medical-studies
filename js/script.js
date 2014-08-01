$(document).ready(function() {
			
	// declare url and path for proxy server
	var url = "process.php?path=";
	var path = "ct2/results?term=&Search=Search&displayxml=true";

	var allData = {};	// declare empty objects to hold all data fetched
	var filteredData = {};

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
				displayChart1(data);
			}				
		});
	}

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


	//// display functions for highcharts and tables ////
	// organizes chart options, creates chart and appends to the DOM for display
	function displayChart1(info) {
		allData = info;
		console.log(allData);

		// call function to determine categories and values
		var chart1Data = chart1GetData(info);
		
		// create instance of Highcharts and render to DOM
		$("#charts").append("<div id='chart1'></div>");
		var chart1 = new Highcharts.Chart({
			chart: {
				renderTo: 'chart1'
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
								displayChart2(this.category);	
							}
						}
					}
				}
			},			
		});	
	}

	// organizes chart options, creates chart and appends to the DOM for display
	function displayChart2(str) {
		$("#chart2").remove();
		$("#table3").remove();
		
		var cat = str;
		
		var chart2Data = chart2GetData(cat);

		filteredData = chart2Data[2];
		
		console.log(chart2Data);

		// create instance of Highcharts and render to DOM
		$("#charts").append("<div id='chart2'></div>");
		var chart2 = new Highcharts.Chart({
			chart: {
				renderTo: 'chart2',
				height: 800
			},
			xAxis: {
				labels: {
					rotation: -60
				},
				categories: chart2Data[0]
			},
			series: [{
				data: chart2Data[1],
				name: 'Status'
			}],
			plotOptions: {
				series: {
					cursor: 'pointer',
					point: {
						events: {
							click: function() {
								displayTable(this.category);
								//console.log(this.category);
							}
						}
					}
				}
			},			
		});			
	}

	// outputs data for table
	function displayTable(str) {
		$("#table3").remove();
		
		var condition = str;
		
		var tableInfo = getTableData(condition);
		console.log(tableInfo);
		
		$("#charts").append("<div id='table3'></div>");
		
		var tableHeader = "<table><thead><tr>";
		tableHeader += "<th>Title</th>";
		tableHeader += "<th>URL</th>";
		tableHeader += "<th>Conditions</th>";
		tableHeader += "<th>Status</th>";
		tableHeader += "<th>Score</th>";
		tableHeader += "<th>Last Changed</th>";
		tableHeader += "</tr></thead><tbody>";
		
		var tableContent = "";
		for (data in tableInfo) { 
			tableContent += "<tr><td data-tooltip='"+tableInfo[data].title+"'>"+tableInfo[data].title.slice(0,10)+"...</td>";
			tableContent += "<td><a target='_blank' href='"+tableInfo[data].url+"'>..."+tableInfo[data].url.slice(-11)+"</td>";
			tableContent += "<td>"+tableInfo[data].condition_summary+"</td>";
			tableContent += "<td>"+tableInfo[data].status+"</td>";
			tableContent += "<td>"+tableInfo[data].score+"</td>";
			tableContent += "<td>"+tableInfo[data].last_changed+"</td></tr>";
		}
		
		tableContent += "</tr>";
		
		tableFooter = "</tbody></table>";	
		
		$("#table3").html(tableHeader+tableContent+tableFooter);
	}
	
	
	//// calculate the categores and values for charts/tables ////
	// for chart1
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

	// for chart2	
	function chart2GetData(category) {
		
		// declare empty arrays to hold categories and values
		var catNames = [],
			tempNames = [], 
			catValues = [],
			results = [];

		var items = allData.clinical_study;

		// loop through all results
		for (item in items) {	
			if (category == items[item].status) {
				results.push(items[item]);
				//console.log(items[item].condition_summary);
				var bar = items[item].condition_summary.split(";");
				for (foo in bar)
					tempNames.push(bar[foo].trim());
			}
		}
		
		
		tempNames.sort();
		console.log(tempNames);
		console.log(tempNames.length);
		
		var length = tempNames.length;
		catNames.push(tempNames[0]);
		
		for (var i=1;i<length;i++) {
			if (tempNames[i-1] != tempNames[i])
				catNames.push(tempNames[i]); 
		}
		
		console.log(catNames);
		console.log(catNames.length);

		// find all values for each categories
		for (var i=0;i<catNames.length;i++) {
			catValues[i] = 0;
			for (var j=0;j<tempNames.length;j++) {
				if (tempNames[j] == catNames[i])
					catValues[i]++;
			}
		}
		
		console.log(catValues);
		return [catNames, catValues, results];
	}
	
	// for last table
	function getTableData(str) {
		
		var data = filteredData;
		console.log(data);
		
		// create empty array to hold related studies
		var tableStudies = [];
		
		// create an array of studies with matching condition
		for (study in data) {
			var issues = data[study].condition_summary.split(";");
			for (issue in issues) {
				//console.log(issues[issue].trim());
				if (issues[issue].trim() == str) {
					//console.log(issues[issue].trim());
					tableStudies.push(data[study]);
				}
			}
		}
		
		return tableStudies;
	}
	
	
	//// event listeners ////
	$(document).on("click", "button", function() {
		$("#charts").empty();
		fetchResults();
	});
	
	$(document).on("click", ".highcharts-container", function() {
		console.log('hi');
	});
	
});
































