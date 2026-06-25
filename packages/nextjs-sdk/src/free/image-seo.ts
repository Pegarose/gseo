import { applyTemplate } from './templates';

export interface ImageSeoInput {
  title: string;
  alt?: string;
  filename?: string;
}

export interface ImageSeoRules {
  enabled: boolean;
  altTemplate: string;
  titleTemplate: string;
}

export function resolveImageSeoAttributes(
  input: ImageSeoInput,
  rules: ImageSeoRules
): { alt: string; title: string } {
  if (!rules.enabled) {
    return {
      alt: input.alt ?? input.title,
      title: input.title,
    };
  }

  const vars = { title: input.title, filename: input.filename ?? input.title };
  return {
    alt: input.alt ?? applyTemplate(rules.altTemplate, vars),
    title: applyTemplate(rules.titleTemplate, vars),
  };
}
