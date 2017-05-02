==============================================
New Alexa developer
==============================================
If the skills development for alexa is a new thing for you, we have some suggestion to get you deep into this world.

-------------------------------------
Getting Started with the Alexa Skills
-------------------------------------
Alexa provides a set of built-in capabilities, referred to as skills. For example, Alexa’s abilities include playing music from multiple providers, answering questions, providing weather forecasts, and querying Wikipedia.

The Alexa Skills Kit lets you teach Alexa new skills. Customers can access these new abilities by asking Alexa questions or making requests. You can build skills that provide users with many different types of abilities. For example, a skill might do any one of the following:

* Look up answers to specific questions (“Alexa, ask tide pooler for the high tide today in Seattle.”)
* Challenge the user with puzzles or games (“Alexa, play Jeopardy.”)
* Control lights and other devices in the home (“Alexa, turn on the living room lights.”)
* Provide audio or text content for a customer’s flash briefing (“Alexa, give me my flash briefing”)

You can see the different types of skills `here <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/understanding-the-different-types-of-skills>`_ to got more deep reference.

`````````````````````````````````````````
How users interact with Alexa?
`````````````````````````````````````````
With Interaction Model. 

End users interact with all of Alexa’s abilities in the same way – by waking the device with the wake word (or a button for a device such as the Amazon Tap) and asking a question or making a request.

For example, users interact with the built-in Weather service like this:

User: Alexa, what’s the weather?
Alexa: Right now in Seattle, there are cloudy skies…

In the context of Alexa, an interaction model is somewhat analogous to a graphical user interface in a traditional app. Instead of clicking buttons and selecting options from dialog boxes, users make their requests and respond to questions by voice.

`Here you can see how the interaction model works <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/understanding-how-users-interact-with-skills>`_

--------------------------------
Amazon Developer Service Account
--------------------------------
Amazon Web Services provides a suite of solutions that enable developers and their organizations to leverage Amazon.com's robust technology infrastructure and content via simple API calls. 

The first thing you need to do is create your own `Amazon Developer Account <https://developer.amazon.com>`_.

--------------------------
Registering an Alexa skill
--------------------------
Registering a new skill or ability on the Amazon Developer Portal creates a configuration containing the information that the Alexa service needs to do the following:

* Route requests to the AWS Lambda function or web service that implements the skill, or for development purpose you can run it locally using `ngrok <https://ngrok.com>`_.
* Display information about the skill in the Amazon Alexa App. The app shows all published skills, as well as all of your own skills currently under development.

You must register a skill before you can test it with the Service Simulator in the developer portal or an Alexa-enabled device.

Follow `these instructions <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/registering-and-managing-alexa-skills-in-the-developer-portal#registering-an-alexa-skill>`_ to register and managing your Alexa skill.
