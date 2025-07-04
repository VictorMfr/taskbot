"use client";
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Fade,
  Collapse,
} from "@mui/material";
import { Refresh as RefreshIcon, Close as CloseIcon } from "@mui/icons-material";

interface RetryIndicatorProps {
  retryCount: number;
  maxRetries: number;
  onCancel: () => void;
  show: boolean;
}

export default function RetryIndicator({
  retryCount,
  maxRetries,
  onCancel,
  show,
}: RetryIndicatorProps) {
  if (!show || retryCount === 0) return null;

  const progress = (retryCount / maxRetries) * 100;
  const remainingRetries = maxRetries - retryCount;

  return (
    <Collapse in={show && retryCount > 0}>
      <Fade in={show && retryCount > 0}>
        <Box
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "warning.light",
            borderRadius: 2,
            border: 1,
            borderColor: "warning.main",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <RefreshIcon sx={{ fontSize: "1rem", color: "warning.dark" }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "warning.dark" }}>
              Reintentando conexión...
            </Typography>
          </Box>
          
          <Typography variant="caption" sx={{ color: "warning.dark", mb: 1, display: "block" }}>
            Intento {retryCount} de {maxRetries} • {remainingRetries} reintentos restantes
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mb: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.3)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "warning.dark",
              },
            }}
          />
          
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<CloseIcon />}
            onClick={onCancel}
            sx={{
              fontSize: "0.75rem",
              py: 0.5,
              px: 1,
              textTransform: "none",
              borderColor: "warning.dark",
              color: "warning.dark",
              "&:hover": {
                bgcolor: "warning.dark",
                color: "white",
              },
            }}
          >
            Cancelar reintentos
          </Button>
        </Box>
      </Fade>
    </Collapse>
  );
} 