// Import libraries/requires
var _ = require('underscore');
var models = require('../models');

// Grab the account statistics model
var Statistics = models.Statistics;

// Creates the game page
var gamePage = function(req, res) {
	
	// Attempt to return a page containing the user's domos
	Statistics.StatisticsModel.findByOwner(req.session.account._id, function(err, docs) {
		
		// catch errors creating the page
		if (err) {
			console.log(err);
			return res.status(400).json({ error: "An error occurred creating your game page" });
		}
		
		res.render('game', { csrfToken: req.csrfToken(), stats: docs });
	});
};

module.exports.gamePage = gamePage;