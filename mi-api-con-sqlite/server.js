// ===================================
// ARCHIVO: server.js
// PROPÓSITO: Archivo principal de la aplicación
// ===================================


const express = require('express');
const app = express();


// Middleware para procesar JSON
app.use(express.json());


// Importar rutas
const tareasRoutes = require('./routes/tareas');


// ===================================
// RUTA RAÍZ - Página de bienvenida
// ===================================
app.get('/', (req, res) => {
 res.json({
   mensaje: '🎉 ¡Bienvenido a mi API de Tareas con SQLite3!',
   version: '2.0.0',
   descripcion: 'Esta API permite gestionar tareas usando una base de datos SQLite3',
   endpoints: {
     'GET /api/tareas': 'Obtener todas las tareas',
     'GET /api/tareas/:id': 'Obtener una tarea específica',
     'POST /api/tareas': 'Crear una nueva tarea',
     'PUT /api/tareas/:id': 'Actualizar una tarea',
     'DELETE /api/tareas/:id': 'Eliminar una tarea'
   },
   ejemplos: {
     'Crear tarea': {
       metodo: 'POST',
       url: '/api/tareas',
       body: {
         titulo: 'Mi nueva tarea',
         descripcion: 'Descripción de la tarea'
       }
     },
     'Actualizar tarea': {
       metodo: 'PUT',
       url: '/api/tareas/1',
       body: {
         completada: true
       }
     }
   }
 });
});


// ===================================
// USAR LAS RUTAS
// ===================================
app.use('/api/tareas', tareasRoutes);


// ===================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ===================================
app.use((req, res) => {
 res.status(404).json({
   success: false,
   mensaje: 'Ruta no encontrada',
   ruta_solicitada: req.url,
   metodo: req.method
 });
});


// ===================================
// MANEJO DE ERRORES GLOBALES
// ===================================
app.use((err, req, res, next) => {
 console.error('Error:', err.stack);
  res.status(500).json({
   success: false,
   mensaje: 'Error interno del servidor',
   error: process.env.NODE_ENV === 'development' ? err.message : undefined
 });
});


// ===================================
// INICIAR EL SERVIDOR
// ===================================
const PUERTO = 3000;
app.listen(PUERTO, () => {
 console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 SERVIDOR INICIADO EXITOSAMENTE 🚀                ║
║                                                       ║
║   📡 Puerto: ${PUERTO}                                ║
║   🌐 URL: http://localhost:${PUERTO}                  ║
║   🗄️  Base de datos: SQLite3                          ║
║   📁 Archivo DB: database/tareas.db                   ║
║                                                       ║
║   📖 Documentación: http://localhost:${PUERTO}/       ║
║                                                       ║
║   Presiona Ctrl+C para detener el servidor            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
 `);
});
