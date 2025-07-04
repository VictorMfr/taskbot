"use client";

import { Box, Typography, Container, Paper, Button, CircularProgress } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            ¡Bienvenido, {user.name}!
          </Typography>
          <Button variant="outlined" color="secondary" onClick={logout}>
            Cerrar sesión
          </Button>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Este es tu panel de control. Aquí podrás gestionar tus tareas y ver tu progreso.
        </Typography>
        {/* Aquí puedes agregar más componentes del dashboard, como la lista de tareas */}
      </Paper>
    </Container>
  );
}
