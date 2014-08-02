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
			searchTopic = searchTopic.split(" ");
			
			// clear excess whitespace between words
			var filteredSearch = [];
			for (topic in searchTopic) {
				if (searchTopic[topic] != '')
					filteredSearch.push(searchTopic[topic]);
			}
			
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
				$("charts p").css("display", "block");
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
			$("#charts p").after("<div id='chart1'></div>");
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
			$("#charts > p").css("display", "block");
	}

	// organizes chart options, creates chart and appends to the DOM for display
	function displayChart2(str) {
		$("#chart2").remove();	
		$("#table3").css("display", "none");		
		
		var cat = str;
		
		var chart2Data = chart2GetData(cat);

		filteredData = chart2Data[2];
		
		console.log(chart2Data);

		// create instance of Highcharts and render to DOM
		$("#chart1").after("<div id='chart2'></div>");
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
			}			
		});
		setTimeout(scrollDown(), 2000);
	}

	// outputs data for table
	function displayTable(str) {
		$("#tablebody").empty();
		var condition = str;
		
		var tableInfo = getTableData(condition);
		console.log(tableInfo);

		var tableContent = "";
		for (data in tableInfo) {
			tableContent += "<tr><td class='tooltip'><span>"+tableInfo[data].title+"</span>"+tableInfo[data].title.slice(0,10)+"...</td>";
			tableContent += "<td><a target='_blank' href='"+tableInfo[data].url+"'>"+tableInfo[data].url.slice(-11)+"</td>";
			tableContent += "<td>"+tableInfo[data].condition_summary+"</td>";
			tableContent += "<td>"+tableInfo[data].status+"</td>";
			tableContent += "<td class='tooltip' class='textCenter'>"+tableInfo[data].score+"</td>";
			tableContent += "<td class='tooltip'>"+tableInfo[data].last_changed+"</td></tr>";
		}				

		$("#tablebody").append(tableContent);
		$("#table3").css("display", "block");
		
		setTimeout(scrollDown(), 2000);
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
		
		// remove duplicate categories
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
	// sort title
	function titleSort(a,b) {
		var alpha = $(a).children('td').eq(0).text();
		var beta = $(b).children('td').eq(0).text();

		if (alpha < beta)
			return -1;
		if (alpha > beta)
			return 1;
		return 0;		
	}
	function ascendingTitle(a,b) {
		return titleSort(a,b);
	}
	function descendingTitle(a,b) {
		return titleSort(b,a);
	}	

	// sort numbers
	function numSort(a,b) {
		var alpha = parseFloat($(a).children('td').eq(4).text());
		var beta = parseFloat($(b).children('td').eq(4).text());
		
		if (alpha < beta)
			return -1;
		if (alpha > beta)
			return 1;
		return 0;	
	}
	function ascendingScore(a,b) {
		return numSort(a,b);
	}	
	function descendingScore(a,b) {
		return numSort(b,a);
	}

	// sort date
	function dateSort(a,b) {
		var alpha = ($(a).children('td').eq(5).text());
		var beta = ($(b).children('td').eq(5).text());		
		
		alpha = alpha.split(' ');
		alpha[1] = alpha[1].replace(",","");

		beta = beta.split(' ');
		beta[1] = beta[1].replace(",","");
		
		// compare year
		if (parseInt(alpha[2]) > parseInt(beta[2]))
			return 1;
		if (parseInt(alpha[2]) < parseInt(beta[2]))
			return -1;
		
		// if year equal, compare month
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
	function ascendingDate(a,b) {
		return dateSort(a,b);
	}
	function descendingDate(a,b) {
		return dateSort(b,a);
	}	
	
	// get numerical value of each month
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

	// scroll to bottom of screen
	function scrollDown() {
		var height = $(document).height();		
		var scrollTime = .6*height;			// dynamically calculate scroll time dependent on distance to travel
		$("html, body").animate({scrollTop: height-$(window).height()}, scrollTime);
	}

	
	//// event listeners ////
	// search event
	$(document).on("click", "button", function() {
		$("#charts > p").css("display", "none");
		$("#chart1").remove();
		$("#chart2").remove();
		$("#table3").css("display", "none");
		fetchResults();
	});
	
	// click event to sort by title, score or date
	$(document).on("click", ".studiesTitle, .studiesScore, .studiesDate", function() {
		var clicked = $(this);
		var rows = $("#tablebody tr").get();
		
		if (clicked.hasClass("studiesTitle")) {
			if (sortType == 'ascendingTitle') {
				rows.sort(descendingTitle);
				sortType = '';
			} else {
				rows.sort(ascendingTitle);
				sortType = 'ascendingTitle';
			}
		}
		if (clicked.hasClass("studiesScore")) {
			if (sortType == 'ascendingScore') {
				rows.sort(descendingScore);
				sortType = '';
			} else {
				rows.sort(ascendingScore);
				sortType = 'ascendingScore';
			}
		}			
		if (clicked.hasClass("studiesDate")) {
			if (sortType == 'ascendingDate') {
				rows.sort(descendingDate);
				sortType = '';
			} else {
				rows.sort(ascendingDate);
				sortType = 'ascendingDate';
			}	
		}	
			
		$('#tablebody').empty();
		$.each(rows, function(index, row) {
			$('#tablebody').append(row);
		});
	});
	

	// tooltip hover to follow mouse
	$(document).on("mouseover", ".tooltip", function () {
		
		//var tooltips = document.getElementById('test');
		var tooltip = document.querySelectorAll('.tooltip > span');
		//var tooltip = $(this).children("span");
		//console.log(tooltip);
	

		window.onmousemove = function(evt) {
			var x = (evt.clientX) + "px";
			var y = (evt.clientY -25) + "px";
		
			for (var i=0;i<tooltip.length;i++) {
				tooltip[i].style.top = y;
				tooltip[i].style.left = x;
			}
		}	

	});

	
});
