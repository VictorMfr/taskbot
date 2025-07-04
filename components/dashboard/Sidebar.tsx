"use client";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Fade,
  CircularProgress,
  InputAdornment,
  useTheme,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import { useRef, useState, useEffect } from "react";
import { useChatAI, type ChatMessage } from "@/hooks/useChatAI";
import ErrorAlert from "./ErrorAlert";
import RetryIndicator from "./RetryIndicator";
import ErrorTestPanel from "./ErrorTestPanel";

function ChatMessageComponent({ message }: { message: ChatMessage }) {
  const theme = useTheme();
  const isUser = message.role === "user";
  return (
    <Fade in>
      <Box
        sx={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          mb: 1,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1,
            maxWidth: "80%",
            bgcolor: isUser
              ? theme.palette.primary.light
              : theme.palette.grey[100],
            color: isUser
              ? theme.palette.primary.contrastText
              : theme.palette.text.primary,
            borderRadius: 2,
            borderTopRightRadius: isUser ? 0 : 2,
            borderTopLeftRadius: isUser ? 2 : 0,
            fontSize: "1rem",
            wordBreak: "break-word",
            transition: "background 0.3s",
          }}
          aria-label={isUser ? "Mensaje de usuario" : "Respuesta del asistente"}
        >
          {message.content}
        </Paper>
      </Box>
    </Fade>
  );
}

export default function Sidebar() {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isStreaming,
    error,
    retryCount,
    lastPrompt,
    sendMessage,
    retryLastMessage,
    cancelRequest,
    clearError,
  } = useChatAI({
    maxRetries: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onSuccess: (message) => {
      console.log("Message sent successfully:", message);
    },
  });

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Send user prompt
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    await sendMessage(input);
    setInput("");
  };

  // Test error scenarios
  const handleTestError = async (errorType: string) => {
    if (isStreaming) return;
    await sendMessage(`test_error:${errorType}`);
  };

  // Allow Enter to send, Shift+Enter for newline
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      component="aside"
      aria-label="Chatbot sidebar"
      sx={{
        width: { xs: "100vw", md: "350px" },
        minWidth: { md: "350px" },
        maxWidth: { md: "350px" },
        height: { xs: "60vh", md: "100%" },
        maxHeight: "100vh",
        bgcolor: "background.paper",
        borderLeft: { md: 1, xs: 0 },
        borderTop: { xs: 1, md: 0 },
        borderColor: "divider",
        display: { xs: "flex", md: "flex" },
        flexDirection: "column",
        zIndex: 1200,
        p: 2,
        boxShadow: 1,
        overflow: "hidden",
        position: { xs: "fixed", md: "static" },
        bottom: { xs: 0, md: "auto" },
        left: { xs: 0, md: "auto" },
        transition: "all 0.3s",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, letterSpacing: 1 }}
          tabIndex={0}
        >
          Chatbot
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Asistente impulsado por phi3:mini
        </Typography>
      </Box>
      
      {/* Error Test Panel */}
      <ErrorTestPanel
        onTestError={handleTestError}
        isStreaming={isStreaming}
      />
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
          minHeight: 0,
          pr: 1,
          outline: "none",
        }}
        tabIndex={0}
        aria-label="Área de conversación"
      >
        {messages.length === 0 && !isStreaming ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              fontStyle: "italic",
              opacity: 0.7,
              minHeight: 120,
            }}
          >
            ¡Hazme una pregunta!
          </Box>
        ) : (
          messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))
        )}
        {isStreaming && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", pl: 1 }}>
            <CircularProgress size={18} sx={{ mt: 1, mr: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              El asistente está escribiendo...
            </Typography>
          </Box>
        )}
        <div ref={chatEndRef} />
      </Box>
      
      {/* Retry Indicator */}
      <RetryIndicator
        retryCount={retryCount}
        maxRetries={3}
        onCancel={cancelRequest}
        show={retryCount > 0 && !error}
      />
      
      {/* Error Alert Component */}
      <ErrorAlert
        error={error?.message || null}
        onRetry={retryLastMessage}
        onDismiss={clearError}
        lastPrompt={lastPrompt}
        showRetry={error?.retryable !== false}
      />
      
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
        }}
        aria-label="Enviar mensaje al chatbot"
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Escribe tu mensaje..."
          multiline
          minRows={1}
          maxRows={4}
          fullWidth
          size="small"
          variant="outlined"
          disabled={isStreaming}
          inputProps={{
            "aria-label": "Campo de entrada para el mensaje",
            autoComplete: "off",
            spellCheck: true,
          }}
          sx={{
            bgcolor: "background.default",
            borderRadius: 2,
            transition: "background 0.2s",
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {isStreaming ? (
                  <IconButton
                    aria-label="Cancelar mensaje"
                    color="error"
                    onClick={cancelRequest}
                    edge="end"
                    sx={{
                      transition: "background 0.2s",
                    }}
                  >
                    <StopIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    aria-label="Enviar mensaje"
                    color="primary"
                    type="submit"
                    disabled={!input.trim()}
                    edge="end"
                    sx={{
                      transition: "background 0.2s",
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}