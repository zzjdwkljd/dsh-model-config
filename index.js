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
/** Exact route the Client page posts to. */
const TEST_PATH = "/model-config/test";
/** Open-route request bodies are tiny JSON objects; anything larger is hostile. */
const MAX_BODY_BYTES = 64 * 1024;
/** One probe must settle promptly; a hanging endpoint fails the test instead. */
const PROBE_TIMEOUT_MS = 30000;
/** Minimal prompt: the model only has to answer, so a probe costs a few tokens. */
const PROBE_PROMPT = "Reply with the single word OK.";
/* ---------------------------------------------------------------------- helpers */
/** Whether a decoded value is a plain JSON object. */
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Read a thrown value as displayable copy. */
function messageOf(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
/** JSON response (no-store: every probe outcome is a live fact). */
function sendJson(res, status, payload) {
    res.statusCode = status;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end(JSON.stringify(payload));
}
/** Read a small JSON request body as text. */
function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        req.on("data", (chunk) => {
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
function failureMessage(reason) {
    if (reason.kind === "error" || reason.kind === "aborted") {
        const failure = reason.failure;
        if (typeof failure.message === "string" && failure.message.length > 0)
            return failure.message;
        if (typeof failure.code === "string" && failure.code.length > 0)
            return failure.code;
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
async function probeModel(ctx, provider, model) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    let usage;
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
    }
    catch (error) {
        return { ok: false, message: messageOf(error) };
    }
    finally {
        clearTimeout(timer);
    }
}
/**
 * Required Host services; the row stays inactive without them.
 * `connection` must be listed: the context proxy refuses to resolve a service
 * the fiber never injected, so the trust gate below cannot be reached without it.
 */
export const inject = ["llm", "webServer", "connection"];
/** Register the probe route for the lifetime of the plugin. */
export function apply(ctx) {
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
                let decoded;
                try {
                    decoded = JSON.parse(await readBody(req));
                }
                catch {
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
            }
            catch (error) {
                sendJson(res, 500, { ok: false, message: messageOf(error) });
            }
        }
    }), "model-config: POST /model-config/test");
}
