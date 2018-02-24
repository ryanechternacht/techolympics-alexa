var Alexa = require('alexa-sdk'), 
    _ = require('underscore'), 
    AWS = require('aws-sdk'),
    DOC = require('dynamodb-doc');

var onFailure = function () {
    self.emit(':tell', 'Something went wrong. Sorry');
};

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function() {
        this.emit('Welcome');
    },
    'Welcome': function() {
        var message = 'Tell me about a test you just completed. Or ask for your grade in a specific subject.'

        this.response.speak(message);
        this.emit(':responseReady');
    },
    'RecordTestIntent': function () { 
        var grade = parseInt(this.event.request.intent.slots.grade.value);
        var subject = this.event.request.intent.slots.subject.value;

        console.log('RecordTestIntent', grade, subject);
        var self = this;
        var onSuccess = function () {
            //TODO add in personalized messages for grade 
            // e.g. a >=90 'good job'. <=60 'ouch'. hi 
            if (grade >= 90){
                self.emit(':tell', 'Good job!');
            }
            else if (grade < 60){
                self.emit(':tell', 'You suck.');
            }
            else{
                self.emit(':tell', 'Got it. Thanks.')
            }
        };

        saveGrade(subject, grade, onSuccess, onFailure);
    },
    'GetGradeIntent': function () {
        var subject = this.event.request.intent.slots.subject.value;

        console.log('GetGradeIntent', subject);
        var self = this;
        var onSuccess = function (grades, average) {
            console.log('done saving');
            //TODO convert this to a letter grade as well 
            // e.g. a >=90 'Thats an A'
            if(grades) {
                var message = 'In ' + subject + ' you currently have a ' + average + ' over ' + grades + ' tests';
                self.emit(':tell', message);
            } else {
                var message = "You don't have any grades recorded for " + subject;
                self.emit(':tell', message);
            }
        };

        getGrade(subject, onSuccess, onFailure);
    }
};

function saveGrade(subject, grade, onSuccess, onFailure) {
    AWS.config.loadFromPath('./config.json');
    
    var docClient = new DOC.DynamoDB();

    // get existing subject data (if any)
    var params = {};
    params.TableName = 'techolympics';
    params.Key = { subject: subject };

    var doc = docClient.getItem(params, function (err, doc) {
        if (err) {
            console.log(err, doc);
            onFailure();
        } else {
            var item = doc && doc.Item;
            if (!item) {
                item = {
                    subject: subject,
                    scores: []
                };
            }

            item.scores.push(grade);

            var params = {
                Item: item,
                TableName: 'techolympics'
            };

            docClient.putItem(params, function (err2, doc2) {
                if (err2) {
                    console.log(err2, doc2);
                    onFailure();
                } else {
                    onSuccess();
                }
            });
        };
    });
}

function getGrade(subject, onSuccess, onFailure) {
    AWS.config.loadFromPath('./config.json');
    
    var docClient = new DOC.DynamoDB();

    // get existing subject data (if any)
    var params = {};
    params.TableName = 'techolympics';
    params.Key = { subject: subject };

    var doc = docClient.getItem(params, function (err, doc) {
        if (err) {
            console.log(err, doc);
            onFailure();
        } else {
            var item = doc && doc.Item;
            if (!item || item.scores.length == 0) {
                onSuccess(0);
            } else {
                var sum = _.reduce(item.scores, (sum, x) => sum + x);
                var grades = item.scores.length;
                var average = Math.round(sum / grades);
                onSuccess(grades, average);
            }
        }
    });
}