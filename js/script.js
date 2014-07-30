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
				console.log("Error in accessing studies.");
			},
			success: function(data) {
				console.log(data);
			}				
		});	
		
	});
});
