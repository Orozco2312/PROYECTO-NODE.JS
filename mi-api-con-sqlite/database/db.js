// database/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'tienda.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
    return;
  }
  console.log('Conectado a la base de datos SQLite');


  // Tabla categorias 
  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creando categorias:', err.message);
    else {
      db.get('SELECT COUNT(*) as count FROM categorias', (err, row) => {
        if (!err && row.count === 0) {
          const stmt = db.prepare('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)');
          stmt.run('Electrónica', 'Dispositivos electrónicos');
          stmt.run('Hogar', 'Artículos para el hogar');
          stmt.run('Ropa', 'Prendas de vestir');
          stmt.finalize();
        }
      });
    }
  });

  // Tabla productos con FK a categorias
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

module.exports = db;
