angular.module("medicalStudiesApp", [])
/*
	.factory("clinicalTrialsFactory", function($http) {
		return {
			getStudies: function(doc) {
				$http.get()
				
				
				.success(doc){
					console.log(doc);
				}
			}
		};

	})
*/
	.controller("mainCtrl", function($scope, $http) {
		
		$scope.fetchResults = function() {

			// declare url and path for proxy server
			var url = "process.php?path=ct2/results?&displayxml=true";
			//&term=lung+cancer&count=5";

			if ($scope.searchTopic) {
				var temp = $scope.searchTopic.trim();
				searchTopic = "&term="+temp.split(" ").join("+");
				url += searchTopic;
			}
			
			if ($scope.resultsCount) {
				var temp = $scope.resultsCount.toString().trim();
				resultsCount = "&count="+temp;
				url += resultsCount;
			}
			
			console.log(url);
			
			$http({
				method: "GET",
				url: url,
				responseType: "json"
			})
			.success(function(data) {
				console.log(data);
			})
			.error(function() {
				console.log("error");
			});
			
		}
		
	});
