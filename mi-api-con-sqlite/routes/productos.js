// routes/productos.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Helper: validar que categoria exista
function categoriaExiste(id, cb) {
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
    if (err) return cb(err);
    cb(null, !!row, row);
  });
}

// GET /api/productos
router.get('/', (req, res) => {
  db.all('SELECT * FROM productos ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener productos', error: err.message });
    res.json({ success: true, cantidad: rows.length, datos: rows });
  });
});

// GET /api/productos/:id (incluye categoria)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener producto', error: err.message });
    if (!row) return res.status(404).json({ success: false, mensaje: `Producto ${id} no encontrado` });
    res.json({ success: true, datos: row });
  });
});

// GET /api/productos/categoria/:categoria_id
router.get('/categoria/:categoria_id', (req, res) => {
  const { categoria_id } = req.params;
  db.all('SELECT * FROM productos WHERE categoria_id = ? ORDER BY id ASC', [categoria_id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener productos por categoria', error: err.message });
    res.json({ success: true, cantidad: rows.length, datos: rows });
  });
});

// POST /api/productos
router.post('/', (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id } = req.body;
  if (!nombre || precio === undefined) return res.status(400).json({ success: false, mensaje: 'nombre y precio son obligatorios' });
  if (categoria_id !== undefined && categoria_id !== null) {
    categoriaExiste(categoria_id, (err, existe) => {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al validar categoria', error: err.message });
      if (!existe) return res.status(400).json({ success: false, mensaje: 'La categoria indicada no existe' });
      insertProducto();
    });
  } else {
    insertProducto();
  }

  function insertProducto() {
    const sql = 'INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [nombre, descripcion || '', precio, stock || 0, categoria_id || null], function(err) {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al crear producto', error: err.message });
      db.get('SELECT * FROM productos WHERE id = ?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Producto creado pero error al obtenerlo', error: err.message });
        res.status(201).json({ success: true, mensaje: 'Producto creado', datos: row });
      });
    });
  }
});

// PUT /api/productos/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria_id } = req.body;

  db.get('SELECT * FROM productos WHERE id = ?', [id], (err, prod) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar producto', error: err.message });
    if (!prod) return res.status(404).json({ success: false, mensaje: `Producto ${id} no encontrado` });

    const campos = [];
    const valores = [];

    if (nombre !== undefined) { campos.push('nombre = ?'); valores.push(nombre); }
    if (descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(descripcion); }
    if (precio !== undefined) { campos.push('precio = ?'); valores.push(precio); }
    if (stock !== undefined) { campos.push('stock = ?'); valores.push(stock); }
    if (categoria_id !== undefined) { campos.push('categoria_id = ?'); valores.push(categoria_id); }

    if (campos.length === 0) return res.status(400).json({ success: false, mensaje: 'No se enviaron campos para actualizar' });

    // validar categoria si se está actualizando
    const runUpdate = () => {
      campos.push('fecha_actualizacion = CURRENT_TIMESTAMP');
      valores.push(id);
      const sql = `UPDATE productos SET ${campos.join(', ')} WHERE id = ?`;
      db.run(sql, valores, function(err) {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar producto', error: err.message });
        db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
          if (err) return res.status(500).json({ success: false, mensaje: 'Producto actualizado pero error al obtenerlo', error: err.message });
          res.json({ success: true, mensaje: 'Producto actualizado', datos: row });
        });
      });
    };

    if (categoria_id !== undefined && categoria_id !== null) {
      categoriaExiste(categoria_id, (err, existe) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al validar categoria', error: err.message });
        if (!existe) return res.status(400).json({ success: false, mensaje: 'La categoria indicada no existe' });
        runUpdate();
      });
    } else {
      runUpdate();
    }
  });
});

// DELETE /api/productos/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar producto', error: err.message });
    if (!row) return res.status(404).json({ success: false, mensaje: `Producto ${id} no encontrado` });

    db.run('DELETE FROM productos WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar producto', error: err.message });
      res.json({ success: true, mensaje: 'Producto eliminado', datos: row });
    });
  });
});

module.exports = router;
