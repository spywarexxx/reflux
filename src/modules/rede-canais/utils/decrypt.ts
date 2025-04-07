export function decrypt(html: string): string {
  const scriptMatch = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) return html;

  const mock = 'var document = { write: function (value) { return value; } };';
  const scriptContent = scriptMatch[1];

  return String(eval(mock.concat(scriptContent)));
}
