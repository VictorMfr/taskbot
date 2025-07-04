import { AppBar, Button, Toolbar, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Header() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const handleLogoutClick = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        setOpen(false);
        logout();
    };

    return (
    <header>
      <div>
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              MyApp
            </Typography>
            <div className="flex gap-4">
              {user ? (
                <>
                  <Button
                    onClick={handleLogoutClick}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Cerrar sesión
                  </Button>
                  <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Confirmar cierre de sesión</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        ¿Estás seguro de que deseas cerrar sesión?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} color="primary">
                        Cancelar
                      </Button>
                      <Button onClick={handleConfirm} color="error" autoFocus>
                        Cerrar sesión
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </Toolbar>
        </AppBar>
      </div>
    </header>
    )
}