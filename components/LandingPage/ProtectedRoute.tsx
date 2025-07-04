"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Container, Paper, Alert } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            setIsLoading(false);
            return;
        }

        try {
            const success = await register(nombre, email, password);
            if (!success) {
                setError("Error en el registro");
            }
        } catch (error) {
            setError("Error al registrarse");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h1" align="center" gutterBottom>
                    Registrarse
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        label="Nombre"
                        fullWidth
                        margin="normal"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={isLoading}
                    />
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
                    <TextField
                        label="Confirmar contraseña"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isLoading ? "Registrando..." : "Registrarse"}
                    </Button>
                </Box>
                <Typography align="center" sx={{ mt: 2 }}>
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                        href="/login"
                        style={{ color: "#1976d2", textDecoration: "none", fontWeight: 500 }}
                    >
                        Iniciar sesión
                    </Link>
                </Typography>
            </Paper>
        </Container>
    );
}
