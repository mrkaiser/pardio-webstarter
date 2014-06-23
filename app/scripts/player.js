'use strict';

var mopidy = new Mopidy({
    webSocketUrl: "ws://vela:6680/mopidy/ws/"
});


function PlayerController($scope, $http){

	/**Gets the Cover for a given album, artist pair**/
	var getCover = function(track){
		var artistQuery = track.artists[0].name.split(' ').join('+');
		var albumQuery = track.album.name.split(' ').join('+');
		var queryURL = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=ec7bda8c5926d7d23369faf14c76954b&artist='+artistQuery+'&album='+albumQuery+'&format=json';
		console.log(queryURL);
		$http.get(queryURL)
			.success(function(data){
				console.log(data);
				$scope.currentTrack.albumCover = data.album.image[4]["#text"];
				$scope.apply();
			});	
	}

	var trackSet = function(track){
		$scope.currentTrack = {"name":"","artist":"","albumCover":"","album":""};
		$scope.currentTrack.name = track.name;
		$scope.currentTrack.artist = track.artists[0].name;
		$scope.currentTrack.album = track.album.name;
		$scope.$apply();
		console.log(track);
		return track;
	}

	var getCurrentTrack = function(){
		mopidy.playback.getCurrentTrack()
			.then(trackSet, console.error.bind(console))
			.then(getCover, console.error.bind(console));
	}

	mopidy.on("state:online", getCurrentTrack);
	mopidy.on("event:trackPlaybackStarted",getCurrentTrack);
	
}