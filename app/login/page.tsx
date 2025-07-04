"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Container, Paper, Alert } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (!success) {
                setError("Credenciales inválidas");
            }
        } catch (error) {
            setError("Error al iniciar sesión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h1" align="center" gutterBottom>
                    Iniciar sesión
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        label="Correo electrónico"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                </Box>
                <Typography align="center" sx={{ mt: 2 }}>
                    ¿No tienes una cuenta?{" "}
                    <Link
                        href="/register"
                        style={{ color: "#1976d2", textDecoration: "none", fontWeight: 500 }}
                    >
                        Registrarse
                    </Link>
                </Typography>
            </Paper>
        </Container>
    );
}