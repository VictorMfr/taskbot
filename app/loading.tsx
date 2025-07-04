import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                zIndex: 1300,
            }}
        >
            <CircularProgress color="primary" size={60} />
        </Box>
    );
}