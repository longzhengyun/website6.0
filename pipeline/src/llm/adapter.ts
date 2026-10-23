/* 提供商适配层接口契约 —— 转写自 shared/website6.0-impl-backend-pipeline.md §3（后端维护）。
 * 上游管线只依赖 completeJson；换提供商 = 换实现文件 + 改 LLM_PROVIDER / LLM_MODEL 两个环境变量。
 * 具体实现（Gemini REST 默认 / OpenAI 兼容备选）由后端在实施期提交；密钥只从 env 读取，绝不入库、绝不出现在日志。
 * 本目录独立于 Astro 站点源码，不进站点构建输入。 */

export interface LlmCompleteRequest {
  /** prompt 模板固定段（pipeline/prompts/news-enrichment.md） */
  system: string;
  /** JSON 序列化的本批条目 */
  user: string;
  /** 期望的输出结构（用于结构化输出/约束解码） */
  jsonSchema?: object;
  /** 预算：单批输出上限，见 pipeline.md §3 token 预算常量 */
  maxOutputTokens: number;
  /** 固定 0.2 */
  temperature?: number;
  /** 默认 90_000 */
  timeoutMs?: number;
}

export type LlmCompleteResult =
  | { ok: true; json: unknown; usage: { inputTokens: number; outputTokens: number } }
  | { ok: false; error: string };

export interface LlmAdapter {
  completeJson(req: LlmCompleteRequest): Promise<LlmCompleteResult>;
}

/** 环境变量约定（Actions Secret / 变量注入，红线：LLM_API_KEY 仅存在于 Secrets） */
export const LLM_ENV = {
  provider: 'LLM_PROVIDER', // 默认 gemini；站主选定千问时填 tongyi（大小写不敏感，脚本内 toLowerCase）
  model: 'LLM_MODEL', // 可选覆盖：gemini 默认 gemini-2.5-flash（兼容旧 GEMINI_MODEL env），tongyi 默认 qwen-flash
  apiKey: 'LLM_API_KEY', // Actions Secret，绝不写进 URL/日志；错误路径统一 replaceAll(key,'[REDACTED]')
  baseUrl: 'LLM_BASE_URL', // 仅 tongyi 分支：兼容模式端点覆盖（站主按量付费域名）；未设= dashscope 默认；只接受 https，尾斜杠归一化
  tokenBudget: 'LLM_TOKEN_BUDGET', // 可选：单 run 累计 input+output token 上限（防超额）；未设/≤0=不限；批次粒度检查
} as const;

/**
 * tongyi（千问/通义）实现契约 —— OpenAI 兼容模式，scripts/news-pipeline.mjs 内 llmCompleteTongyi 为参考实现：
 * - POST {LLM_BASE_URL||https://dashscope.aliyuncs.com/compatible-mode/v1}/chat/completions
 *   （站主按量付费端点 https://maas.qianwenaiapi.com/compatible-mode/v1 已假 key 实测：401 invalid_api_key，
 *   OpenAI 标准错误 JSON，兼容成立，请求构造与 dashscope 一致）
 * - headers: Authorization: Bearer <LLM_API_KEY>（key 不进 URL；仅允许 https 出网）
 * - body: { model, messages: [{role:'system'},{role:'user'}], temperature: 0.2, max_tokens, response_format: { type: 'json_object' } }
 * - 解析: choices[0].message.content → JSON.parse；usage.prompt_tokens / completion_tokens
 * - 兼容模式不支持 responseSchema：结构约束由 SYSTEM_PROMPT + 管线应用层 postValidate 五条规则兜底，
 *   与 gemini 分支共用同一后校验，契约（news.schema.json）不因 provider 漂移。
 * - 防超额：每批开跑前核 stats.llm.input_tokens+output_tokens 与 LLM_TOKEN_BUDGET，
 *   超限停后续批次并置 stats.llm.budget_exceeded=true + stats.errors 记录；token 计量为成功批口径（重试消耗不可观测）。
 */
export const TONGYI_COMPAT = {
  defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  defaultModel: 'qwen-flash',
  structuredOutput: 'response_format json_object（无 schema 约束，靠 postValidate）',
} as const;
