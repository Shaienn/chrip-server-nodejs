var keystone = require('keystone');
var async = require('async');
var md5 = require('js-md5');
var Q = require('q');
var db = require(keystone.get('database'));
var chrip = require('chrip');

var ANSWER_WRONG_DATA = 1;

exports.get_songbase_version = function (req, res) {
    db.get_version()
	    .then(function (version) {

		res.apiResponse({
		    md5: md5(req.body),
		    version: version
		});

	    }).done();
}

exports.get_songbase = function (req, res) {
    var file = keystone.get('database_file');
    res.download(file); // Set disposition and send it.
}


exports.song_add = function (req, res) {

    var data = req.body;

    if ((typeof data.gaid !== 'undefined') &&
	    (typeof data.gsid !== 'undefined') &&
	    (typeof data.uaid !== 'undefined') &&
	    (typeof data.usid !== 'undefined') &&
	    (typeof data.singer_name !== 'undefined') &&
	    (typeof data.name !== 'undefined') &&
	    (typeof data.text !== 'undefined') &&
	    (typeof data.mac !== 'undefined')) {

	if (chrip.song_validation(data)) {

	    /* Song is valid */

	    chrip.import_song(data).then(function () {
		res.apiResponse({
		    md5: md5(req.body),
		    approve: true
		});
	    })

	}

	/* TODO sender validation */

	/* TODO data validation */

    } else {

	res.apiResponse({
	    md5: md5(req.body),
	    result: ANSWER_WRONG_DATA
	});
    }

}