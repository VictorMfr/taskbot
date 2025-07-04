import { NextRequest } from "next/server";

// Helper: Validate incoming request body
function validateBody(body: any) {
  if (
    !body ||
    !Array.isArray(body.messages) ||
    !body.messages.every(
      (msg: any) =>
        typeof msg === "object" &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string"
    )
  ) {
    return false;
  }
  return true;
}

// POST handler for streaming chat completions from Ollama (phi3:mini)
export async function POST(req: NextRequest) {
  try {
    // Parse and validate input
    const body = await req.json();
    if (!validateBody(body)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body. Expecting { messages: [{role, content}, ...] }" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare payload for Ollama API
    const ollamaPayload = {
      model: "phi3:mini",
      messages: body.messages,
      stream: true,
    };

    // Connect to local Ollama server
    const ollamaRes = await fetch(process.env.AI_HOST!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ollamaPayload),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      return new Response(
        JSON.stringify({ error: "Failed to connect to Ollama server." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream Ollama's response to the client as Server-Sent Events (SSE)
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += new TextDecoder().decode(value, { stream: true });

            // Ollama streams JSON objects per line
            let lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const data = JSON.parse(line);
                // Send only the generated content tokens
                if (data.message && typeof data.message.content === "string") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: data.message.content })}\n\n`)
                  );
                }
                // If Ollama signals done, close the stream
                if (data.done) {
                  controller.enqueue(encoder.encode("event: end\ndata: [DONE]\n\n"));
                  controller.close();
                  return;
                }
              } catch (err) {
                // Ignore JSON parse errors for incomplete lines
              }
            }
          }
          // End of stream
          controller.enqueue(encoder.encode("event: end\ndata: [DONE]\n\n"));
          controller.close();
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Streaming error" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
