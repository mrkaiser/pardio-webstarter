'use strict';

var mopidy = new Mopidy({
    webSocketUrl: "ws://vela:6680/mopidy/ws/"
});

function TracklistController($scope){
	$scope.tracks = ""


	var getTracks = function(){
		console.log('getting tracks');
		var processTracks = function(tracks){
			console.log(tracks);
			$scope.tracks = tracks;
			$scope.apply();
		}
		mopidy.tracklist.getTlTracks().then(processTracks, console.error.bind(console));
	}				


	mopidy.on("state:online",getTracks);
	mopidy.on("event:trackPlaybackStarted",getTracks);
}