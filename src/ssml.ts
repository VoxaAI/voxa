export function toSSML(statement: string): string|undefined {
  if (!statement) { return undefined; }
  if (statement.startsWith("<speak>")) { return statement; }

  // Hack. Full xml escaping would be better, but the & is currently the only special character used.
  statement = statement.replace(/&/g, "&amp;");
  return `<speak>${statement}</speak>`;
}
