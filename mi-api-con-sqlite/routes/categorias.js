// routes/categorias.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/categorias - obtener todas
router.get('/', (req, res) => {
  db.all('SELECT * FROM categorias ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener categorias', error: err.message });
    res.json({ success: true, cantidad: rows.length, datos: rows });
  });
});

// GET /api/categorias/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener categoria', error: err.message });
    if (!row) return res.status(404).json({ success: false, mensaje: `Categoria ${id} no encontrada` });
    res.json({ success: true, datos: row });
  });
});

// POST /api/categorias
router.post('/', (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ success: false, mensaje: 'El nombre es obligatorio' });

  const sql = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';
  db.run(sql, [nombre, descripcion || ''], function(err) {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al crear categoria', error: err.message });
    db.get('SELECT * FROM categorias WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ success: false, mensaje: 'Categoria creada pero error al obtenerla', error: err.message });
      res.status(201).json({ success: true, mensaje: 'Categoria creada', datos: row });
    });
  });
});

// PUT /api/categorias/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar categoria', error: err.message });
    if (!row) return res.status(404).json({ success: false, mensaje: `Categoria ${id} no encontrada` });

    if (nombre === undefined && descripcion === undefined) {
      return res.status(400).json({ success: false, mensaje: 'No se enviaron campos para actualizar' });
    }

    const campos = [];
    const valores = [];
    if (nombre !== undefined) { campos.push('nombre = ?'); valores.push(nombre); }
    if (descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(descripcion); }

    valores.push(id);
    const sql = `UPDATE categorias SET ${campos.join(', ')} WHERE id = ?`;
    db.run(sql, valores, function(err) {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar categoria', error: err.message });
      db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Categoria actualizada pero error al obtenerla', error: err.message });
        res.json({ success: true, mensaje: 'Categoria actualizada', datos: row });
      });
    });
  });
});

// DELETE /api/categorias/:id  (verifica que no tenga productos asociados)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, cat) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar categoria', error: err.message });
    if (!cat) return res.status(404).json({ success: false, mensaje: `Categoria ${id} no encontrada` });

    db.get('SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al verificar productos asociados', error: err.message });
      if (row.count > 0) {
        return res.status(400).json({ success: false, mensaje: 'No se puede eliminar la categoria porque tiene productos asociados' });
      }
      db.run('DELETE FROM categorias WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar categoria', error: err.message });
        res.json({ success: true, mensaje: 'Categoria eliminada', datos: cat });
      });
    });
  });
});

module.exports = router;
