require('dotenv').config();
// require the .env variables

var fs = require(`fs`);
var request = require(`superagent`);
var json2csv = require(`json2csv`);
var moment = require(`moment`);
var cheerio = require(`cheerio`);
var async = require('async');
var comments = require('./comments');


var redditClientId = process.env.REDDIT_CLIENT_ID;
var redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
var redditUsername = process.env.REDDIT_USERNAME;;
var redditPassword = process.env.REDDIT_PASSWORD;

request
	.post(`https://www.reddit.com/api/v1/access_token`)
	.type('form')
	.send({"grant_type":"password", "username":redditUsername, "password":redditPassword})
	.auth(`${redditClientId}`,`${redditClientSecret}`)
	.set(`User-Agent`, `TestingRedditAPI/0.1 by jvald8`)
	.end(function(err, res) {
		if(err || !res.ok || res.err) console.log(err || res.err);

		var redditToken = res.body.access_token;
		console.log(redditToken);

		request
		.get(`https://reddit.com`)
		.end(function(err, res) {
			if(err || res.err) {
				console.log(err || res.err)
			} else {

				console.log("Status code: " + res.statusCode);

				var $ = cheerio.load(res.text);

				var arrayOfCommentLinksIds = [];

				$(`div#siteTable > div.link`)
				.each(function(index) {
					var commentsLink  = $(this).find(`.first a`).attr('href').trim();

					var slashIndex = commentsLink.indexOf(`/comments/`) + 10;

					var commentsLinkId = commentsLink.substring(slashIndex, slashIndex + 6);

					arrayOfCommentLinksIds.push(commentsLinkId);

				});

				async.map(arrayOfCommentLinksIds, comments.getComments(redditToken))

			}
		})
	})




