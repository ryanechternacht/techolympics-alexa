'use strict';
const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function() {
        this.emit('Welcome');
    },
    'StartIntent': function() {
        this.emit('Welcome');
    },
    'Welcome': function() {
        this.attributes["number"] = Math.floor(Math.random() * 10);
        
        this.response.speak("Hello. Welcome to the Guess the Number. " + 
            "I've chosen a number between 1 and 10. Make a guess.")
            .listen("Please make a guess");
        this.emit(':responseReady');
    },
    'GuessIntent': function() {
        var guess = this.event.request.intent.slots.answer.value;

        if(guess > this.attributes.number) {
            this.emit('TooHigh');
        } else if(guess < this.attributes.number) { 
            this.emit('TooLow');
        } else if(guess == this.attributes.number) {
            this.emit('Correct');
        }
    },
    'TooHigh': function() {
        this.response.speak("That's too high. Guess again.")
            .listen("Guess again.");
        this.emit(":responseReady");
    },
    'TooLow': function() {
        this.response.speak("Nope, too low. Please guess again.")
            .listen("Please guess again.");
        this.emit(":responseReady");
    },
    'Correct': function() {
        this.response.speak("Great job. Let's play again sometime");
        this.emit(":responseReady");
    }
};

