import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import Link from "next/link";

export default function Header() {
    return (
    <header>
      <div>
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              MyApp
            </Typography>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Registrarse
              </Link>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    </header>
    )
}