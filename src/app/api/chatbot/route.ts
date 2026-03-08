import { NextResponse } from "next/server";

import { commodityWebSearch } from "@/lib/chatbot/searchTool";
import { buildFineTuneContext } from "@/lib/chatbot/trainingData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHISA_BASE_URL = "https://api.shisa.ai/openai/v1";
const SHISA_MODEL = process.env.SHISA_MODEL ?? "shisa-ai/shisa-v2.1-llama3.3-70b";

const SYSTEM_PROMPT = [
  "You are a commodity market research assistant.",
  "When the user asks about a commodity and region, call the commodity_web_search tool by outputting only this format:",
  '<tool_call>{"name":"commodity_web_search","arguments":{"query":"...","geolocation":"XX"}}</tool_call>',
  "After receiving <tool_result>...</tool_result>, summarize key findings clearly and include URLs.",
  "If commodity or region is missing, ask a short clarifying question.",
  "Always respond in the same language as the user.",
].join(" ");

const TOOL_CALL_PATTERN = /<tool_call>\s*(\{[\s\S]*?\})\s*<\/tool_call>/i;

interface UiMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages?: UiMessage[];
}

interface ToolCall {
  name?: string;
  arguments?: {
    query?: string;
    geolocation?: string;
    fetch_content?: boolean;
    fetchContent?: boolean;
  };
}

async function callShisa(messages: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  const response = await fetch(`${SHISA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SHISA_MODEL,
      messages,
      temperature: 0.4,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Shisa API failed (${response.status}): ${body.slice(0, 180)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function extractToolCall(text: string): ToolCall | null {
  const match = text.match(TOOL_CALL_PATTERN);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[1]) as ToolCall;
    if (parsed.name === "commodity_web_search" && parsed.arguments) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function trimMessages(input: UiMessage[]): UiMessage[] {
  return input
    .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
    .map((message) => ({ role: message.role, content: message.content.slice(0, 2500) }))
    .slice(-12);
}

async function runSearchTool(call: ToolCall, crustToken: string): Promise<unknown> {
  const query = call.arguments?.query?.trim() ?? "";
  if (!query) {
    return { error: "Missing query for commodity_web_search." };
  }

  try {
    const result = await commodityWebSearch({
      apiKey: crustToken,
      query,
      geolocation: call.arguments?.geolocation,
      fetchContent: call.arguments?.fetch_content ?? call.arguments?.fetchContent ?? false,
    });
    return result;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown search error" };
  }
}

export async function POST(request: Request) {
  const shisaApiKey = process.env.SHISA_API_KEY ?? "";
  const crustToken = process.env.CRUSTDATA_TOKEN ?? process.env.CRUSTDATA_API_KEY ?? "";

  if (!shisaApiKey) {
    return NextResponse.json({
      reply: "SHISA_API_KEY is not configured yet. Please add it in Vercel environment variables.",
    });
  }

  const body = (await request.json().catch(() => ({}))) as ChatRequestBody;
  const history = trimMessages(body.messages ?? []);
  const latestUserQuery =
    [...history].reverse().find((message) => message.role === "user")?.content ?? "";

  const dynamicSystemPrompt = [
    SYSTEM_PROMPT,
    buildFineTuneContext(latestUserQuery),
  ].join("\n\n");

  const conversation: Array<{ role: string; content: string }> = [
    { role: "system", content: dynamicSystemPrompt },
    ...history,
  ];

  const maxToolRounds = 3;

  try {
    for (let round = 0; round < maxToolRounds; round += 1) {
      const assistantText = await callShisa(conversation, shisaApiKey);
      if (!assistantText) {
        return NextResponse.json({
          reply: "I could not generate a response. Please try again.",
        });
      }

      const toolCall = extractToolCall(assistantText);
      if (!toolCall) {
        return NextResponse.json({ reply: assistantText });
      }

      conversation.push({ role: "assistant", content: assistantText });

      if (!crustToken) {
        conversation.push({
          role: "user",
          content: "<tool_result>\n{\"error\":\"CRUSTDATA_TOKEN is not configured.\"}\n</tool_result>",
        });
        continue;
      }

      const result = await runSearchTool(toolCall, crustToken);
      conversation.push({
        role: "user",
        content: `<tool_result>\n${JSON.stringify(result)}\n</tool_result>`,
      });
    }

    return NextResponse.json({
      reply: "I reached the tool-call limit for this turn. Please refine your question and try again.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ reply: `Chatbot failed: ${message}` }, { status: 500 });
  }
}
