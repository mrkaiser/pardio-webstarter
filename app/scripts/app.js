(function(){
	var app = angular.module('partybox',[]);

	var mopidy = new Mopidy({
		webSocketUrl: "ws://vela:6680/mopidy/ws/"
	});

	app.controller('PlayerController',['$http',function($http){
		var player = this;
		player.currentTlTrack = {};
		

		/**Gets the Cover for a given album, artist pair**/
		var getCover = function(tl_track){
			var lookup_uri = tl_track.track.album.uri.split(":").pop();
			var queryURL = 'https://api.spotify.com/v1/albums/'+lookup_uri;
			console.log(queryURL);
			$http.get(queryURL).success(function(data){
				console.log(data);
				player.currentTlTrack.albumCover = data.images[0]["url"];
			});	
		}

		var trackSet = function(tl_track){
			console.log(player.currentTlTrack);
			player.currentTlTrack.name = tl_track.track.name;
			player.currentTlTrack.artist = tl_track.track.artists[0].name;
			player.currentTlTrack.album = tl_track.track.album.name;			
			return tl_track;
		}

		var getCurrentTrack = function(){
			mopidy.playback.getCurrentTlTrack()
			.then(trackSet, console.error.bind(console))
			.then(getCover, console.error.bind(console));
		}

		mopidy.on("state:online", getCurrentTrack);
		mopidy.on("event:trackPlaybackStarted",getCurrentTrack);
		
	}]);

	


})();