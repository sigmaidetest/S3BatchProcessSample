let AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports = {
    sendNotification: function (subject, message) {
        sns.publish({
            Message: message,
            Subject: subject,
            MessageAttributes: {},
            MessageStructure: 'String',
            TopicArn: 'arn:aws:sns:us-east-1:480964559519:S3BatchProcessNotifications'
        }).promise()
            .then(data => {
                console.log("Successfully published notification");
                return true;
            })
            .catch(err => {
                console.err("Error occurred while publishing notification", err, err.stack);
                throw err;
            });
    }
};
