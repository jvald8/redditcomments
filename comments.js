var request = require(`superagent`);
var exec = require('child_process').exec;
var database = require('./database');
var moment = require('moment');
var sentiment = require('sentiment');

exports.getComments = function(redditToken) {
	return function(postId) {
		request
		.get(`https://oauth.reddit.com/comments/${postId}?limit=1`)
		.set(`Authorization`, `bearer ${redditToken}`)
		.set(`User-Agent`, `TestingRedditAPI/0.2 by jvald8`)
		.end(function(err, res) {
			if(err || !res.ok) {
				console.log(err || res.err);
			} else {

 				var commentArray = res.body[1].data.children[1].data.children;

				for(i = 0; i < commentArray.length; i++) {

					setTimeout(function(x) {return function() {request
						.get(`https://oauth.reddit.com/api/info.json?id=t1_${commentArray[x]}`)
						.set(`Authorization`, `bearer ${redditToken}`)
						.set(`User-Agent`, `TestingRedditAPI/0.1 by jvald8`)
						.end(function(err, res) {
							if(err || !res.ok) {
								console.log(err || res.err);
							} else {

								var data = JSON.parse(res.text).data.children[0].data,
									score = data.score,
									commentText = data.body.replace(/["']/g, ""),
									parentId = data.parent_id,
									subreddit_id = data.subreddit_id,
									link_id = data.link_id,
									comment_id = data.id,
									author = data.author,
									ups = data.ups,
									downs = data.downs,
									created = data.created;

								if(score > 100) {
									var commentPolarity = sentiment(commentText).score;

									var commentMagnitude = sentiment(commentText).comparative;

									var data = {comment: commentText,
												score: score,
												parentId: parentId, 
												polarity: commentPolarity, 
												magnitude: commentMagnitude,
												subredditId: subreddit_id,
												linkId: link_id,
												comment_id: comment_id,
												author: author,
												ups: ups,
												downs: downs,
												created: created};

									database.storeComments(data, function(err, res) {
										if (err) throw err;

										res.end();
									})
								}
							}
						});
					}}(i), i * 1000);
				}

			}
		})
	}
}