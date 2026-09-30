/*
 * Host half of the model-config bundle: two browser-reachable routes.
 *
 * The Client page needs one honest answer to "can this provider/model be
 * reached?", and no shipped Remote performs a model call. This half registers
 * a POST route that runs one tiny completion through the normal `llm` service,
 * so every registered provider route is testable the same way — the
 * webserver's own trust gate decides whether the request is admitted at all.
 *
 * The export feature needs the one fact the Client half cannot reach: the
 * VALUE behind a provider's `apiKeyEnv` reference. Shipped Remotes only
 * describe a credential (`configured`/`source`), never return it, so a second
 * POST route resolves references through the Host `credentials` service. That
 * route is deliberately narrow: a name is only resolvable when the settings
 * document itself references it, so the route can never be turned into a
 * "read any secret by name" oracle.
 *
 * Type policy: no `any`. The Llm/webserver/settings/credentials contracts are
 * declared here as the narrow structural views this plugin actually consumes.
 */
/** Exact route the Client page posts to. */
const TEST_PATH = "/model-config/test";
/** Exact route the Client page posts to for the export's key values. */
const SECRETS_PATH = "/model-config/secrets";
/** Open-route request bodies are tiny JSON objects; anything larger is hostile. */
const MAX_BODY_BYTES = 64 * 1024;
/** A credential reference is a POSIX shell identifier, exactly as the seam brands it. */
const REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
/** One export asks for at most this many references; more is not a provider catalog. */
const MAX_REFS = 64;
/**
 * Bounds on the settings walk that builds the allowed-reference set. The walk
 * exists to answer "does the configuration actually name this reference?", so
 * a document larger than these bounds is answered by what was seen so far.
 */
const MAX_WALK_NODES = 50000;
const MAX_WALK_DEPTH = 24;
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
 * Profile keys that carry a credential reference in this configuration family.
 * Both shipped adapters declare one: `llm-pi-ai` per provider profile, and
 * `llm-deepseek` at the namespace root.
 */
const CREDENTIAL_REF_KEYS = new Set(["apikeyenv", "api_key_env"]);
/**
 * Collect the credential references the settings document declares. Only a
 * value sitting under a reference-shaped key counts: a settings document is
 * full of ordinary strings (model ids, display names, base URLs), and admitting
 * those would turn "read this provider's key" into "read whatever environment
 * entry the configuration happens to mention".
 *
 * The walk is bounded by node count and depth so a pathological document never
 * turns one export request into unbounded work.
 * @param value - current node.
 * @param into - sink collecting the declared references.
 * @param budget - remaining node visits; shared across the whole document.
 * @param depth - remaining recursion depth.
 * @param key - the object key this value sits under, when there is one.
 */
export function collectCredentialRefs(value, into, budget, depth, key) {
    if (budget.left <= 0 || depth < 0)
        return;
    budget.left -= 1;
    if (typeof value === "string") {
        if (key !== undefined && CREDENTIAL_REF_KEYS.has(key.toLowerCase()) && REF_PATTERN.test(value))
            into.add(value);
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value)
            collectCredentialRefs(item, into, budget, depth - 1);
        return;
    }
    if (typeof value === "object" && value !== null) {
        for (const [childKey, entry] of Object.entries(value)) {
            collectCredentialRefs(entry, into, budget, depth - 1, childKey);
        }
    }
}
/**
 * Every credential reference the configuration declares. A provider's
 * `apiKeyEnv` reaches this set because it is a plain string under that key in
 * its namespace's resolved value, which is exactly the fact that makes a
 * reference resolvable here.
 * @param settings - the Host settings service.
 * @returns the admitted reference names.
 */
export function referencedNames(settings) {
    const names = new Set();
    const budget = { left: MAX_WALK_NODES };
    let descriptors;
    try {
        descriptors = settings.describe();
    }
    catch {
        return names;
    }
    for (const descriptor of descriptors) {
        collectCredentialRefs(descriptor.value, names, budget, MAX_WALK_DEPTH);
        if (budget.left <= 0)
            break;
    }
    return names;
}
/**
 * Split the requested strings into usable reference names and rejected entries,
 * preserving order and dropping duplicates.
 * @param raw - the decoded `refs` array.
 * @returns the names to resolve (at most {@link MAX_REFS}) and the rejected raw entries.
 */
