(function(){
	var app = angular.module('partybox',[totimeFilter]);

	var mopidy = new Mopidy({
		webSocketUrl: "ws://vela:6680/mopidy/ws/"
	});

	app.controller('PlayerController',['$http', '$q',function($http,$q){
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
			
			player.currentTlTrack.name = tl_track.track.name;
			player.currentTlTrack.artist = tl_track.track.artists[0].name;
			player.currentTlTrack.album = tl_track.track.album.name;			
			return tl_track;
		}

		var getCurrentTrack = function(){
			$q.when(mopidy.playback.getCurrentTlTrack())
			.then(trackSet, console.error.bind(console))
			.then(getCover, console.error.bind(console));
		}

		mopidy.on("state:online", getCurrentTrack);
		mopidy.on("event:trackPlaybackStarted",getCurrentTrack);	
	}]);

	app.controller('TracklistController',function($q){

		var tracklist = this;
		tracklist.tracks = [];

		

		var getTracks = function(){
			console.log('getting tracks');
			var processTracks = function(tracks){
				console.log(tracks);
				tracklist.tracks = tracks.map(function(e){return e.track}); //extracts only the track object in the tracklist
			}
			$q.when(mopidy.tracklist.getTlTracks()).then(processTracks, console.error.bind(console));
		}
		
		mopidy.on("state:online",getTracks);
		mopidy.on("event:trackPlaybackStarted",getTracks);
		mopidy.on("event:playbackStateChanged",getTracks);
	});

	app.controller('SearchController',function($q){
		var searchCtrl = this;
		searchCtrl.results = [];
		searchCtrl.query = '';

		this.search = function(query){
			console.log(searchCtrl.query);
			var processTracks = function(results){
				console.log(results);
				searchCtrl.results = results[0].tracks;
				searchCtrl.results.push(results[1].tracks);
				searchCtrl.query = '';
				return results;
			}
			$q.when(mopidy.library.search({"any": searchCtrl.query})).then(processTracks,console.error.bind(console));
		}

	});

	

	


})();