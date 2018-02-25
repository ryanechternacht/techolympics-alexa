# techolympics-alexa

Welcome to a demo app showing how you can build apps on Amazon's Alexa
platform and deploy them to a real Amazon Alexa (or test them out online). 

## Instructios

For this demo, we'll be using the instructions provided [here](https://developer.amazon.com/alexa-skills-kit/alexa-skill-quick-start-tutorial). 
We'll be making a few modifications, which I've highlighted below. 

### Step 1 Modifications
First off, the lambda API has changed, so steps 5-12 are out of order. 

step 1
5-12 will be out of order
author from scratch, name it
name roll, basic edge lambda permissions
disable skill ID (relevant for production, not our uses)

when you zip up the files, DON'T zip the folder. go into the folder and zip all of the files in it directly
- on unix, cd into the folder and `zip -r alexa.zip *`

go down to function code
- switch to upload
- upload the zip


step 2
8 use intents.json (not the data they provide)
9-11 skip
12 use utterances.txt (not the data they provide)




## testing

when testing, use "four" not "4"

## Dynamo DB

config.json - need this file
config_format.json - these aren't real keys, but should give you an idea what they look like