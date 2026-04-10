import { DynamoDBClient, GetItemCommand, UpdateItemCommand, ScanCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { createHash } from "crypto";

const db = new DynamoDBClient({ region: "us-east-1" });
const TABLE = "blog-likes";
const SUBSCRIBERS_TABLE = "blog-subscribers";
const ANALYTICS_TABLE = "blog-analytics";

// Deterministic seed — same logic as frontend
function seedLikes(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return 5 + Math.abs(hash) % 6;
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://yatinkch.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// In-memory per-IP rate limiter (persists across warm invocations)
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 30; // max requests per IP per window
const ipHits = new Map();

// Cleanup stale entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipHits) {
    if (now - entry.start > RATE_WINDOW_MS * 2) ipHits.delete(ip);
  }
}, 120_000).unref();

function isRateLimited(event) {
  const sourceIp = event.requestContext?.http?.sourceIp || event.requestContext?.identity?.sourceIp || "unknown";
  const ipHash = createHash("sha256").update(sourceIp).digest("hex").slice(0, 16);
  const now = Date.now();
  const entry = ipHits.get(ipHash);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    ipHits.set(ipHash, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;
  const path = event.path || event.rawPath || "";

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Rate limit check
  if (isRateLimited(event)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: "Too many requests" }) };
  }

  // GET /likes — return all like counts
  // GET /likes?init=id1,id2 — seed posts that don't exist yet, then return all
  if (method === "GET" && path === "/likes") {
    const qs = event.queryStringParameters || {};
    if (qs.init) {
      const ids = qs.init.split(",");
      for (const id of ids) {
        const check = await db.send(new GetItemCommand({ TableName: TABLE, Key: { postId: { S: id } } }));
        if (!check.Item) {
          await db.send(new UpdateItemCommand({
            TableName: TABLE,
            Key: { postId: { S: id } },
            UpdateExpression: "SET likeCount = :s",
            ExpressionAttributeValues: { ":s": { N: String(seedLikes(id)) } },
          }));
        }
      }
    }
    const result = await db.send(new ScanCommand({ TableName: TABLE }));
    const counts = {};
    for (const item of result.Items || []) {
      counts[item.postId.S] = Number(item.likeCount.N);
    }
    return { statusCode: 200, headers, body: JSON.stringify(counts) };
  }

  // POST /likes/{postId} — increment like count by 1 or -1
  if (method === "POST" && path.startsWith("/likes/")) {
    const postId = decodeURIComponent(path.replace("/likes/", ""));
    let delta = 1;
    if (event.body) {
      try {
        const parsed = JSON.parse(event.body);
        if (parsed.action === "unlike") delta = -1;
      } catch {}
    }

    // Check if post exists; if not, seed it with a base count
    const existing = await db.send(new GetItemCommand({ TableName: TABLE, Key: { postId: { S: postId } } }));
    if (!existing.Item) {
      const seed = seedLikes(postId);
      await db.send(new UpdateItemCommand({
        TableName: TABLE,
        Key: { postId: { S: postId } },
        UpdateExpression: "SET likeCount = :s",
        ExpressionAttributeValues: { ":s": { N: String(seed) } },
      }));
    }

    const params = {
      TableName: TABLE,
      Key: { postId: { S: postId } },
      UpdateExpression: "ADD likeCount :d",
      ExpressionAttributeValues: { ":d": { N: String(delta) } },
      ReturnValues: "ALL_NEW",
    };
    if (delta === -1) {
      params.ConditionExpression = "attribute_exists(postId) AND likeCount > :zero";
      params.ExpressionAttributeValues[":zero"] = { N: "0" };
    }
    const result = await db.send(new UpdateItemCommand(params));

    const newCount = Number(result.Attributes.likeCount.N);
    return { statusCode: 200, headers, body: JSON.stringify({ postId, likeCount: Math.max(0, newCount) }) };
  }

  // POST /subscribe — save email to subscribers table
  if (method === "POST" && path === "/subscribe") {
    try {
      const { email } = JSON.parse(event.body || "{}");
      const trimmed = (email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid email" }) };
      }
      await db.send(new PutItemCommand({
        TableName: SUBSCRIBERS_TABLE,
        Item: {
          email: { S: trimmed },
          subscribedAt: { S: new Date().toISOString() },
        },
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to subscribe" }) };
    }
  }

  // POST /analytics — record analytics event
  if (method === "POST" && path === "/analytics") {
    try {
      const { page, eventType, timeSpentSecs, referrer } = JSON.parse(event.body || "{}");
      if (!page || !eventType) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing page or eventType" }) };
      }

      // Extract and hash IP
      const sourceIp = event.requestContext?.http?.sourceIp || event.requestContext?.identity?.sourceIp || "unknown";
      const ipHash = createHash("sha256").update(sourceIp).digest("hex").slice(0, 16);

      // Random suffix to prevent sort key collisions
      const rand = Math.random().toString(36).slice(2, 6);
      const timestamp = new Date().toISOString();

      await db.send(new PutItemCommand({
        TableName: ANALYTICS_TABLE,
        Item: {
          pk: { S: `PAGE#${page}` },
          sk: { S: `EVENT#${timestamp}#${rand}` },
          eventType: { S: eventType },
          ipHash: { S: ipHash },
          timestamp: { S: timestamp },
          timeSpentSecs: { N: String(timeSpentSecs || 0) },
          userAgent: { S: (event.headers?.["user-agent"] || event.headers?.["User-Agent"] || "unknown") },
          referrer: { S: referrer || "" },
        },
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to record event" }) };
    }
  }

  return { statusCode: 404, headers, body: JSON.stringify({ error: "Not found" }) };
};
