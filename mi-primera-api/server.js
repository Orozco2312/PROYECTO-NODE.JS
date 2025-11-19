// ===================================
// IMPORTAR EXPRESS
// ===================================
const express = require('express');


// ===================================
// CREAR LA APLICACIÓN
// ===================================
const app = express();


// ===================================
// CONFIGURACIÓN: Procesar JSON
// ===================================
app.use(express.json());


// ===================================
// BASE DE DATOS EN MEMORIA (Array)
// ===================================
let tareas = [
 {
   id: 1,
   titulo: 'Aprender Node.js',
   descripcion: 'Completar tutorial básico',
   completada: false
 },
 {
   id: 2,
   titulo: 'Crear una API REST',
   descripcion: 'Hacer un CRUD completo',
   completada: false
 },
 {
   id: 3,
   titulo: 'Aprender SQL',
   descripcion: 'Estudiar bases de datos relacionales',
   completada: true
 }
];


// ===================================
// RUTA 1: PÁGINA DE INICIO
// ===================================
app.get('/', (req, res) => {
 res.json({
   mensaje: '¡Bienvenido a mi primera API!',
   version: '1.0.0',
   endpoints: [
     'GET /api/tareas - Ver todas las tareas',
     'GET /api/tareas/:id - Ver una tarea específica',
     'POST /api/tareas - Crear una nueva tarea',
     'PUT /api/tareas/:id - Actualizar una tarea',
     'DELETE /api/tareas/:id - Eliminar una tarea'
   ]
 });
});


// ===================================
// RUTA 2: OBTENER TODAS LAS TAREAS (READ)
// ===================================
app.get('/api/tareas', (req, res) => {
 res.json({
   success: true,
   cantidad: tareas.length,
   datos: tareas
 });
});


// ===================================
// RUTA 3: OBTENER UNA TAREA POR ID (READ)
// ===================================
app.get('/api/tareas/:id', (req, res) => {
 // Obtener el ID de la URL
 const id = parseInt(req.params.id);
  // Buscar la tarea en el array
 const tarea = tareas.find(t => t.id === id);
  // Si no existe, devolver error
 if (!tarea) {
   return res.status(404).json({
     success: false,
     mensaje: `No se encontró ninguna tarea con el ID ${id}`
   });
 }
  // Si existe, devolver la tarea
 res.json({
   success: true,
   datos: tarea
 });
});


// ===================================
// RUTA 4: CREAR UNA NUEVA TAREA (CREATE)
// ===================================
app.post('/api/tareas', (req, res) => {
 // Obtener los datos del cuerpo de la petición
 const { titulo, descripcion } = req.body;
  // Validar que el título existe
 if (!titulo) {
   return res.status(400).json({
     success: false,
     mensaje: 'El título es obligatorio'
   });
 }
  // Crear la nueva tarea
 const nuevaTarea = {
   id: tareas.length + 1, // Generar ID automático
   titulo: titulo,
   descripcion: descripcion || '', // Si no hay descripción, dejar vacío
   completada: false
 };
  // Agregar al array
 tareas.push(nuevaTarea);
  // Devolver la tarea creada con código 201 (Created)
 res.status(201).json({
   success: true,
   mensaje: 'Tarea creada exitosamente',
   datos: nuevaTarea
 });
});


// ===================================
// RUTA 5: ACTUALIZAR UNA TAREA (UPDATE)
// ===================================
app.put('/api/tareas/:id', (req, res) => {
 // Obtener el ID de la URL
 const id = parseInt(req.params.id);
  // Buscar la tarea
 const tarea = tareas.find(t => t.id === id);
  // Si no existe, devolver error
 if (!tarea) {
   return res.status(404).json({
     success: false,
     mensaje: `No se encontró ninguna tarea con el ID ${id}`
   });
 }
  // Obtener los nuevos datos del cuerpo de la petición
 const { titulo, descripcion, completada } = req.body;
  // Actualizar solo los campos que se enviaron
 if (titulo !== undefined) {
   tarea.titulo = titulo;
 }
  if (descripcion !== undefined) {
   tarea.descripcion = descripcion;
 }
  if (completada !== undefined) {
   tarea.completada = completada;
 }
  // Devolver la tarea actualizada
 res.json({
   success: true,
   mensaje: 'Tarea actualizada exitosamente',
   datos: tarea
 });
});


// ===================================
// RUTA 6: ELIMINAR UNA TAREA (DELETE)
// ===================================
app.delete('/api/tareas/:id', (req, res) => {
 // Obtener el ID de la URL
 const id = parseInt(req.params.id);
  // Buscar el índice de la tarea en el array
 const indice = tareas.findIndex(t => t.id === id);
  // Si no existe, devolver error
 if (indice === -1) {
   return res.status(404).json({
     success: false,
     mensaje: `No se encontró ninguna tarea con el ID ${id}`
   });
 }
  // Eliminar la tarea del array
 const tareaEliminada = tareas.splice(indice, 1)[0];
  // Devolver la tarea eliminada
 res.json({
   success: true,
   mensaje: 'Tarea eliminada exitosamente',
   datos: tareaEliminada
 });
});



// ===================================
// INICIAR EL SERVIDOR
// ===================================
const PUERTO = 3000;
app.listen(PUERTO, () => {
 console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 SERVIDOR INICIADO EXITOSAMENTE 🚀        ║
║                                               ║
║   📡 Puerto: ${PUERTO}                        ║
║   🌐 URL: http://localhost:${PUERTO}          ║
║                                               ║
║   Presiona Ctrl+C para detener el servidor    ║
║                                               ║
╚═══════════════════════════════════════════════╝
 `);
});
