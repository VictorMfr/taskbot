import { Box, Button, Container, Typography } from "@mui/material";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function MainSection() {
    return (
        <section>
            <Box sx={{ bgcolor: 'background.paper', pt: 8, pb: 8 }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
                    <Typography component="h1" variant="h3" fontWeight={700} gutterBottom>
                        TaskBot: Administra tus tareas fácilmente
                    </Typography>
                    <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
                        TaskBot es tu asistente inteligente para organizar, priorizar y completar tus tareas diarias de manera eficiente. ¡Deja que TaskBot administre tus pendientes y enfócate en lo que realmente importa!
                    </Typography>
                    <Button variant="contained" color="primary" size="large">
                        Comenzar ahora
                    </Button>
                </Container>
            </Box>
        </section>
    );
}