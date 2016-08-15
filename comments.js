var request = require(`superagent`);
var exec = require('child_process').exec;

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

								var comment = JSON.parse(res.text).data.children[0].data.body.replace(/["']/g, "");

								var cmd = `node analyze sentiment "${comment}"`;

								exec(cmd, function(err, stdout, stderr) {
									if (err) {throw err;}

									var result = JSON.parse(stdout.split("\n").slice(1,this.length).join("\n")).documentSentiment;

									var commentPolarity = result.polarity;
									var commentMagnitude = result.magnitude;

									console.log(`score: ${score}`)
									console.log(`{comment: ${comment}, sentiment: ${stdout}}`);

									console.log(`commentPolarityScoreTotal: ${commentPolarity * score}`);
									console.log(`commentMagnitudeScoreTotal: ${commentMagnitude * score}`);

								})


							}
						});
					}}(i), i * 1000);
				}

			}
		})
	}
}