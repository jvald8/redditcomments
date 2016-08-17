var request = require(`superagent`);
var exec = require('child_process').exec;
var database = require('./database');

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

								var score = JSON.parse(res.text).data.children[0].data.score;

								var commentText = JSON.parse(res.text).data.children[0].data.body.replace(/["']/g, "");

								var parentId = JSON.parse(res.text).data.children[0].data.parent_id;

								var cmd = `node analyze sentiment "${commentText}"`;

								// limit to scores over 100 for testing

								if(score > 100) {
									exec(cmd, function(err, stdout, stderr) {
										if (err) {throw err;}

										var result = JSON.parse(stdout.split("\n").slice(1,this.length).join("\n")).documentSentiment;

										var commentPolarity = result.polarity;
										var commentMagnitude = result.magnitude;

										var data = {comment: commentText, score: score, parentId: parentId, polarity: commentPolarity, magnitude: commentMagnitude};

										if(stdout) {
											database.storeComments(data, function(err, res) {
												if(err) throw err;

												console.log(res);
											});
										}

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