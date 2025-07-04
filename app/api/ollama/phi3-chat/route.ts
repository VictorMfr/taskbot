import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages } = body;

  // Convierte el historial de mensajes a un prompt tipo chat
  // Ejemplo: usuario: Hola\nassistant: Hola, ¿en qué puedo ayudarte?\nusuario: ¿Qué es la IA?\nassistant:
  const prompt = messages
    .map((m: any) => `${m.role === "user" ? "usuario" : "assistant"}: ${m.content}`)
    .join("\n") + "\nassistant:";

  const ollamaPayload = {
    model: "phi3:mini",
    prompt,
    stream: true,
  };

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ollamaPayload),
  });

  // Adaptar el stream de Ollama al formato esperado por el frontend
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (typeof data.response === "string") {
              controller.enqueue(encoder.encode(JSON.stringify({ content: data.response }) + "\n"));
            }
          } catch (e) {
            // Ignorar líneas malformadas
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
} 