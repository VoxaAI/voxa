function getEnv() {
  if (process.env.NODE_ENV) return process.env.NODE_ENV;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (process.env.AWS_LAMBDA_FUNCTION_NAME == '') return 'production'; // TODO put your own lambda function name here
    else return 'staging';
  }

  return 'local';
}

module.exports = getEnv();
