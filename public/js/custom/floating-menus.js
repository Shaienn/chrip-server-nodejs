$(document).ready(function () {

    var singers = $('.singers_container');
    var songs = $('.songs_container');
    var song_menu = $('.preview-modes > .panel');
    $(window).resize(function () {

	var p1 = singers.parent().width();
	singers.css('width', p1 + "px");

	var p2 = songs.parent().width();
	songs.css('width', p2 + "px");

	var p3 = song_menu.parent().width();
	song_menu.css('width', p3 + "px");

    });

    $(window).trigger('resize');
});

