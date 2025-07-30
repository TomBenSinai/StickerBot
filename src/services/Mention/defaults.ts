const DEFAULT_OPTIONS = {
    text: "_*An admin has tagged you all*_",
} as const;

type MentionOptions = {
  text?: string;
}

export { MentionOptions, DEFAULT_OPTIONS };
