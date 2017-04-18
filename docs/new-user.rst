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

`````````````````````````````````````````
What Kind of Skill Do You Want to Create?
`````````````````````````````````````````
The first step in building a new skill is to decide what your skill will do. The functionality you want to implement determines how your skill integrates with the Alexa service and what you need to build. 

``````````````````````````````````````
What Do I Build When Creating a Skill?
``````````````````````````````````````
You create a cloud-based service that handles the requests for the skill type and host it in the cloud. The Alexa service routes incoming requests to the appropriate service.

Different types of skills require different types of services:

For a custom skill, you code either an AWS Lambda function or a web service:

* AWS Lambda (an Amazon Web Services offering) is a service that lets you run code in the cloud without managing servers. Alexa sends your code user requests and your code can inspect the request, take any necessary actions (such as looking up information online) and then send back a response. You can write Lambda functions in Node.js, Java, Python, or C#.

* Alternatively, you can write a web service and host it with any cloud hosting provider. The web service must accept requests over HTTPS. In this case, Alexa sends requests to your web service and your service takes any necessary actions and sends back a response. You can write your web service in any language.

* Regardless of how you create your service, you also create a custom interaction model for the skill. This defines the requests the skill can handle and the words users can say to invoke those requests.

For a skill that controls smart home devices such as lights and thermostats, you can use the Smart Home Skill API. In this case, you develop a skill adapter that accepts device directives from Alexa:

* You code your skill adapter as an AWS Lambda function.
* Your adapter receives requests in the form of device directives to control a particular device. Your code then handles the request appropriately (for example, by turning on the requested light).
* All voice interactions with the user are handled by the Smart Home Skill API. You don’t need to define the words users say to use the skill.

For a skill that provides content such as news, lists, or comedy for a customer’s flash briefing, you can use the Content Skill API. In this case, you create the skill in the developer portal and configure one or more JSON or RSS feeds that contain the content:

* To receive your content as a part of their flash briefing, a customer enables your flash briefing skill in the Alexa app, and turns on one or more content feeds.
* All voice interactions with the user are handled by the Content Skill API. You don’t need to define the words users say to use the skill.
* You supply one or more reliable content feeds in RSS or JSON format. The content can be audio content that Alexa plays to the customer, or text content that Alexa reads to the customer. You should own the content or have the rights to distribute it.


--------------------------------
Amazon Developer Service Account
--------------------------------
Amazon Web Services provides a suite of solutions that enable developers and their organizations to leverage Amazon.com's robust technology infrastructure and content via simple API calls. 

The first thing you need to do is create your own `Amazon Developer Account <https://developer.amazon.com>`_.

--------------------------
Registering an Alexa skill
--------------------------
Registering a new skill or ability on the Amazon Developer Portal creates a configuration containing the information that the Alexa service needs to do the following:

* Route requests to the AWS Lambda function or web service that implements the skill.
* Display information about the skill in the Amazon Alexa App. The app shows all published skills, as well as all of your own skills currently under development.

You must register a skill before you can test it with the Service Simulator in the developer portal or an Alexa-enabled device.

Follow `these instructions <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/registering-and-managing-alexa-skills-in-the-developer-portal#registering-an-alexa-skill>`_ to register and managing your Alexa skill.
