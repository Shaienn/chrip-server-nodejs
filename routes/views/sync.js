var keystone = require('keystone');
var db = require(keystone.get('database'));

exports = module.exports = function (req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    locals.data = {
	authors: 0,
	songs: 0
    }

    console.log("get stat");
    db.open()
	    .then(db.getStat)
	    .then(function (res) {
		console.log(res);
		locals.data.authors = res.authors;
		locals.data.songs = res.songs;
		view.render('sync');
	    })
	    .fin(db.close())
};
