"use client";
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useState } from "react";

interface ErrorAlertProps {
  error: string | null;
  onRetry: () => void;
  onDismiss?: () => void;
  lastPrompt?: string;
  showRetry?: boolean;
}

export default function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  lastPrompt,
  showRetry = true,
}: ErrorAlertProps) {
  const [expanded, setExpanded] = useState(false);

  if (!error) return null;

  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        variant="filled"
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: 2,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showRetry && (
              <Button
                size="small"
                color="inherit"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
                sx={{
                  minWidth: "auto",
                  px: 1,
                  py: 0.5,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Reintentar
              </Button>
            )}
            {onDismiss && (
              <IconButton
                size="small"
                color="inherit"
                onClick={onDismiss}
                sx={{ p: 0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
          Error de conexión
        </AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
        
        {lastPrompt && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={() => setExpanded(!expanded)}
              sx={{
                p: 0,
                minWidth: "auto",
                fontSize: "0.75rem",
                textTransform: "none",
                textDecoration: "underline",
                "&:hover": {
                  textDecoration: "none",
                },
              }}
            >
              {expanded ? "Ocultar" : "Ver"} último mensaje
            </Button>
            <Collapse in={expanded}>
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  fontStyle: "italic",
                  wordBreak: "break-word",
                }}
              >
                "{lastPrompt}"
              </Box>
            </Collapse>
          </Box>
        )}
        
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <ErrorIcon sx={{ fontSize: "1rem", opacity: 0.7 }} />
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Si el problema persiste, verifica tu conexión a internet
          </Typography>
        </Box>
      </Alert>
    </Collapse>
  );
} 