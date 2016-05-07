// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');
var path = require('path');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
    'name': 'Chrip',
    'brand': 'Chrip',
    'less': 'public',
    'static': 'public',
    'favicon': 'public/favicon.ico',
    'views': 'templates/views',
    'view engine': 'jade',
    'auto update': true,
    'session': true,
    'auth': true,
    'user model': 'User',
    /* Custom */

    'database': __dirname + path.sep + 'database.js',
    'database_file': __dirname + path.sep + 'db' + path.sep + 'global.db',
    'chord_pattern': /(\[[\w\/#1-9\-+]+\])/g,
    'slide_part': {
	init: "{sos}",
	end: "{eos}",
	pattern: /\{(?:sos|start_of_slide)\}([\w\s\W\S]+?)\{(?:eos|end_of_slide)\}/g
    },
    'song_parts_patterns': {
	chorus: {
	    name: "chorus",
	    init: "{soc}",
	    end: "{eoc}",
	    pattern: /\{(?:soc|start_of_chorus)\}([\w\s\W\S]+?)\{(?:eoc|end_of_chorus)\}/
	},
	bridge: {
	    name: "bridge",
	    init: "{sob}",
	    end: "{eob}",
	    pattern: /\{(?:sob|start_of_bridge)\}([\w\s\W\S]+?)\{(?:eob|end_of_bridge)\}/
	},
	verse: {
	    name: "verse",
	    init: "",
	    end: "",
	    pattern: /([\w\s\W\S]+)/
	}
    },
});

var db = require(__dirname + path.sep + 'database.js');
db.open();
// Load your project's Models

keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
    _: require('underscore'),
    env: keystone.get('env'),
    utils: keystone.utils,
    editable: keystone.content.editable
});

// Load your project's Routes

keystone.set('routes', require('./routes'));

// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
    'posts': ['posts', 'post-categories'],
    'galleries': 'galleries',
    'enquiries': 'enquiries',
    'users': 'users'
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();
