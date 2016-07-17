module.exports = {
  // accessKeyId:      '',  // optional for loading AWS credientail from custom profile
  // secretAccessKey:  '',  // optional for loading AWS credientail from custom profile
  // profile:          '',  // optional for loading AWS credientail from custom profile
  region:           'us-east-1',
  handler:          'skill/index.handler',
  role:             'arn:aws:iam::339121561524:role/lambda_dynamo',
  functionName:     '', // TODO: fill this with the lambda name you want to use
  timeout:          10,
  memorySize:       128,
};
