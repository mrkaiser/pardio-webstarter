'use strict';

var mopidy = new Mopidy({
    webSocketUrl: "ws://vela:6680/mopidy/ws/"
});

function SearchController($scope){
	$scope.tracks = null;


	$scope.search = function(){
		var processTracks = function(results){
			$scope.tracks = null;
			$scope.tracks = results[1].tracks;
			$scope.query = {};
			return results;
		}
		//search takes a DICTIONARY not a pure string
		mopidy.library.search({"any": $scope.query}).then(processTracks,console.error.bind(console)); 
	}
}