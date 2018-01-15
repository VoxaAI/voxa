export declare const views: {
    "en-US": {
        translation: {
            Card: {
                image: {
                    largeImageUrl: string;
                    smallImageUrl: string;
                };
                title: string;
                type: string;
            };
            Hint: string;
            RenderTemplate: {
                template: {
                    backButton: string;
                    backgroundImage: string;
                    textContent: {
                        primaryText: {
                            text: string;
                            type: string;
                        };
                        secondaryText: {
                            text: string;
                            type: string;
                        };
                        tertiaryText: {
                            text: string;
                            type: string;
                        };
                    };
                    title: string;
                    token: string;
                    type: string;
                };
                type: string;
            };
            LaunchIntent: {
                OpenResponse: {
                    tell: string;
                    dialogFlow: {
                        tell: string;
                    };
                };
            };
            RandomResponse: {
                tell: string[];
            };
            Question: {
                Ask: {
                    ask: string;
                    reprompt: string;
                };
            };
            ExitIntent: {
                Farewell: {
                    tell: string;
                };
            };
            Number: {
                One: {
                    tell: string;
                };
            };
            Say: {
                Say: {
                    say: string;
                };
            };
            HelpIntent: {
                HelpAboutSkill: {
                    tell: string;
                };
            };
            Count: {
                Say: {
                    say: string;
                };
                Tell: {
                    tell: string;
                };
            };
            Playing: {
                SayStop: {
                    ask: string;
                };
            };
            BadInput: {
                RepeatLastAskReprompt: {
                    say: string;
                };
            };
        };
    };
    "de-DE": {
        translation: {
            LaunchIntent: {
                OpenResponse: {
                    tell: string;
                };
            };
            RandomResponse: {
                tell: string[];
            };
            Question: {
                Ask: {
                    ask: string;
                };
            };
            ExitIntent: {
                Farewell: {
                    tell: string;
                };
            };
            Number: {
                One: {
                    tell: string;
                };
            };
            Say: {
                Say: {
                    say: string;
                };
            };
        };
    };
};
