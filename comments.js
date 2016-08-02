var request = require(`superagent`);

exports.getComments = function(redditToken) {
	return function(postId) {
		request
		.get(`https://oauth.reddit.com/comments/${postId}?limit=1`)
		.set(`Authorization`, `bearer ${redditToken}`)
		.set(`User-Agent`, `TestingRedditAPI/0.1 by jvald8`)
		.end(function(err, res) {
			if(err || !res.ok) {
				console.log(err || res.err);
			} else {
				// gets the comment for this api call:https://oauth.reddit.com/comments/4v7doz/skyrim_at_its_best?limit=2
				console.log({'id': postId, 'comment': res.body[1].data.children[0].data.body});
			}
		})
	}
}