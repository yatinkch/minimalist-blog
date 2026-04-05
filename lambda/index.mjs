import { DynamoDBClient, GetItemCommand, UpdateItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({ region: "us-east-1" });
const TABLE = "blog-likes";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://yatinkch.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;
  const path = event.path || event.rawPath || "";

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // GET /likes — return all like counts
  if (method === "GET" && path === "/likes") {
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

  return { statusCode: 404, headers, body: JSON.stringify({ error: "Not found" }) };
};
