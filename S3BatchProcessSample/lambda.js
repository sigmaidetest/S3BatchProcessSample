let AWS = require('aws-sdk');
// let notificationUtils = require("./NotificationUtils.js");

const sns = new AWS.SNS();
const s3 = new AWS.S3();
exports.handler = function (event, context, callback) {

	console.log(`Batch process triggered at ${event.time}`);
	// sendNotification("Batch Process Started", `Batch process started at ${event.time}`)

	s3.listObjects({
		'Bucket': 'slapp-batch-process-sample',
		'MaxKeys': 100,
		'Prefix': ''
	}).promise()
		.then(data => {
			let numFiles = data.Contents.length;
			let successCount = 0;
			let failedCount = 0;

			console.log(`${numFiles} files found to process`);

			data.Contents.forEach(file => {
				let fileName = file.Key;
				console.log(`Processing File : ${fileName}`);

				s3.deleteObject({
					'Bucket': "slapp-batch-process-sample",
					'Key': fileName
				}, (err, data) => {
					if (err) {
						console.log(`Failed to delete file : ${fileName}`, err, err.stack);
						failedCount++;
					} else {
						console.log(`Successfully deleted file ${fileName}`);
						successCount++;
					}

					if ((successCount + failedCount) == numFiles) {
						// This is the last file
						let message = `Processing finished. ${successCount} successful and ${failedCount} failed`;

						sns.publish({
							Message: message,
							Subject: 'Processing Finished',
							MessageAttributes: {},
							MessageStructure: 'String',
							TopicArn: 'arn:aws:sns:us-east-1:480964559519:S3BatchProcessNotifications'
						}).promise()
							.then(data => {
								console.log("Successfully published notification");
								callback(null, "Processing finished & Notification sent");
							})
							.catch(err => {
								console.log("Error occurred while publishing notification", err, err.stack);
								callback(null, "Processing finished & Notification failed");
							});
					}
				});
			});
		})
		.catch(err => {
			console.log("Failed to get file list", err, err.stack); // an error occurred
			let message = `Message processing failed due to : ${err}`;
			sns.publish({
				Message: message,
				Subject: 'Processing Failed',
				MessageAttributes: {},
				MessageStructure: 'String',
				TopicArn: 'arn:aws:sns:us-east-1:480964559519:S3BatchProcessNotifications'
			}).promise()
				.then(data => {
					console.log("Successfully published notification");
					callback(err, "Failed to get file list");
				})
				.catch(err => {
					console.log("Error occurred while publishing notification", err, err.stack);
					callback(err, "Failed to get file list");
				});
		});
}

