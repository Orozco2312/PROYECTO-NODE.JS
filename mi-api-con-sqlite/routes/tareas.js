// ===================================
// ARCHIVO: routes/tareas.js
// PROPÓSITO: Definir todas las rutas relacionadas con tareas
// ===================================


const express = require('express');
const router = express.Router();
const db = require('../database/db');


// ===================================
// FUNCIÓN AUXILIAR: Convertir 0/1 a booleano
// ===================================
const convertirCompletada = (tareas) => {
 return tareas.map(tarea => ({
   ...tarea,
   completada: tarea.completada === 1 ? true : false
 }));
};


// ===================================
// RUTA 1: OBTENER TODAS LAS TAREAS (READ)
// ===================================
router.get('/', (req, res) => {
 const sql = 'SELECT * FROM tareas ORDER BY id ASC';
  db.all(sql, [], (err, rows) => {
   if (err) {
     return res.status(500).json({
       success: false,
       mensaje: 'Error al obtener las tareas',
       error: err.message
     });
   }
  
   res.json({
     success: true,
     cantidad: rows.length,
     datos: convertirCompletada(rows)
   });
 });
});


// ===================================
// RUTA 2: OBTENER UNA TAREA POR ID (READ)
// ===================================
router.get('/:id', (req, res) => {
 const { id } = req.params;
 const sql = 'SELECT * FROM tareas WHERE id = ?';
  db.get(sql, [id], (err, row) => {
   if (err) {
     return res.status(500).json({
       success: false,
       mensaje: 'Error al obtener la tarea',
       error: err.message
     });
   }
  
   if (!row) {
     return res.status(404).json({
       success: false,
       mensaje: `No se encontró ninguna tarea con el ID ${id}`
     });
   }
  
   res.json({
     success: true,
     datos: {
       ...row,
       completada: row.completada === 1 ? true : false
     }
   });
 });
});


// ===================================
// RUTA 3: CREAR UNA NUEVA TAREA (CREATE)
// ===================================
router.post('/', (req, res) => {
 const { titulo, descripcion } = req.body;
  // Validar que el título existe
 if (!titulo) {
   return res.status(400).json({
     success: false,
     mensaje: 'El título es obligatorio'
   });
 }
  const sql = 'INSERT INTO tareas (titulo, descripcion) VALUES (?, ?)';
  db.run(sql, [titulo, descripcion || ''], function(err) {
   if (err) {
     return res.status(500).json({
       success: false,
       mensaje: 'Error al crear la tarea',
       error: err.message
     });
   }
  
   // this.lastID contiene el ID de la fila insertada
   const sqlSelect = 'SELECT * FROM tareas WHERE id = ?';
  
   db.get(sqlSelect, [this.lastID], (err, row) => {
     if (err) {
       return res.status(500).json({
         success: false,
         mensaje: 'Tarea creada pero error al obtenerla',
         error: err.message
       });
     }
    
     res.status(201).json({
       success: true,
       mensaje: 'Tarea creada exitosamente',
       datos: {
         ...row,
         completada: row.completada === 1 ? true : false
       }
     });
   });
 });
});


// ===================================
// RUTA 4: ACTUALIZAR UNA TAREA (UPDATE)
// ===================================
router.put('/:id', (req, res) => {
 const { id } = req.params;
 const { titulo, descripcion, completada } = req.body;
  // Primero verificar que la tarea existe
 db.get('SELECT * FROM tareas WHERE id = ?', [id], (err, row) => {
   if (err) {
     return res.status(500).json({
       success: false,
       mensaje: 'Error al buscar la tarea',
       error: err.message
     });
   }
  
   if (!row) {
     return res.status(404).json({
       success: false,
       mensaje: `No se encontró ninguna tarea con el ID ${id}`
     });
   }
  
   // Construir la consulta SQL dinámicamente
   let campos = [];
   let valores = [];
  
   if (titulo !== undefined) {
     campos.push('titulo = ?');
     valores.push(titulo);
   }
  
   if (descripcion !== undefined) {
     campos.push('descripcion = ?');
     valores.push(descripcion);
   }
  
   if (completada !== undefined) {
     campos.push('completada = ?');
     valores.push(completada ? 1 : 0);
   }
  
   // Agregar fecha de actualización
   campos.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  
   // Si no hay campos para actualizar
   if (campos.length === 1) { // Solo la fecha
     return res.status(400).json({
       success: false,
       mensaje: 'No se enviaron campos para actualizar'
     });
   }
  
   // Agregar el ID al final
   valores.push(id);
  
   const sql = `UPDATE tareas SET ${campos.join(', ')} WHERE id = ?`;
  
   db.run(sql, valores, function(err) {
     if (err) {
       return res.status(500).json({
         success: false,
         mensaje: 'Error al actualizar la tarea',
         error: err.message
       });
     }
    
     // Obtener la tarea actualizada
     db.get('SELECT * FROM tareas WHERE id = ?', [id], (err, row) => {
       if (err) {
         return res.status(500).json({
           success: false,
           mensaje: 'Tarea actualizada pero error al obtenerla',
           error: err.message
         });
       }
      
       res.json({
         success: true,
         mensaje: 'Tarea actualizada exitosamente',
         datos: {
           ...row,
           completada: row.completada === 1 ? true : false
         }
       });
     });
   });
 });
});


// ===================================
// RUTA 5: ELIMINAR UNA TAREA (DELETE)
// ===================================
router.delete('/:id', (req, res) => {
 const { id } = req.params;
  // Primero obtener la tarea para devolverla después
 db.get('SELECT * FROM tareas WHERE id = ?', [id], (err, row) => {
   if (err) {
     return res.status(500).json({
       success: false,
       mensaje: 'Error al buscar la tarea',
       error: err.message
     });
   }
  
   if (!row) {
     return res.status(404).json({
       success: false,
       mensaje: `No se encontró ninguna tarea con el ID ${id}`
     });
   }
  
   // Eliminar la tarea
   const sql = 'DELETE FROM tareas WHERE id = ?';
  
   db.run(sql, [id], function(err) {
     if (err) {
       return res.status(500).json({
         success: false,
         mensaje: 'Error al eliminar la tarea',
         error: err.message
       });
     }
    
     res.json({
       success: true,
       mensaje: 'Tarea eliminada exitosamente',
       datos: {
         ...row,
         completada: row.completada === 1 ? true : false
       }
     });
   });
 });
});


// Exportar el router
module.exports = router;
