'use strict';

module.exports = {
  toSSML,
};

function toSSML(statement) {
  if (!statement) return undefined;
  if (statement.lastIndexOf('<speak>', 0) >= 0) return statement; // lastIndexOf is a pre Node v6 idiom for startsWith
  statement = statement.replace(/&/g, '&amp;'); // Hack. Full xml escaping would be better, but the & is currently the only special character used.
  return `<speak>${statement}</speak>`;
}

