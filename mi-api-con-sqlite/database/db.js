// database/db.js

// Cargar SQLite
const sqlite3 = require('sqlite3').verbose();
// Cargar path para manejar rutas
const path = require('path');

// Ruta donde estará la base de datos
const DB_PATH = path.join(__dirname, 'tienda.db');

// Conectarse a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  // Si hay error al conectar
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
    return;
  }
  // Si todo salió bien
  console.log('Conectado a la base de datos SQLite');

  // Crear tabla categorias si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    // Si hubo error creando la tabla
    if (err) console.error('Error creando categorias:', err.message);
    else {
      // Contar cuántos registros hay
      db.get('SELECT COUNT(*) as count FROM categorias', (err, row) => {
        // Si no hay registros
        if (!err && row.count === 0) {
          // Preparar inserciones
          const stmt = db.prepare('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)');
          // Insertar categorías base
          stmt.run('Electrónica', 'Dispositivos electrónicos');
          stmt.run('Hogar', 'Artículos para el hogar');
          stmt.run('Ropa', 'Prendas de vestir');
          stmt.finalize(); // Terminar inserciones
        }
      });
    }
  });

  // Crear tabla productos con relación a categorias
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      categoria_id INTEGER,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
    )
  `);
});

// Exportar base de datos para usarla en otros archivos
module.exports = db;
