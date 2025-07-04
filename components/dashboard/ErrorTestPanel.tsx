"use client";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { BugReport as BugIcon } from "@mui/icons-material";
import { useState } from "react";

interface ErrorTestPanelProps {
  onTestError: (errorType: string) => void;
  isStreaming: boolean;
}

const errorTests = [
  {
    type: "network",
    label: "Error de Red",
    description: "Simula un error de conexión de red",
    color: "error" as const,
  },
  {
    type: "rate_limit",
    label: "Límite de Velocidad",
    description: "Simula un error de rate limiting",
    color: "warning" as const,
  },
  {
    type: "server_error",
    label: "Error del Servidor",
    description: "Simula un error interno del servidor",
    color: "error" as const,
  },
  {
    type: "timeout",
    label: "Timeout",
    description: "Simula un timeout de la solicitud",
    color: "info" as const,
  },
];

export default function ErrorTestPanel({ onTestError, isStreaming }: ErrorTestPanelProps) {
  const [showPanel, setShowPanel] = useState(false);

  if (!showPanel) {
    return (
      <Box sx={{ mb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<BugIcon />}
          onClick={() => setShowPanel(true)}
          disabled={isStreaming}
          sx={{ fontSize: "0.75rem" }}
        >
          Probar Errores
        </Button>
      </Box>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: "grey.50",
        border: 1,
        borderColor: "grey.300",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
          <BugIcon fontSize="small" />
          Panel de Pruebas de Error
        </Typography>
        <Button
          size="small"
          variant="text"
          onClick={() => setShowPanel(false)}
          sx={{ fontSize: "0.75rem" }}
        >
          Cerrar
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mb: 2, fontSize: "0.75rem" }}>
        Usa estos botones para probar diferentes escenarios de error y verificar el sistema de manejo de errores.
      </Alert>
      
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        {errorTests.map((test) => (
          <Box key={test.type}>
            <Button
              fullWidth
              variant="outlined"
              color={test.color}
              onClick={() => onTestError(test.type)}
              disabled={isStreaming}
              sx={{
                fontSize: "0.75rem",
                py: 1,
                textTransform: "none",
                justifyContent: "flex-start",
                textAlign: "left",
              }}
            >
              <Box sx={{ textAlign: "left" }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
                  {test.label}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
                  {test.description}
                </Typography>
              </Box>
            </Button>
          </Box>
        ))}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
        <strong>Nota:</strong> Estos errores son simulados para propósitos de prueba. 
        El sistema de reintento automático se activará para errores recuperables.
      </Typography>
    </Paper>
  );
} 