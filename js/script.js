$(document).ready(function() {
			
	var allData = {};	// declare empty objects to hold all data fetched
	var filteredData = {};

	var sortType = '';	// variable for sort type

	//// helper functions ////
	function fetchResults() {
		// declare url and path for proxy server
		var url = "process.php?path=";		
		var path = "ct2/results?term=&Search=Search&displayxml=true";
		var searchTopic = $("#searchTopic").val().trim();
		
		// if user inputs search items
		if (searchTopic != '') {
			//searchTopic = searchTopic.split(" ").join("+");
			searchTopic = searchTopic.split(" ");
			
			var filteredSearch = [];
			for (topic in searchTopic) {
				if (searchTopic[topic] != '')
					filteredSearch.push(searchTopic[topic]);
			}
			
			console.log(filteredSearch);
			
			// clear multiple whitespaces between words

			path = "ct2/results?term="+filteredSearch.join("+")+"&Search=Search&displayxml=true";
		}
					
		// if user inputs results number
		var resultsCount = parseInt($("#resultsCount").val().trim());	
		if (typeof resultsCount === 'NaN' || resultsCount < 0) {
			resultsCount = 20;	
		} else {
			if (resultsCount > 100)
				resultsCount = 100;
		}
			
		//console.log(resultsCount);
		resultsCount = "&count="+resultsCount.toString();
		path += resultsCount;
		//console.log(path);
		
		$.ajax({
			dataType: "json",
			url: url+encodeURIComponent(path),
			error: function() {
				console.log("Error in accessing studies.");
				$("charts").append("<p>Sorry, an error occurred.  Please try again.</p>");
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
		},
		exporting: {
			enabled: true
		}
	});


	//// display functions for highcharts and tables ////
	// organizes chart options, creates chart and appends to the DOM for display
	function displayChart1(info) {
		allData = info;
		console.log(allData);

		// call function to determine categories and values
		var chart1Data = chart1GetData(info);

		if (allData.clinical_study) {
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
		} else
			$("#charts").append("<p class='textCenter'>Sorry, your search didn't return any results.</p>");
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
		
		var tableHeader = "<table class='center'><thead><tr>";
		tableHeader += "<th class='studiesTitle pointer'>Title</th>";
		tableHeader += "<th>URL</th>";
		tableHeader += "<th>Conditions</th>";
		tableHeader += "<th>Status</th>";
		tableHeader += "<th class='studiesScore pointer'>Score</th>";
		tableHeader += "<th class='studiesDate pointer'>Last Changed</th>";
		tableHeader += "</tr></thead><tbody id='tablebody'>";	
		
		var tableContent = "";
		for (data in tableInfo) {
			tableContent += "<tr><td data-tooltip='"+tableInfo[data].title+"'>"+tableInfo[data].title.slice(0,10)+"...</td>";
			tableContent += "<td><a target='_blank' href='"+tableInfo[data].url+"'>"+tableInfo[data].url.slice(-11)+"</td>";
			tableContent += "<td>"+tableInfo[data].condition_summary+"</td>";
			tableContent += "<td>"+tableInfo[data].status+"</td>";
			tableContent += "<td class='textCenter'>"+tableInfo[data].score+"</td>";
			tableContent += "<td>"+tableInfo[data].last_changed+"</td></tr>";
		}				
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
		
		var length = tempNames.length;
		catNames.push(tempNames[0]);
		
		for (var i=1;i<length;i++) {
			if (tempNames[i-1] != tempNames[i])
				catNames.push(tempNames[i]); 
		}
		
		console.log(catNames);

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
	
	
	//// sorting functions ////
	// ascending title
	function ascending(a,b) {
		var alpha = $(a).children('td').eq(0).text();
		var beta = $(b).children('td').eq(0).text();

		if (alpha < beta)
			return -1;
		if (alpha > beta)
			return 1;
		return 0;	
	}
	// descending title
	function descending(a,b) {
		var alpha = $(a).children('td').eq(0).text();
		var beta = $(b).children('td').eq(0).text();
		
		if (alpha < beta)
			return 1;
		if (alpha > beta)
			return -1;
		return 0;	
	}	
	// ascending numbers
	function ascendingNum(a,b) {
		var alpha = parseFloat($(a).children('td').eq(4).text());
		var beta = parseFloat($(b).children('td').eq(4).text());
		
		if (alpha < beta)
			return -1;
		if (alpha > beta)
			return 1;
		return 0;	
	}	
	// descending numbers
	function descendingNum(a,b) {
		var alpha = parseFloat($(a).children('td').eq(4).text());
		var beta = parseFloat($(b).children('td').eq(4).text());
		
		if (alpha < beta)
			return 1;
		if (alpha > beta)
			return -1;
		return 0;	
	}
	
	function ascendingDate(a,b) {	
		var alpha = ($(a).children('td').eq(5).text());
		var beta = ($(b).children('td').eq(5).text());		
		
		alpha = alpha.split(' ');
		alpha[1] = alpha[1].replace(",","");

		beta = beta.split(' ');
		beta[1] = beta[1].replace(",","");
		
		console.log(alpha);
		
		// compare year
		if (parseInt(alpha[2]) > parseInt(beta[2]))
			return 1;
		if (parseInt(alpha[2]) < parseInt(beta[2]))
			return -1;
		
		// if year equal, compare month
		//if (parseInt(alpha[2]) == parseInt(beta[2])) {
		if (monthNum(alpha[0]) > monthNum(beta[0]))
			return 1;
		if (monthNum(alpha[0]) < monthNum(beta[0]))
			return -1;
		
		// if month equal, compare day
		if (parseInt(alpha[1]) > parseInt(beta[1]))
			return 1;
		if (parseInt(alpha[1]) < parseInt(beta[1]))
			return -1;
		
		return 0;
	}

	function descendingDate(a,b) {	
		var alpha = ($(a).children('td').eq(5).text());
		var beta = ($(b).children('td').eq(5).text());		
		
		alpha = alpha.split(' ');
		alpha[1] = alpha[1].replace(",","");

		beta = beta.split(' ');
		beta[1] = beta[1].replace(",","");
		
		console.log(alpha);
		
		// compare year
		if (parseInt(alpha[2]) > parseInt(beta[2]))
			return -1;
		if (parseInt(alpha[2]) < parseInt(beta[2]))
			return 1;
		
		// if year equal, compare month
		//if (parseInt(alpha[2]) == parseInt(beta[2])) {
		if (monthNum(alpha[0]) > monthNum(beta[0]))
			return -1;
		if (monthNum(alpha[0]) < monthNum(beta[0]))
			return 1;
		
		// if month equal, compare day
		if (parseInt(alpha[1]) > parseInt(beta[1]))
			return -1;
		if (parseInt(alpha[1]) < parseInt(beta[1]))
			return 1;
		return 0;
	}

	
	// get numerical value of month
	function monthNum(str) {
		switch(str) {
			case "January":
				str = 1;
				break;
			case "February":
				str = 2;
				break;
			case "March":
				str = 3;
				break;		
			case "April":
				str = 4;
				break;
			case "May":
				str = 5;
				break;
			case "June":
				str = 6;
				break;
			case "July":
				str = 7;
				break;
			case "August":
				str = 8;
				break;
			case "September":
				str = 9;
				break;
			case "October":
				str = 10;
				break;
			case "November":
				str = 11;
				break;
			case "December":
				str = 12;
				break;
		}
		return str;
	}
	
	//// event listeners ////
	// search event
	$(document).on("click", "button", function() {
		$("#charts").empty();
		fetchResults();
	});
	
	// sort by title
	$(document).on("click", ".studiesTitle", function() {
		var rows = $("#tablebody tr").get();

		if (sortType == 'ascending') {
			rows.sort(descending);
			sortType = 'descending';
		} else {
			rows.sort(ascending);
			sortType = 'ascending';
		}

		$('#tablebody').empty();
		$.each(rows, function(index, row) {
			$('#tablebody').append(row);
		});
	});
	
	// sort by score
	$(document).on("click", ".studiesScore", function() {
		var rows = $("#tablebody tr").get();
		
		if (sortType == 'ascendingNum') {
			rows.sort(descendingNum);
			sortType = 'descendingNum';
		} else {
			rows.sort(ascendingNum);
			sortType = 'ascendingNum';
		}
		
		$('#tablebody').empty();
		$.each(rows, function(index, row) {
			$('#tablebody').append(row);
		});			
	});
	
	// sort by date
	$(document).on("click", ".studiesDate", function() {
		var rows = $("#tablebody tr").get();
		
		if (sortType == 'ascendingDate') {
			rows.sort(descendingDate);
			sortType = 'descendingDate';
		} else {
			rows.sort(ascendingDate);
			sortType = 'ascendingDate';
		}

		$('#tablebody').empty();
		$.each(rows, function(index, row) {
			$('#tablebody').append(row);
		});	
	});
});
































