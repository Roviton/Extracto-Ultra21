export const AI_MODELS = {
  OPENAI_GPT4O: "gpt-4o",
  ANTHROPIC_CLAUDE: "claude-3-5-sonnet-20241022",
  OPENAI_GPT4O_MINI: "gpt-4o-mini",
} as const

export const AI_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
} as const

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS]
export type AIProvider = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS]

export interface AIConfig {
  defaultTextModel: AIModel
  defaultVisionModel: AIModel
  fallbackModel: AIModel
  maxRetries: number
  timeout: number
}

export const defaultAIConfig: AIConfig = {
  defaultTextModel: AI_MODELS.OPENAI_GPT4O,
  defaultVisionModel: AI_MODELS.OPENAI_GPT4O,
  fallbackModel: AI_MODELS.ANTHROPIC_CLAUDE,
  maxRetries: 3,
  timeout: 30000,
}
