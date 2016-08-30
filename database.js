require('dotenv').config();
// require the .env variables

var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DB,
	port: process.env.MYSQL_PORT
});

exports.storeComments = function(data, cb) {

	pool.getConnection(function(err, connection) {
		connection.query(`INSERT INTO comments VALUES (null, "${data.comment}", 
															  ${data.score}, 
															 "${data.parentId}", 
															  ${data.polarity}, 
															  ${data.magnitude},
															  "${data.subredditId}",
															  "${data.linkId}",
															  "${data.comment_id}",
															  "${data.author}",
															  ${data.ups},
															  ${data.downs},
															  "${data.created}")`, function(err, rows, fields) {
			if (err) throw err;

			console.log(`${data.comment} added to comments table`);

			connection.release();
		});
	});
	
	return cb;
}