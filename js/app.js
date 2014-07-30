angular.module("medicalStudiesApp", [])

	.factory("clinicalTrialsFactory", function($http) {
		return {
			getStudies: function(url) {
				return $http({
						method: "GET",
						url: url,
						responseType: "json"
					});
/*					
					.success(function(data) {
						//console.log(data.clinical_study);
						return data;
					})
					.error(function() {
						console.log("error");
					});
*/ 
			}
		};
	})

	.controller("mainCtrl", function($scope, $http, clinicalTrialsFactory) {
		
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
			
			clinicalTrialsFactory.getStudies(url)
				.success(function(data) {
					$scope.results = data.clinical_study;
					//console.log($scope.results);
				})
				.error(function(data) {
					console.log("Error retrieving clinical studies");
				});

			
/*			
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
*/	
		}
		
	});
