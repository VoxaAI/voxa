function getEnv() {
  if (process.env.NODE_ENV) return process.env.NODE_ENV;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // TODO put your own lambda function name here
    if (process.env.AWS_LAMBDA_FUNCTION_NAME == '') return 'production';
    else return 'staging';
  }

  return 'local';
}

module.exports = getEnv();
