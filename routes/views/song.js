var keystone = require('keystone');
var Q = require('q');
var chrip = require('chrip');

exports = module.exports = function (req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.data = {
	singers: [],
	songs: [],
	song: [],
	active: {},
    }

    view.on('init', function (next) {
	var songs_queue = [
	    chrip.get_singers(),
	    chrip.get_songs_by_gaid(req.params.singer),
	    chrip.get_song_preview(req.params.song, req.params.scale),
	];

	Q.all(songs_queue).spread(function (singers, songs, song) {
	    
	    console.log(song);
	    
	    locals.data.singers = singers;
	    locals.data.songs = songs;
	    locals.data.song = song;
	    locals.data.active.singer = req.params.singer;
	    locals.data.active.song = req.params.song;
	    next();
	});
    });

    // Render the view
    view.render('song');
};
