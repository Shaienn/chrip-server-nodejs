var keystone = require('keystone');
var Types = keystone.Field.Types;
var db = require(keystone.get('database'));
/**
 * User Model
 * ==========
 */

var Singer = new keystone.List('Singer', {
    map: {name: 'name'},
    autokey: {path: 'slug', from: 'name', unique: true, hidden: true}
});
Singer.add({
    name: {type: String, required: true, initial: true},
    state: {type: Types.Select, options: 'committed, approved', default: 'committed', index: true},
    gaid: {type: Number, noedit: true, default: 0, value: save_singer, watch: 'name state'},
    songs: {type: Types.Relationship, ref: 'Song', many: true, hidden: true}
});

Singer.schema.post('remove', function (singer) {
    if (singer.gaid !== 0) {
	db.remove_singer(
		{
		    name: singer.name,
		    gaid: singer.gaid
		}
	)
		.then(db.step_version)
		.done()
    }
});

function save_singer(callback) {

    var that = this;
    if (this.state !== 'approved') {
	callback(null, 0);
	return;
    }

    db.save_singer(
	    {
		name: that.name,
		gaid: that.gaid
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
}

/**
 * Relationships
 */

Singer.relationship({ref: 'Song', path: 'songs', refPath: 'singer'});
/**
 * Registration
 */

Singer.defaultColumns = 'name';
Singer.register();
