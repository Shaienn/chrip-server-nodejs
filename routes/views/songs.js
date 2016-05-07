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
	singer: null,
	songs: [],
	active: {},
    }

    view.on('init', function (next) {
	var songs_queue = [
	    chrip.get_singers(),
	    chrip.get_songs_by_gaid(req.params.singer),
	];

	Q.all(songs_queue).spread(function (singers, songs) {
	    locals.data.singers = singers;
	    locals.data.songs = songs;
	    locals.data.active.singer = req.params.singer;
	    next();
	});
    });



    // Render the view
    view.render('songs');
};