export function splitRefs(raw) {
    const refs = [];
    const invalid = [];
    const seen = new Set();
    for (const entry of raw) {
        if (typeof entry !== "string") {
            if (invalid.length < MAX_REFS)
                invalid.push(String(entry));
            continue;
        }
        if (!REF_PATTERN.test(entry)) {
            if (invalid.length < MAX_REFS)
                invalid.push(entry);
            continue;
        }
        if (seen.has(entry))
            continue;
        seen.add(entry);
        if (refs.length < MAX_REFS)
            refs.push(entry);
    }
    return { refs, invalid };
}
/**
 * Resolve the requested references, but only those the settings document names.
 * A reference the configuration never mentions is reported as refused rather
 * than silently resolved, so this route cannot read an unrelated secret.
 * @param ctx - Host context carrying settings and credentials.
 * @param refs - validated reference names.
 * @returns per-name values plus the refused names.
 */
async function resolveRefs(ctx, refs) {
    const allowed = referencedNames(ctx.settings);
    const values = {};
    const refused = [];
    for (const ref of refs) {
        if (!allowed.has(ref)) {
            refused.push(ref);
            continue;
        }
        try {
            const resolved = await ctx.credentials.resolve(ref);
            values[ref] = resolved === undefined ? null : resolved.value;
        }
        catch {
            values[ref] = null;
        }
    }
    return { values, refused };
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
            messages: [{ role: "user", content: [{ type: "text", text: PROBE_PROMPT }] }],
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
 * `settings` and `credentials` back the export's reference resolution.
 */
export const inject = ["llm", "webServer", "connection", "settings", "credentials"];
/**
 * Apply the webserver's trust gate and read one small JSON body, answering the
 * request itself on every refusal. Shared by both routes so their fences cannot
 * drift apart.
 * @param ctx - Host context carrying the connection service.
 * @param req - the incoming request.
 * @param res - the response to answer on refusal.
 * @returns the decoded body, or `{ ok: false }` once a response was sent.
 */
async function admitJson(ctx, req, res) {
    const connection = ctx.connection;
    if (connection === undefined) {
        sendJson(res, 503, { ok: false, message: "connection service unavailable" });
        return { ok: false };
    }
    const rejection = connection.requestRejection(req);
    if (rejection !== undefined) {
        res.statusCode = rejection;
        res.end();
        return { ok: false };
    }
    if (req.method !== "POST") {
        res.setHeader("allow", "POST");
        sendJson(res, 405, { ok: false, message: "method not allowed" });
        return { ok: false };
    }
    let decoded;
    try {
        decoded = JSON.parse(await readBody(req));
    }
    catch {
        sendJson(res, 400, { ok: false, message: "invalid JSON body" });
        return { ok: false };
    }
    return { ok: true, body: isRecord(decoded) ? decoded : undefined };
}
/** Register both browser routes for the lifetime of the plugin. */
export function apply(ctx) {
    ctx.effect(() => ctx.webServer.register({
        kind: "exact",
        path: TEST_PATH,
        handler: async (req, res) => {
            try {
                const admitted = await admitJson(ctx, req, res);
                if (!admitted.ok)
                    return;
                const provider = typeof admitted.body?.provider === "string" ? admitted.body.provider : "";
                const model = typeof admitted.body?.model === "string" ? admitted.body.model : "";
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
    /*
     * The export's secret half. Answers only for references the settings
     * document names, so this is a lookup for the configuration's own keys
     * rather than a general credential dump.
     */
    ctx.effect(() => ctx.webServer.register({
        kind: "exact",
        path: SECRETS_PATH,
        handler: async (req, res) => {
            try {
                const admitted = await admitJson(ctx, req, res);
                if (!admitted.ok)
                    return;
                const raw = admitted.body?.refs;
                if (!Array.isArray(raw)) {
                    sendJson(res, 400, { ok: false, message: "refs must be an array of reference names" });
                    return;
                }
                const { refs, invalid } = splitRefs(raw);
                const resolved = await resolveRefs(ctx, refs);
                const payload = {
                    values: resolved.values,
                    refused: resolved.refused,
                    invalid
                };
                sendJson(res, 200, payload);
            }
            catch (error) {
                sendJson(res, 500, { ok: false, message: messageOf(error) });
            }
        }
    }), "model-config: POST /model-config/secrets");
}
