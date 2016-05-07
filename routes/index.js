/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
    views: importRoutes('./views'),
    api: importRoutes('./api')
};

// Setup Route Bindings
exports = module.exports = function (app) {

    // Views
    app.get('/', routes.views.index);
    app.get('/blog/:category?', routes.views.blog);
    app.get('/blog/post/:post', routes.views.post);
    app.get('/gallery', routes.views.gallery);
    app.all('/contact', routes.views.contact);
    app.all('/sync', routes.views.sync);
    app.get('/startSync', routes.views.start_sync);


    app.get('/api/songbase/get_version', keystone.middleware.api, routes.api.base.get_songbase_version);
    app.get('/api/songbase/get_database', keystone.middleware.api, routes.api.base.get_songbase);
    app.post('/api/song/add', keystone.middleware.api, routes.api.base.song_add);

//    app.get('/ajax/:singer/songs', routes.views.partials.songs);
//    app.get('/ajax/:singer/songs/:song', routes.views.partials.song);
//    app.get('/ajax/:singer/songs/:song/:scale', routes.views.partials.song);



    app.get('/:singer/songs/:song/:scale', routes.views.song);
    app.get('/:singer/songs/:song', routes.views.song);
    app.get('/:singer/songs', routes.views.songs);

    // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
    // app.get('/protected', middleware.requireUser, routes.views.protected);

};
