var keystone = require('keystone');
var Types = keystone.Field.Types;
var db = require(keystone.get('database'));
var Singer = keystone.list('Singer');

/**
 * Post Model
 * ==========
 */

var Song = new keystone.List('Song', {
    map: {name: 'name'},
    autokey: {path: 'slug', from: 'name text', unique: true, hidden: true}
});

Song.add({
    singer: {type: Types.Relationship, ref: 'Singer', index: true, initial: true},
    name: {type: String, required: true, initial: true},
    gsid: {type: Number, noedit: true, default: 0, watch: 'singer name state text', value: save_song},
    text: {type: Types.Song},
    state: {type: Types.Select, options: 'committed, approved', default: 'committed', index: true},
    author: {type: Types.Relationship, ref: 'User', index: true},
    variants: {type: Types.Relationship, ref: 'SongVariant', many: true, hidden: true}
});

Song.schema.post('remove', function (song) {
    if (song.gsid !== 0) {
	db.remove_song(
		{
		    name: song.name,
		    gsid: song.gsid
		}
	)
		.then(db.step_version)
		.done();
	
    }
});

function save_song(callback) {
    var that = this;
    if (this.state !== 'approved') {
	callback(null, 0);
	return;
    }

    Singer.model.findById(this.singer).exec(function (err, singer) {
	if (err || singer.gaid === 0) {
	    callback(null, 0);
	    return;
	}

	db.save_song(
		{
		    name: that.name,
		    gaid: singer.gaid,
		    text: that.text,
		    gsid: that.gsid
		}
	)
		.then(
			function (result) {
			    db.step_version().then(function () {
				callback(null, result);
			    });
			},
			function (err) {
			    callback(err, null);

			}
		)
		.done();
    });
}
Song.relationship({ref: 'SongVariant', path: 'variants', refPath: 'song'});
Song.defaultColumns = 'name, singer';
Song.register();
