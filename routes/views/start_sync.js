var keystone = require('keystone');
var db = require(keystone.get('database'));
var Singer = keystone.list('Singer');
var Song = keystone.list('Song');
var Q = require('q');

function getSingersFromSQlite() {
    var d = Q.defer();

    db.open()
	    .then(db.get_singers)
	    .then(function (rows) {
		d.resolve(rows);
	    })
	    .fin(db.close());

    return d.promise;
}

function getSongsFromSQlite() {
    var d = Q.defer();

    db.open()
	    .then(db.get_songs)
	    .then(function (rows) {
		d.resolve(rows);
	    })
	    .fin(db.close());

    return d.promise;
}

function findSinger(gaid) {
    var d = Q.defer();

    Singer.model.findOne()
	    .where('gaid', parseInt(gaid))
	    .exec(function (err, result) {
		if (err) {
		    d.reject(new Error(err));
		} else {
		    d.resolve(result);
		}
	    });

    return d.promise;
}

function findSong(gsid) {
    var d = Q.defer();

    Song.model.findOne()
	    .where('gsid', parseInt(gsid))
	    .exec(function (err, result) {
		if (err) {
		    d.reject(new Error(err));
		} else {
		    d.resolve(result);
		}
	    });

    return d.promise;
}

function createSong(singer, song) {
    var d = Q.defer();
    var new_song = new Song.model();



    new_song.gaid = parseInt(singer.gaid);
    new_song.gsid = parseInt(song.gsid);
    new_song.name = song.name;
    new_song.singer = singer._id;
    new_song.text = song.text;
    new_song.state = 'approved';
    new_song.slug = keystone.utils.slug(song.name + song.text);

    new_song.save(function (err) {
	if (err) {
	    d.reject(new Error(err));
	} else {
	    d.resolve(true);
	}
    });

    return d.promise;
}

function updateSong(mongo_singer, mongo_song, sqlite_song) {
    var d = Q.defer();

    mongo_song.gaid = parseInt(mongo_singer.gaid);
    mongo_song.gsid = parseInt(sqlite_song.gsid);
    mongo_song.name = sqlite_song.name;
    mongo_song.singer = mongo_singer._id;
    mongo_song.text = sqlite_song.text;
    mongo_song.state = 'approved';
    mongo_song.slug = keystone.utils.slug(sqlite_song.name + sqlite_song.text);

    mongo_song.save(function (err) {
	if (err) {
	    d.reject(new Error(err));
	} else {
	    d.resolve(true);
	}
    });

    return d.promise;
}

function createSinger(singer) {
    var d = Q.defer();

    var new_singer = new Singer.model();

    new_singer.gaid = parseInt(singer.gaid);
    new_singer.name = singer.name;
    new_singer.state = 'approved';
    new_singer.slug = keystone.utils.slug(singer.name);

    new_singer.save(function (err) {
	if (err) {
	    d.reject(new Error(err));
	} else {
	    d.resolve(true);
	}
    });

    return d.promise;
}

function updateSinger(mongo_singer, sqlite_singer) {
    var d = Q.defer();

    mongo_singer.gaid = parseInt(sqlite_singer.gaid);
    mongo_singer.name = sqlite_singer.name;
    mongo_singer.state = 'approved';
    mongo_singer.slug = keystone.utils.slug(sqlite_singer.name);

    mongo_singer.save(function (err) {
	if (err) {
	    d.reject(new Error(err));
	} else {
	    d.resolve(true);
	}
    });

    return d.promise;
}

function processSongs(songs) {
    var d = Q.defer();
    var songs_queue = [];
    songs.forEach(function (song) {
	songs_queue.push(processSong(song));
    });

    Q.all(songs_queue).then(function () {
	d.resolve(true);
    });

    return d.promise;
}

function processSong(sqlite_song) {
    var d = Q.defer();

    findSinger(sqlite_song.gaid)
	    .then(function (mongo_singer) {

		if (mongo_singer === null) {

		    console.log("No singer");
		    console.log(sqlite_song);
		    d.resolve(true);

		} else {

		    findSong(sqlite_song.gsid)
			    .then(function (mongo_song) {

				console.log(mongo_song);

				if (mongo_song === null) {
				    /* Create */
				    console.log("+Create");
				    console.log(sqlite_song);
				    createSong(mongo_singer, sqlite_song)
					    .then(function () {
						d.resolve(true);
					    });
				} else {

				    /* Update */
				    console.log("+Update");
				    console.log(sqlite_song);
				    updateSong(mongo_singer, mongo_song, sqlite_song)
					    .then(function () {
						d.resolve(true);
					    });
				}


			    });
		}

	    });
    return d.promise;
}



function processSingers(singers) {
    var d = Q.defer();
    var singers_queue = [];
    singers.forEach(function (singer) {
	singers_queue.push(processSinger(singer));
    });

    Q.all(singers_queue).then(function () {
	d.resolve(true);
    });

    return d.promise;
}

function processSinger(sqlite_singer) {
    var d = Q.defer();
    findSinger(sqlite_singer.gaid)
	    .then(function (mongo_singer) {

		if (mongo_singer === null) {
		    /* Create */
		    console.log("+Create");
		    createSinger(sqlite_singer)
			    .then(function () {
				d.resolve(true);
			    });


		} else {

		    /* Update */
		    console.log("+Update");
		    updateSinger(mongo_singer, sqlite_singer)
			    .then(function () {
				d.resolve(true);
			    });
		}

	    });
    return d.promise;
}

exports = module.exports = function (req, res, next) {

    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.data = {
	authors: [],
	songs: [],
    }
    Q.longStackSupport = true;

    /* Hardcode to override noedit and presave from Singers and Song */

    var singer_value = Singer.schema.tree.gaid.value;
    var singer_noedit = Singer.schema.tree.gaid.noedit;
    delete Singer.schema.tree.gaid.value;
    delete Singer.schema.tree.gaid.noedit;

    var singer_callqueue = []
    Singer.schema.callQueue.forEach(function (item) {
	singer_callqueue.push(item);
    });

    Singer.schema.callQueue = [];
    Singer.register();


    var song_value = Song.schema.tree.gsid.value;
    var song_noedit = Song.schema.tree.gsid.noedit;
    delete Song.schema.tree.gsid.value;
    delete Song.schema.tree.gsid.noedit;

    var song_callqueue = []
    Song.schema.callQueue.forEach(function (item) {
	song_callqueue.push(item);
    });
    Song.schema.callQueue = [];
    Song.register();

    getSingersFromSQlite().then(processSingers).then(function () {

	getSongsFromSQlite().then(processSongs).then(function () {

	    /* Restore schemas */

	    Singer.schema.tree.gaid.value = singer_value;
	    Singer.schema.tree.gaid.noedit = singer_noedit;
	    Singer.schema.callQueue = singer_callqueue;
	    Singer.register();

	    Song.schema.tree.gsid.value = song_value;
	    Song.schema.tree.gsid.noedit = song_noedit;
	    Song.schema.callQueue = song_callqueue;
	    Song.register();

	    console.log("ready");
	    res.send("Ok");
	}).done();

    }).catch(function (error) {
	console.log(error);
    }).done();
};