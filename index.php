<!doctype html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1">
	<meta http-equiv="Content-Type" charset="utf-8">
	<title>zephyr health | assignment</title>
	
	<!-- css links -->
	<!-- <link rel="stylesheet" href="libs/reset.css" /> <!-- meyer reset -->
	<!--<link rel="stylesheet" href="css/style.css" />-->
</head>
<body>
	<h2>php web proxy version</h2>
	<button>click</button>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script>
		$(document).ready(function() {
			var path = "ct2/results?term=Stroke+AND+Brain&Search=Searc&displayxml=true";
			
			var url = "http://localhost/projects/zephyr-health/process.php?path=" + encodeURIComponent(path);
			
			$(document).on("click", "button", function() {
				
				$.ajax({
					dataType: "json",
					//url: "process.php",
					//data: {url: url},
					url: url,
					//url: "sample-large.xml",
					//headers: { 'Access-Control-Allow-Origin': '*' },
					//crossDomain: true,
					error: function() {
						console.log("Error!");
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
