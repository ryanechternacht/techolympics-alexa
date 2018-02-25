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
            //TODO switch to the right response based on how good the grade is 
            // e.g. a >=90 'great grade'. <=60 'bad grade'. 
            if(grade<=69){
                self.emit("BadGradeResponse")
            } 
            else if(grade<=89){
                self.emit("OkGradeResponse")
            }
            else {
                self.emit("GreatGradeResponse")
            }
            // self.emit('state')

        };

        saveGrade(subject, grade, onSuccess, onFailure);
    },
    'GreatGradeResponse': function() {
        this.response.speak("Amazing! Someone took their NyQuill this morning");
        this.emit(':responseReady');
        // this.emit(':responseReady');
    },
    'OkGradeResponse': function() {
        this.response.speak("Eh, that's alright I guess.... Try harder");
        this.emit(':responseReady');
    },
    'BadGradeResponse': function() {
        this.response.speak("Nice try. We'll get 'em next time boys. Oof");
        this.emit(':responseReady');
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