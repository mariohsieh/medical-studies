<!doctype html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1">
	<meta http-equiv="Content-Type" charset="utf-8">
	<title>zephyr health | assignment</title>
	
	<!-- css links -->
	<!-- <link rel="stylesheet" href="libs/reset.css" /> <!-- meyer reset -->
	<link rel="stylesheet" href="css/style.css" />
</head>
<body>
	<h2>clinical trials</h2>
	
	<!-- search & filter -->
	<p>Please input search topics</p>
	<input id="searchTopic" type="search" placeholder="search studies" />
	<p>Input between 0 - 100 results</p>
	<input id="resultsCount" type="number" min="0" step="1" max="100" pattern="\d+" />
	<button>click</button>
	
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script>
		$(document).ready(function() {
			
			// declare url and path for proxy server
			var url = "http://localhost/projects/zephyr-health/process.php?path=";
			var path = "ct2/results?term=&Search=Search&displayxml=true";

			$(document).on("click", "button", function() {
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

				console.log(path);

				$.ajax({
					dataType: "json",
					url: url+encodeURIComponent(path),
					error: function() {
						console.log("Error in accessing data!");
					},
					success: function(data) {
						console.log(data);
					}				
				});	
				
			});
		});
	</script>
</body>
</html>
