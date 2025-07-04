"use client";
import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatError {
  message: string;
  code?: string;
  retryable: boolean;
}

export interface UseChatAIOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: ChatError) => void;
  onSuccess?: (message: ChatMessage) => void;
}

export function useChatAI(options: UseChatAIOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastPromptRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const updateLastMessage = useCallback((updater: (message: ChatMessage) => ChatMessage) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = updater(newMessages[newMessages.length - 1]);
      return newMessages;
    });
  }, []);

  const removeLastMessage = useCallback(() => {
    setMessages(prev => prev.slice(0, -1));
  }, []);

  const handleError = useCallback((error: any, prompt?: string): ChatError => {
    let chatError: ChatError;

    if (error.name === "AbortError") {
      chatError = {
        message: "La consulta fue cancelada",
        code: "ABORTED",
        retryable: false,
      };
    } else if (error.message?.includes("Failed to fetch")) {
      chatError = {
        message: "Error de conexión. Verifica tu conexión a internet.",
        code: "NETWORK_ERROR",
        retryable: true,
      };
    } else if (error.status === 429) {
      chatError = {
        message: "Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.",
        code: "RATE_LIMIT",
        retryable: true,
      };
    } else if (error.status >= 500) {
      chatError = {
        message: "Error del servidor. Intenta de nuevo en unos momentos.",
        code: "SERVER_ERROR",
        retryable: true,
      };
    } else if (error.status >= 400) {
      chatError = {
        message: "Error en la solicitud. Verifica tu mensaje e intenta de nuevo.",
        code: "CLIENT_ERROR",
        retryable: false,
      };
    } else {
      chatError = {
        message: error.message || "Ocurrió un error inesperado. Intenta de nuevo.",
        code: "UNKNOWN_ERROR",
        retryable: true,
      };
    }

    setError(chatError);
    onError?.(chatError);
    return chatError;
  }, [onError]);

  const sendMessage = useCallback(async (
    content: string,
    retryAttempt = 0
  ): Promise<void> => {
    if (!content.trim() || isStreaming) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    clearError();
    lastPromptRef.current = content;
    setIsStreaming(true);

    const userMessage = addMessage({
      id: `${Date.now()}-user`,
      role: "user",
      content,
    });

    // Prepare conversation context
    const conversation = messages
      .concat(userMessage)
      .map(({ role, content }) => ({ role, content }));

    const assistantMessage = addMessage({
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: "",
    });

    try {
      // Check if this is a test error message
      const isTestError = content.startsWith("test_error:");
      const errorType = isTestError ? content.replace("test_error:", "") : null;
      
      const response = await fetch("/api/ollama/phi3-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi3:mini",
          messages: conversation,
          stream: true,
          simulateError: errorType,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
        };
      }

      if (!response.body) {
        throw new Error("No se pudo conectar al modelo.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;
        if (signal.aborted) throw new Error("Request aborted");

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const data = JSON.parse(line);
              if (typeof data.content === "string") {
                updateLastMessage(msg => ({
                  ...msg,
                  content: msg.content + data.content,
                }));
              }
            } catch (e) {
              // Ignore malformed JSON lines
            }
          }
        }
      }

      // Success
      setRetryCount(0);
      onSuccess?.(assistantMessage);

    } catch (err: any) {
      // Remove the empty assistant message
      removeLastMessage();

      const chatError = handleError(err, content);

      // Auto-retry logic
      if (chatError.retryable && retryAttempt < maxRetries) {
        setRetryCount(retryAttempt + 1);
        
        setTimeout(() => {
          sendMessage(content, retryAttempt + 1);
        }, retryDelay * (retryAttempt + 1));
        
        return;
      }

      // Final error state
      setRetryCount(0);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [
    messages,
    isStreaming,
    clearError,
    addMessage,
    updateLastMessage,
    removeLastMessage,
    handleError,
    maxRetries,
    retryDelay,
    onSuccess,
  ]);

  const retryLastMessage = useCallback(() => {
    if (lastPromptRef.current && !isStreaming) {
      sendMessage(lastPromptRef.current);
    }
  }, [sendMessage, isStreaming]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    clearError();
    lastPromptRef.current = "";
  }, [clearError]);

  return {
    messages,
    isStreaming,
    error,
    retryCount,
    lastPrompt: lastPromptRef.current,
    sendMessage,
    retryLastMessage,
    cancelRequest,
    clearMessages,
    clearError,
  };
} 