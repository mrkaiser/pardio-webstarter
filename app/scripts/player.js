'use strict';

var mopidy = new Mopidy({
    webSocketUrl: "ws://vela:6680/mopidy/ws/"
});


function PlayerController($scope, $http){

	/**Gets the Cover for a given album, artist pair**/
	var getCover = function(tl_track){
		var artistQuery = tl_track.track.artists[0].name.split(' ').join('+');
		var albumQuery = tl_track.track.album.name.split(' ').join('+');
		var queryURL = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=ec7bda8c5926d7d23369faf14c76954b&artist='+artistQuery+'&album='+albumQuery+'&format=json';
		console.log(queryURL);
		$http.get(queryURL)
			.success(function(data){
				console.log(data);
				$scope.currentTlTrack.albumCover = data.album.image[4]["#text"];
			});	
	}

	var trackSet = function(tl_track){
		$scope.currentTlTrack = {"name":"","artist":"","albumCover":"","album":""};
		$scope.currentTlTrack.name = tl_track.track.name;
		$scope.currentTlTrack.artist = tl_track.track.artists[0].name;
		$scope.currentTlTrack.album = tl_track.track.album.name;
		$scope.$apply();
		console.log(tl_track);
		return tl_track;
	}

	var getCurrentTrack = function(){
		mopidy.playback.getCurrentTlTrack()
			.then(trackSet, console.error.bind(console))
			.then(getCover, console.error.bind(console));
	}

	mopidy.on("state:online", getCurrentTrack);
	mopidy.on("event:trackPlaybackStarted",getCurrentTrack);
	
}