export function renderTemplate(
  template: string,
  values: Record<string, string>
) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return values[key.trim()] ?? "";
  });
}