import { NextRequest } from "next/server";

export const runtime = "edge";

// Función para detectar propuestas de cambios en la respuesta de la IA
function detectProposals(content: string): any[] {
  const proposals: any[] = [];
  
  // Buscar patrones de propuestas en el texto
  const proposalPatterns = [
    /PROPUESTA_CREAR_TAREA:\s*(\{[\s\S]*?\})/g,
    /PROPUESTA_ACTUALIZAR_TAREA:\s*(\{[\s\S]*?\})/g,
    /PROPUESTA_ELIMINAR_TAREA:\s*(\{[\s\S]*?\})/g,
    /PROPUESTA_CREAR_SUBTAREA:\s*(\{[\s\S]*?\})/g,
    /PROPUESTA_ACTUALIZAR_SUBTAREA:\s*(\{[\s\S]*?\})/g,
    /PROPUESTA_ELIMINAR_SUBTAREA:\s*(\{[\s\S]*?\})/g,
  ];

  proposalPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        try {
          const data = JSON.parse(match.replace(/^[^:]+:\s*/, ''));
          const types = ['create', 'update', 'delete', 'create', 'update', 'delete'];
          const entities = ['task', 'task', 'task', 'subtask', 'subtask', 'subtask'];
          
          proposals.push({
            id: `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: types[index],
            entity: entities[index],
            data,
            description: `Propuesta para ${types[index]} ${entities[index]}`,
          });
        } catch (e) {
          console.error('Error parsing proposal:', e);
        }
      });
    }
  });

  return proposals;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages } = body;

  // Crear un prompt mejorado con instrucciones para propuestas
  const systemPrompt = `Eres un asistente de gestión de tareas. Puedes ayudar a crear, actualizar y eliminar tareas y subtareas.

INSTRUCCIONES PARA PROPUESTAS:
Cuando el usuario solicite cambios en las tareas, debes generar propuestas en el siguiente formato:

Para crear una tarea:
PROPUESTA_CREAR_TAREA: {"nombre": "Nombre de la tarea", "descripcion": "Descripción", "prioridad": "alta|media|baja", "fecha_limite": "YYYY-MM-DD", "estado": "pendiente|en proceso|terminado"}

Para actualizar una tarea:
PROPUESTA_ACTUALIZAR_TAREA: {"id": 123, "nombre": "Nuevo nombre", "descripcion": "Nueva descripción", "prioridad": "alta|media|baja", "fecha_limite": "YYYY-MM-DD", "estado": "pendiente|en proceso|terminado"}

Para eliminar una tarea:
PROPUESTA_ELIMINAR_TAREA: {"id": 123}

Para crear una subtarea:
PROPUESTA_CREAR_SUBTAREA: {"nombre": "Nombre de la subtarea", "descripcion": "Descripción", "prioridad": "alta|media|baja", "fecha_limite": "YYYY-MM-DD", "estado": "pendiente|en proceso|terminado", "tarea_padre_id": 123}

Para actualizar una subtarea:
PROPUESTA_ACTUALIZAR_SUBTAREA: {"id": 456, "nombre": "Nuevo nombre", "descripcion": "Nueva descripción", "prioridad": "alta|media|baja", "fecha_limite": "YYYY-MM-DD", "estado": "pendiente|en proceso|terminado", "tarea_padre_id": 123}

Para eliminar una subtarea:
PROPUESTA_ELIMINAR_SUBTAREA: {"id": 456}

IMPORTANTE: Solo genera propuestas cuando el usuario solicite cambios específicos. Responde normalmente a otras preguntas.`;

  // Convierte el historial de mensajes a un prompt tipo chat
  const conversationHistory = messages
    .map((m: any) => `${m.role === "user" ? "usuario" : "assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `${systemPrompt}\n\n${conversationHistory}\nassistant:`;

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
      let fullContent = "";
      let proposalsDetected = false;

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
              fullContent += data.response;
              
              // Detectar propuestas solo una vez al final
              if (!proposalsDetected && fullContent.length > 100) {
                const proposals = detectProposals(fullContent);
                if (proposals.length > 0) {
                  proposalsDetected = true;
                  // Enviar las propuestas detectadas
                  controller.enqueue(encoder.encode(JSON.stringify({ 
                    content: data.response,
                    proposals 
                  }) + "\n"));
                } else {
                  controller.enqueue(encoder.encode(JSON.stringify({ content: data.response }) + "\n"));
                }
              } else {
                controller.enqueue(encoder.encode(JSON.stringify({ content: data.response }) + "\n"));
              }
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