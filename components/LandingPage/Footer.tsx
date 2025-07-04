import { AppBar, Toolbar, Typography } from "@mui/material"

export default function Footer() {
    return (
        <footer>
            <div>
                <AppBar position="static" color="default" elevation={0} sx={{ top: 'auto', bottom: 0 }}>
                    <Toolbar sx={{ justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            © {new Date().getFullYear()} MyApp. All rights reserved.
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
        </footer>
    )
}