/*
 * Host half of the model-config bundle: one browser-reachable probe route.
 *
 * The Client page needs one honest answer to "can this provider/model be
 * reached?", and no shipped Remote performs a model call. This half registers
 * a single POST route that runs one tiny completion through the normal `llm`
 * service, so every registered provider route is testable the same way — the
 * webserver's own trust gate decides whether the request is admitted at all.
 *
 * Type policy: no `any`. The Llm/webserver contracts are declared here as the
 * narrow structural views this plugin actually consumes.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

/** Exact route the Client page posts to. */
const TEST_PATH = "/model-config/test";

/** Open-route request bodies are tiny JSON objects; anything larger is hostile. */
const MAX_BODY_BYTES = 64 * 1024;

/** One probe must settle promptly; a hanging endpoint fails the test instead. */
const PROBE_TIMEOUT_MS = 30000;

/** Minimal prompt: the model only has to answer, so a probe costs a few tokens. */
const PROBE_PROMPT = "Reply with the single word OK.";

/* --------------------------------------------------------------------- llm types */

/** A terminal failure as the adapter reports it. */
interface LlmFailure {
	code?: string;
	message?: string;
}

/** Why a stream finished; only the failure kinds carry a `failure`. */
type FinishReason =
	| { kind: "stop" }
	| { kind: "tool-calls" }
	| { kind: "max-tokens" }
	| { kind: "aborted"; failure: LlmFailure }
	| { kind: "error"; failure: LlmFailure };

/** Token accounting for one call. */
interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
	totalTokens?: number;
	cacheReadTokens?: number;
	cacheWriteTokens?: number;
	reasoningTokens?: number;
}

/** The chunk protocol `llm/stream` yields. */
type StreamChunk =
	| { type: "block-start"; index: number; blockType: string }
	| { type: "text-delta"; index: number; text: string }
	| { type: "reasoning-delta"; index: number; text: string }
	| { type: "tool-call-delta"; index: number; id: string; name?: string; argumentsDelta: string }
	| { type: "block-end"; index: number; block: unknown }
	| { type: "usage"; usage: TokenUsage }
	| { type: "finish"; reason: FinishReason; replayState?: unknown };

/** The request shape this probe sends. */
interface GenerateOptions {
	readonly provider: string;
	readonly model: string;
	readonly messages: readonly LlmRequestMessage[];
	readonly maxTokens?: number;
	readonly signal?: AbortSignal;
}

/** A plain user turn; the probe never sends anything richer. */
interface LlmRequestMessage {
	readonly role: "user";
	readonly content: string;
}

/* -------------------------------------------------------------- host contracts */

interface HostLlmService {
	stream(options: GenerateOptions): AsyncIterable<StreamChunk>;
}

/** One exact browser route. */
interface WebRoute {
	kind: "exact";
	path: string;
	handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
}

interface HostWebServer {
	register(route: WebRoute): () => void;
}

/** The webserver's trust gate: `undefined` admits the request, else a status code. */
interface HostConnection {
	requestRejection(request: IncomingMessage): number | undefined;
}

interface HostContext {
	readonly llm: HostLlmService;
	readonly webServer: HostWebServer;
	readonly connection?: HostConnection;
	effect(callback: () => unknown, label?: string): () => void;
}

/** JSON body this route answers with. */
interface ProbeResponse {
	ok: boolean;
	message: string;
	finish?: string;
	usage?: TokenUsage;
}

/* ---------------------------------------------------------------------- helpers */

/** Whether a decoded value is a plain JSON object. */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Read a thrown value as displayable copy. */
function messageOf(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

/** JSON response (no-store: every probe outcome is a live fact). */
function sendJson(res: ServerResponse, status: number, payload: unknown): void {
	res.statusCode = status;
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.setHeader("cache-control", "no-store");
	res.end(JSON.stringify(payload));
}

/** Read a small JSON request body as text. */
function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		let size = 0;
		req.on("data", (chunk: Buffer) => {
			size += chunk.length;
			if (size > MAX_BODY_BYTES) {
				reject(new Error("request body too large"));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});
}

/** The failure copy a finish reason carries, or its kind as a fallback. */
function failureMessage(reason: FinishReason): string {
	if (reason.kind === "error" || reason.kind === "aborted") {
		const failure = reason.failure;
		if (typeof failure.message === "string" && failure.message.length > 0) return failure.message;
		if (typeof failure.code === "string" && failure.code.length > 0) return failure.code;
	}
	return reason.kind;
}

/**
 * Run one minimal completion against a provider route.
 * A `finish` chunk with a non-error kind proves the endpoint answered; every
 * other outcome is reported as the connectivity failure it is.
 * @param ctx - Host context carrying the `llm` service.
 * @param provider - registered provider route id.
 * @param model - exact model id to call.
 * @returns the probe outcome for the response body.
 */
async function probeModel(ctx: HostContext, provider: string, model: string): Promise<ProbeResponse> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
	let usage: TokenUsage | undefined;
	try {
		const stream = ctx.llm.stream({
			provider,
			model,
			messages: [{ role: "user", content: PROBE_PROMPT }],
			maxTokens: 64,
			signal: controller.signal
		});
		for await (const chunk of stream) {
			if (chunk.type === "usage") {
				usage = chunk.usage;
				continue;
			}
			if (chunk.type === "finish") {
				const reason = chunk.reason;
				if (reason.kind === "error" || reason.kind === "aborted") {
					return { ok: false, message: failureMessage(reason) };
				}
				return usage === undefined
					? { ok: true, message: "", finish: reason.kind }
					: { ok: true, message: "", finish: reason.kind, usage };
			}
		}
		return { ok: false, message: "the model stream ended without a finish chunk" };
	} catch (error) {
		return { ok: false, message: messageOf(error) };
	} finally {
		clearTimeout(timer);
	}
}

/** Required Host services; the row stays inactive without them. */
export const inject = ["llm", "webServer"];

/** Register the probe route for the lifetime of the plugin. */
export function apply(ctx: HostContext): void {
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: TEST_PATH,
		handler: async (req, res) => {
			try {
				const connection = ctx.connection;
				if (connection === undefined) {
					sendJson(res, 503, { ok: false, message: "connection service unavailable" });
					return;
				}
				const rejection = connection.requestRejection(req);
				if (rejection !== undefined) {
					res.statusCode = rejection;
					res.end();
					return;
				}
				if (req.method !== "POST") {
					res.setHeader("allow", "POST");
					sendJson(res, 405, { ok: false, message: "method not allowed" });
					return;
				}
				let decoded: unknown;
				try {
					decoded = JSON.parse(await readBody(req));
				} catch {
					sendJson(res, 400, { ok: false, message: "invalid JSON body" });
					return;
				}
				const body = isRecord(decoded) ? decoded : undefined;
				const provider = typeof body?.provider === "string" ? body.provider : "";
				const model = typeof body?.model === "string" ? body.model : "";
				if (provider.length === 0 || model.length === 0) {
					sendJson(res, 400, { ok: false, message: "provider and model are required" });
					return;
				}
				sendJson(res, 200, await probeModel(ctx, provider, model));
			} catch (error) {
				sendJson(res, 500, { ok: false, message: messageOf(error) });
			}
		}
	}), "model-config: POST /model-config/test");
}
