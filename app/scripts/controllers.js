'use strict';

var mopidy = new Mopidy({
    webSocketUrl: "ws://vela:6680/mopidy/ws/"
});

var online = false;


var consoleError = console.error.bind(console);

function QueueController($scope, $queue) {
  $scope.refresh = bootstrap;

  $scope.$on('queueUpdated', function(queue) {
    $scope.queue = $queue.tracks;
    $scope.$apply();
  });

  function setNowPlaying(uri) {
    $('tr.queued-track').removeClass('info');
    $('tr.queued-track[data-uri="'+uri+'"]').addClass('info');
  }

  mopidy.on('event:trackPlaybackStarted', function(data) {
    setNowPlaying(data.tl_track.track.uri);
  });

  $scope.changeTrack = function(uri) {
    for ( var i in $queue.tracks ) {
      var tltrack = $queue.tracks[i];
      if ( tltrack.track.uri == uri ) {
        var tmp = tltrack.track.queued_by;
        delete tltrack.track.queued_by;
        delete tltrack.track.source;
        mopidy.playback.changeTrack(angular.fromJson(angular.toJson(tltrack))).then(function(data) {}, consoleError);
        mopidy.playback.play();
        tltrack.track.queued_by = tmp;
        break;
      }
    }
  }

  $scope.removeTrack = function(uri) {
    mopidy.tracklist.remove({uri: uri});
  };

  $scope.clearQueue = function() {
    mopidy.tracklist.clear();
  };

  mopidy.on('event:tracklistChanged', function() {
    $queue.refresh();
  });

  function bootstrap() {
    $queue.refresh(function() {
      mopidy.playback.getCurrentTrack().then(function(data) {
        setNowPlaying(data.uri);
      });
    });
  }
  mopidy.on('state:online', bootstrap);
  if ( online ) bootstrap();
}

function SearchController($scope, $queue) {
  $scope.show = { artist: false, album: false };

  $scope.search = function() {
    $('#search-loading').show();
    $scope.show = { artist: false, album: false };
    var self = this;
    $scope.result = false;
    if ( self.query ) {
      mopidy.library.search({'any':[self.query]}).then(function(data) {
        var sources = {};
        for ( var i in data ) {
          for ( var j in config.mobox.search_priority ) {
            var re = new RegExp('^'+config.mobox.search_priority[j]);
            if ( data[i].uri.match(re) ) {
              sources[config.mobox.search_priority[j]] = data[i];
              break;
            }
          }
        }

        var result = {
          albums: [],
          artists: [],
          tracks: []
        };

        for ( var s in config.mobox.search_priority ) {
          s = config.mobox.search_priority[s];
          for ( var m in Object.keys(result) ) {
            m = Object.keys(result)[m];
            if ( s in sources && m in sources[s] ) {
              for ( var i in sources[s][m] ) {
                sources[s][m][i].source = s;
              }
              result[m] = result[m].concat(sources[s][m]);
            }
          }
        }

        $scope.result = result;
        $('#search-loading').hide();
        $scope.$apply();
      });
    }
  };

  $scope.doShow = function(model, uri, meta) {
    mopidy.library.lookup(uri).then(function(data) {
      $scope.show[model] = { meta: meta, data: data }
      $scope.$apply();
    });
  };

  $scope.addAlbum = function(album) {
    $queue.add(album);
  };
}

function PlaybackController($scope, $http) {
  /*** Playback actions ***/
  $scope.next = function() {
    mopidy.playback.next();
    $scope.state != 'playing' && mopidy.playback.play();
  };
  $scope.play = function() {
    mopidy.playback.play();
  };
  $scope.pause = function() {
    mopidy.playback.pause();
  };
  $scope.previous = function() {
    mopidy.playback.previous();
  };
  $scope.stop = function() {
    mopidy.playback.stop();
  };

  /** State change listeners ***/
  mopidy.on('event:trackPlaybackStarted', function(data) {
    setCurrentTrack(data.tl_track.track);
  }, consoleError);

  mopidy.on('event:playbackStateChanged', function(data) {
    setState(data.new_state);
  }, consoleError);

  /** Progress bar ***/
  $scope.progressPercentage = function() {
    if ( online && $scope.currentTrack ) {
      return $scope.currentProgress / $scope.currentTrack.length * 100
    }
    else {
      return 0;
    }
  };

  var setCurrentProgress = function(progress) {
    $scope.currentProgress = progress;
    $scope.$apply();
    return $scope.currentProgress;
  };

  var int = window.setInterval(function() {
    if ( online && $scope.state == 'playing' ) {
      mopidy.playback.getTimePosition().then(function(data) {
        setCurrentProgress(data);
      });
    }
  }, 1000);

  /*** Setters ***/
  var setCurrentTrack = function(track) {
    $scope.currentTrack = track;
    getCover($scope.currentTrack.artist[0].name,$scope.currentTrack.album.name);
    $scope.$apply();
    return track;
  };

  var setState = function(new_state) {
    $scope.state = new_state;
    $scope.$apply();
    return new_state;
  }

  /**Gets the Cover for a given album, artist pair**/
  $scope.getCover = function(artist,album){
    var artistQuery = artist.split(' ').join('+');
    var albumQuery = album.split(' ').join('+');
    var queryURL = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=ec7bda8c5926d7d23369faf14c76954b&artist='+artistQuery+'&album='+albumQuery+'&format=json';
    console.log(queryURL);
    $http.get(queryURL)
    .success(function(data){
      console.log(data);
      $scope.currentTrack.albumCover = data.album.image[4]["#text"];
      $scope.$apply();
    }); 
  }

  /*** Bootstrap ***/
  var bootstrap = function() {
    online = true;
    mopidy.playback.getCurrentTrack().then(setCurrentTrack, consoleError);
    mopidy.playback.getState().then(setState, consoleError);
  };

  mopidy.on('state:online', bootstrap);
}

function PlaylistsController($scope) {
  $scope.show = false;
  $scope.playlists = [];

  $scope.setShow = function(show) {
    $scope.show = show;
  };

  $scope.getPlaylists = function() {
    $('#playlists-loading').show();
    mopidy.playlists.getPlaylists().then(function(data) {
      $scope.playlists = data;
      $scope.$apply();
      $('#playlists-loading').hide();
    }, consoleError);
  };

  mopidy.on('state:online', $scope.getPlaylists);
  online && $scope.getPlaylists();
}