/**
 * Does nothing.
 * Used to enable syntax highlighting for HTML in VSCode, e.g. with the "lit-html" extension
 * Code fetched from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#raw_strings
 * @param strings
 * @param values
 * @returns
 */
export function html(strings: TemplateStringsArray, ...values: any[]): string {
  return String.raw({ raw: strings }, ...values);
}
