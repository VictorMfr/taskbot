"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, ToggleButton, ToggleButtonGroup, InputAdornment, Container
} from "@mui/material";
import { Edit, Delete, Add, Search } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks, Task } from "@/hooks/useTasks";

const prioridades = ["baja", "media", "alta"];
const estados = ["pendiente", "en proceso", "terminado"];

function TaskRow({ task, onEdit, onDelete, onAddSubtask, showSubtasks }: { task: Task, onEdit: (t: Task) => void, onDelete: (t: Task) => void, onAddSubtask: (t: Task) => void, showSubtasks: boolean }) {
  return (
    <>
      <TableRow>
        <TableCell>{task.nombre}</TableCell>
        <TableCell>{task.descripcion}</TableCell>
        <TableCell>{task.prioridad}</TableCell>
        <TableCell>{task.fecha_limite}</TableCell>
        <TableCell>{task.estado}</TableCell>
        <TableCell>
          <IconButton onClick={() => onEdit(task)} size="small"><Edit /></IconButton>
          <IconButton onClick={() => onDelete(task)} size="small" color="error"><Delete /></IconButton>
          <IconButton onClick={() => onAddSubtask(task)} size="small" color="primary"><Add /></IconButton>
        </TableCell>
      </TableRow>
      {showSubtasks && task.subtareas && task.subtareas.length > 0 && task.subtareas.map((sub) => (
        <TaskRow key={sub.id} task={sub} onEdit={onEdit} onDelete={onDelete} onAddSubtask={onAddSubtask} showSubtasks={showSubtasks} />
      ))}
    </>
  );
}

export default function MainContent() {
  const { user } = useAuth();
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();

  // Modal state
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentTask, setParentTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", prioridad: "media", fecha_limite: "", estado: "pendiente" });

  // Filtro y búsqueda
  const [showOnlyMain, setShowOnlyMain] = useState(true);
  const [search, setSearch] = useState("");

  const handleOpenCreate = () => {
    setEditingTask(null);
    setParentTask(null);
    setForm({ nombre: "", descripcion: "", prioridad: "media", fecha_limite: "", estado: "pendiente" });
    setOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setParentTask(null);
    setForm({
      nombre: task.nombre,
      descripcion: task.descripcion,
      prioridad: task.prioridad,
      fecha_limite: task.fecha_limite || "",
      estado: task.estado,
    });
    setOpen(true);
  };

  const handleOpenSubtask = (task: Task) => {
    setEditingTask(null);
    setParentTask(task);
    setForm({ nombre: "", descripcion: "", prioridad: "media", fecha_limite: "", estado: "pendiente" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setParentTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      await updateTask(editingTask.id, form);
    } else {
      await createTask({ ...form, tarea_padre_id: parentTask ? parentTask.id : null });
    }
    handleClose();
  };

  const handleDelete = async (task: Task) => {
    if (window.confirm("¿Seguro que deseas eliminar esta tarea y sus subtareas?")) {
      await deleteTask(task.id);
    }
  };

  // Filtrar tareas principales y búsqueda
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (showOnlyMain) {
      filtered = filtered.filter(t => t.tarea_padre_id === null);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      const filterTree = (arr: Task[]): Task[] =>
        arr
          .map(t => ({ ...t, subtareas: t.subtareas ? filterTree(t.subtareas) : [] }))
          .filter(t => t.nombre.toLowerCase().includes(s) || (t.subtareas && t.subtareas.length > 0));
      filtered = filterTree(filtered);
    }
    return filtered;
  }, [tasks, showOnlyMain, search]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        maxHeight: "100vh",
        overflow: "hidden",
        p: { xs: 1, md: 4 },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" noWrap>
          ¡Bienvenido, {user?.name}!
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Nueva tarea
        </Button>
      </Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <ToggleButtonGroup
          value={showOnlyMain ? "main" : "all"}
          exclusive
          onChange={(_, v) => setShowOnlyMain(v === "main")}
          size="small"
        >
          <ToggleButton value="main">Solo principales</ToggleButton>
          <ToggleButton value="all">Todas</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small"
          placeholder="Buscar por nombre"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220 }}
        />
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <TableContainer component={Paper} sx={{ maxHeight: "100%", overflow: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Fecha límite</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No hay tareas</TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onEdit={handleOpenEdit} onDelete={handleDelete} onAddSubtask={handleOpenSubtask} showSubtasks={!showOnlyMain} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingTask ? "Editar tarea" : parentTask ? "Nueva subtarea" : "Nueva tarea"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              required
            />
            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            />
            <TextField
              select
              label="Prioridad"
              value={form.prioridad}
              onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}
              required
            >
              {prioridades.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <TextField
              type="date"
              label="Fecha límite"
              value={form.fecha_limite}
              onChange={e => setForm(f => ({ ...f, fecha_limite: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Estado"
              value={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
              required
            >
              {estados.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingTask ? "Guardar" : "Crear"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 