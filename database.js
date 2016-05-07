/* Externaj sqlite database module */

'use strict';
var sqlite3 = require('sqlite3').verbose();
var Q = require('q');
var assert = require('assert');
var keystone = require('keystone');
var Db = null;
module.exports = {
    path: keystone.get('database_file'),
    open: function () {
	var d = Q.defer();
	Db = new sqlite3.Database(this.path, function (err) {
	    if (err)
		d.reject(new Error(err));
	    d.resolve();
	    console.log('opened');
	});
	return d.promise;
    },
    close: function () {
	var d = Q.defer();
	Db.close(function () {
	    d.resolve();
	    console.log('closed');
	});
	return d.promise;
    },
    getStat: function () {
	var d = Q.defer();
	var stmt;
	stmt = Db.prepare("SELECT * FROM (SELECT count(*) AS authors FROM Authors ), (SELECT count(*) AS songs FROM Songs)");
	stmt.get(function (err, row) {
	    if (err)
		d.reject(new Error(err));
	    console.log(row);
	    d.resolve(row);
	});
	return d.promise;
    },
    save_singer: function (singer_object) {

	assert.ok(typeof singer_object.name !== "undefined");
	var d = Q.defer();
	var stmt;
	if (typeof singer_object.gaid !== "undefined" && singer_object.gaid !== 0) {

	    /* Update */

	    stmt = Db.prepare("UPDATE Authors SET name = ? WHERE gaid = ?");
	    stmt.run(singer_object.name, singer_object.gaid, function (err) {
		if (err)
		    d.reject(new Error(err));
		d.resolve(singer_object.gaid);
	    });
	} else {

	    /* Insert */

	    stmt = Db.prepare("INSERT INTO Authors (name) VALUES (?)");
	    stmt.run(singer_object.name, function (err) {
		if (err)
		    d.reject(new Error(err));
		d.resolve(this.lastID);
	    });
	}

	stmt.finalize();
	return d.promise;
    },
    remove_singer: function (singer_object) {

	assert.ok(typeof singer_object.name !== "undefined");
	assert.ok(typeof singer_object.gaid !== "undefined");
	assert.ok(singer_object.gaid !== 0);
	var d = Q.defer();
	var stmt = Db.prepare("DELETE FROM Authors WHERE gaid = ? AND name = ?");
	stmt.run(
		singer_object.gaid, singer_object.name, function (err) {
		    if (err)
			d.reject(new Error(err));
		    d.resolve(true);
		});
	stmt.finalize();
	return d.promise;
    },
    get_singers: function () {
	var d = Q.defer();
	var stmt;
	stmt = Db.prepare("SELECT * FROM Authors");
	stmt.all(function (err, rows) {
	    if (err)
		d.reject(new Error(err));
	    console.log(rows);
	    d.resolve(rows);
	});
	stmt.finalize();
	return d.promise;
    },
    get_songs: function () {
	var d = Q.defer();
	var stmt;
	stmt = Db.prepare("SELECT * FROM Songs");
	stmt.all(function (err, rows) {
	    if (err)
		d.reject(new Error(err));
	    d.resolve(rows);
	});
	stmt.finalize();
	return d.promise;
    },
    get_song: function (gsid) {
	assert.ok(gsid !== 0 && !isNaN(gsid));
	var d = Q.defer();
	var stmt;
	stmt = Db.prepare("SELECT * FROM Songs WHERE gsid = ?");
	stmt.get(gsid, function (err, row) {
	    if (err)
		d.reject(new Error(err));
	    console.log(row);
	    d.resolve(row);
	});
	stmt.finalize();
	return d.promise;
    },
    save_song: function (song_object) {

	console.log(song_object);
	assert.ok(typeof song_object.name !== "undefined");
	assert.ok(typeof song_object.gaid !== "undefined");
	assert.ok(typeof song_object.text !== "undefined");
	assert.ok(song_object.name !== "");
	assert.ok(song_object.text !== "");
	assert.ok(song_object.gaid !== 0);
	assert.ok(Db.open !== false);
	var d = Q.defer();

	var stmt;
	if (typeof song_object.gsid !== "undefined" && song_object.gsid !== 0) {

	    /* Update */

	    stmt = Db.prepare("UPDATE Songs SET gaid=?, name=?, text=? WHERE gsid=?");
	    stmt.run(song_object.gaid, song_object.name, song_object.text, song_object.gsid, function (err) {
		if (err)
		    d.reject(new Error(err));
		d.resolve(song_object.gsid);
	    });
	} else {

	    /* Insert */

	    stmt = Db.prepare("INSERT INTO Songs (gaid, name, text) VALUES (?,?,?)");
	    stmt.run(song_object.gaid, song_object.name, song_object.text, function (err) {
		if (err)
		    d.reject(new Error(err));
		d.resolve(this.lastID);
	    });
	}
	stmt.finalize();
	return d.promise;
    },
    remove_song: function (song_object) {
	assert.ok(typeof song_object.name !== "undefined");
	assert.ok(typeof song_object.gsid !== "undefined");
	assert.ok(song_object.name !== "");
	assert.ok(song_object.gsid !== 0);
	var d = Q.defer();
	var stmt = Db.prepare("DELETE FROM Songs WHERE gsid = ? AND name = ?");
	stmt.run(
		song_object.gsid, song_object.name, function (err) {
		    if (err)
			d.reject(new Error(err));
		    d.resolve(true);
		});
	return d.promise;
    },
    get_version: function () {
	var d = Q.defer();
	var stmt;
	stmt = Db.prepare("SELECT value FROM Parameters WHERE key = 'db_version'");
	stmt.get(function (err, row) {
	    if (err)
		d.reject(new Error(err));

	    d.resolve(row.value);
	});
	stmt.finalize();
	return d.promise;
    },
    step_version: function () {
	var d = Q.defer();
	var stmt;
	console.log("Step");

	this.get_version().then(function (raw_version) {
	    var version = parseInt(raw_version, 10) + 1;
	    stmt = Db.prepare("UPDATE Parameters Set value=? WHERE key = 'db_version'");
	    stmt.run(version, function (err) {
		if (err)
		    d.reject(err);

		console.log(version);
		d.resolve(version);
	    });
	    stmt.finalize();
	});

	return d.promise;
    },
    sync: function () {

    },
//    create_or_update_owner: function (area, owner, alowed_phones) {
//	var d = Q.defer();
//	if (isNaN(area)) {
//	    d.reject("Wrong value");
//	    return;
//	}
//
//	var stmt = Db.prepare("INSERT OR REPLACE INTO Areas VALUES(?,?,?)");
//	stmt.run(area, owner, alowed_phones, function (err) {
//	    if (err)
//		d.reject(new Error(err));
//	    d.resolve();
//	});
//	stmt.finalize();
//	return d.promise;
//    },
//    get_owner_for_area: function (area) {
//	var d = Q.defer();
//	if (isNaN(area)) {
//	    d.reject("Wrong value");
//	    return;
//	}
//
//	var stmt = Db.prepare("SELECT * FROM Areas WHERE area = ? LIMIT 1");
//	stmt.get(area, function (err, row) {
//
//	    if (err)
//		d.reject(err);
//	    console.log("Result 1");
//	    console.log(row);
//	    if (typeof row != "undefined") {
//		var result = {
//		    area: row.area,
//		    owner: row.owner,
//		    alowed_phones: row.alowed_phones
//		};
//		d.resolve(result);
//	    } else {
//		d.reject("owner not founded");
//	    }
//	});
//	stmt.finalize();
//	return d.promise;
//    },
//    find_record_by_md5: function (md5) {
//	var d = Q.defer();
//	var stmt = Db.prepare("SELECT * FROM Information WHERE md5 = ?");
//	stmt.get(md5, function (err, row) {
//	    if (err)
//		d.reject(new Error(err));
//	    console.log("Result 3");
//	    console.log(row);
//	    if (typeof row != "undefined") {
//		d.reject(false);
//	    } else {
//		d.resolve(true);
//	    }
//	});
//	stmt.finalize();
//	return d.promise;
//    },
//    get_last_record_for_area: function (area) {
//	var d = Q.defer();
//	if (isNaN(area)) {
//	    d.reject("Wrong value");
//	    return;
//	}
//
//	var stmt = Db.prepare("SELECT * FROM Information WHERE area = ? AND status = 0 ORDER BY id DESC");
//	stmt.get(area, function (err, row) {
//	    if (err)
//		d.reject(new Error(err));
//	    console.log("Result 2");
//	    console.log(row);
//	    if (typeof row != "undefined") {
//		var result = {
//		    area: row.area,
//		    counter: row.counter
//		};
//		d.resolve(result);
//	    } else {
//		var result = {
//		    area: area,
//		    counter: 0
//		};
//		d.resolve(result);
//	    }
//	});
//	stmt.finalize();
//	return d.promise;
//    },
//    insert_sms: function (phone, message, area, counter, status) {
//
//	/* Validation */
//	var d = Q.defer();
//	var date = Date.now() / 1000 | 0;
//	var message_md5 = md5(message);
//	var stmt = Db.prepare("INSERT INTO Information (date, phone, msg, area, counter, status, md5) VALUES (?,?,?,?,?,?,?)");
//	stmt.run(date, phone, message, area, counter, status, message_md5, function (err) {
//	    if (err)
//		d.reject(new Error(err));
//	    d.resolve(true);
//	});
//	stmt.finalize();
//	return d.promise;
//    },
};