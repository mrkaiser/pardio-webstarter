'use strict';

var mopidy = new Mopidy({
    webSocketUrl: "ws://vela:6680/mopidy/ws/"
});

function SearchController($scope){
	$scope.tracks = "";


	$scope.search = function(){
		var processTracks = function(results){
			$scope.tracks = results[0].tracks;
			$scope.apply();
			console.log($scope.tracks);
		}
		//search takes a DICTIONARY not a pure string
		mopidy.library.search({"any": $scope.query}).then(processTracks,console.error.bind(console)); 
	}
}