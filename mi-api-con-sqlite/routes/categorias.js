// routes/categorias.js

// Cargar express
const express = require('express');
// Crear router
const router = express.Router();
// Cargar base de datos
const db = require('../database/db');

// GET todas las categorías
router.get('/', (req, res) => {
  // Obtener todo de la tabla categorias
  db.all('SELECT * FROM categorias ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener categorias', error: err.message });
    // Enviar respuesta con datos
    res.json({ success: true, cantidad: rows.length, datos: rows });
  });
});

// GET una categoría por id
router.get('/:id', (req, res) => {
  const { id } = req.params; // Tomar id de la URL
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener categoria', error: err.message });
    if (!row) return res.status(404).json({ success: false, mensaje: `Categoria ${id} no encontrada` });
    // Enviar la categoría encontrada
    res.json({ success: true, datos: row });
  });
});

// POST crear una nueva categoría
router.post('/', (req, res) => {
  const { nombre, descripcion } = req.body; // Datos enviados
  // Validar nombre
  if (!nombre) return res.status(400).json({ success: false, mensaje: 'El nombre es obligatorio' });

  const sql = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';
  // Insertar en la base de datos
  db.run(sql, [nombre, descripcion || ''], function(err) {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al crear categoria', error: err.message });

    // Buscar la categoría creada
    db.get('SELECT * FROM categorias WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ success: false, mensaje: 'Categoria creada pero error al obtenerla', error: err.message });
      res.status(201).json({ success: true, mensaje: 'Categoria creada', datos: row });
    });
  });
});

// PUT actualizar categoría
router.put('/:id', (req, res) => {
  const { id } = req.params; // id de la url
  const { nombre, descripcion } = req.body; // nuevos datos

  // Revisar si existe la categoria
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar categoria', error: err.message });
    if (!row) return res.status(404).json({ success: false, mensaje: `Categoria ${id} no encontrada` });

    // Verificar que haya campos para actualizar
    if (nombre === undefined && descripcion === undefined) {
      return res.status(400).json({ success: false, mensaje: 'No se enviaron campos para actualizar' });
    }

    // Armar lista de campos a actualizar
    const campos = [];
    const valores = [];
    if (nombre !== undefined) { campos.push('nombre = ?'); valores.push(nombre); }
    if (descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(descripcion); }

    valores.push(id); // id al final

    const sql = `UPDATE categorias SET ${campos.join(', ')} WHERE id = ?`;
    // Ejecutar actualización
    db.run(sql, valores, function(err) {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar categoria', error: err.message });

      // Volver a obtener la categoría actualizada
      db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Categoria actualizada pero error al obtenerla', error: err.message });
        res.json({ success: true, mensaje: 'Categoria actualizada', datos: row });
      });
    });
  });
});

// DELETE borrar categoría
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Ver si existe la categoria
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, cat) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar categoria', error: err.message });
    if (!cat) return res.status(404).json({ success: false, mensaje: `Categoria ${id} no encontrada` });

    // Ver si tiene productos asociados
    db.get('SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al verificar productos asociados', error: err.message });

      if (row.count > 0) {
        // Si tiene productos, no se puede borrar
        return res.status(400).json({ success: false, mensaje: 'No se puede eliminar la categoria porque tiene productos asociados' });
      }

      // Si no tiene productos, eliminar categoria
      db.run('DELETE FROM categorias WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar categoria', error: err.message });
        res.json({ success: true, mensaje: 'Categoria eliminada', datos: cat });
      });
    });
  });
});

// Exportar router
module.exports = router;
