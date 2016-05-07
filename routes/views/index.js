var keystone = require('keystone');
var Singer = keystone.list('Singer');
var chrip = require('chrip');


exports = module.exports = function (req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'home';

    locals.data = {
	singers: [],
    };

    view.on('init', function (next) {
	chrip.get_singers().then(function (singers) {
	    locals.data.singers = singers;
	    next();
	}, function (err) {
	    throw new Error(err);
	});
    });



    // Render the view
    view.render('index');

};
