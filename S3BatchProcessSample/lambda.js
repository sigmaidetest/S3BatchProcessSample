let notificationUtils = require("./NotificationUtils.js");

let AWS = require('aws-sdk');
const s3 = new AWS.S3();
exports.handler = function (event, context, callback) {

	console.log(`Batch process triggered at ${event.time}`);
	notificationUtils.sendNotification("Batch Process Started", `Batch process started at ${event.time}`)

	s3.listObjects({
		'Bucket': 'slapp-batch-process-sample',
		'MaxKeys': 100,
		'Prefix': ''
	}).promise()
		.then(data => {
			let numFiles = data.Contents.length;
			console.log(`${numFiles} files found to process`);
			data.Contents.forEach(file => {
				let fileName = file.Key;
				console.log(`Processing File : ${fileName}`);

				s3.deleteObject({
					'Bucket': "slapp-batch-process-sample",
					'Key': fileName
				}).promise()
					.then(data => {
						console.log(`Successfully deleted file ${fileName}`); 
					})
					.catch(err => {
						console.log(`Failed to delete file : ${fileName}`, err, err.stack);
						callback(err, `Failed to delete file : ${fileName}`);
					});
			});
		})
		.catch(err => {
			console.log("Failed to get file list", err, err.stack); // an error occurred
			callback(err, "Failed to get file list");
		});

	callback(null, 'Successfully executed');
}