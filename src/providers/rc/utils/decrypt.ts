export function decrypt(html: string): string {
  const content = String(html);
  const match = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return content;

  const mock =
    'var document = undefined; var document = { write: function (value) { return value; } };';
  const script = match[1];

  return String(eval(mock.concat(script)));
}
