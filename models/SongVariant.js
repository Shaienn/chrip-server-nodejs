var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

var SongVariant = new keystone.List('SongVariant', {
    map: {name: 'mac'},
    autokey: {path: 'slug', from: 'text,mac', unique: true}
});

SongVariant.add({
    mac: {type: String, required: true, initial: true},
    date: {type: Date},
    text: {type: Types.Song, required: true, initial: true},
    song: {type: Types.Relationship, ref: 'Song', index: true, initial: true},
});

SongVariant.defaultColumns = 'mac';
SongVariant.register();
