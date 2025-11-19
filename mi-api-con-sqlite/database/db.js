// ===================================
// ARCHIVO: database/db.js
// PROPÓSITO: Configurar la conexión a SQLite3
// ===================================


const sqlite3 = require('sqlite3').verbose();
const path = require('path');


// Ruta donde se guardará el archivo de base de datos
const DB_PATH = path.join(__dirname, 'tareas.db');


// Crear/abrir la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
 if (err) {
   console.error(' Error al conectar con la base de datos:', err.message);
 } else {
   console.log(' Conectado a la base de datos SQLite');
  
   // Crear la tabla si no existe
   db.run(`
     CREATE TABLE IF NOT EXISTS tareas (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       titulo TEXT NOT NULL,
       descripcion TEXT,
       completada INTEGER DEFAULT 0,
       fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
       fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
     )
   `, (err) => {
     if (err) {
       console.error(' Error al crear la tabla:', err.message);
     } else {
       console.log(' Tabla "tareas" lista');
      
       // Insertar datos de ejemplo si la tabla está vacía
       db.get('SELECT COUNT(*) as count FROM tareas', (err, row) => {
         if (row.count === 0) {
           console.log(' Insertando datos de ejemplo...');
          
           const tareasEjemplo = [
             ['Aprender Node.js', 'Completar tutorial básico de Node.js'],
             ['Crear una API REST', 'Hacer un CRUD completo con Express'],
             ['Aprender SQL', 'Estudiar bases de datos relacionales']
           ];
          
           const stmt = db.prepare('INSERT INTO tareas (titulo, descripcion) VALUES (?, ?)');
          
           tareasEjemplo.forEach(tarea => {
             stmt.run(tarea);
           });
          
           stmt.finalize(() => {
             console.log(' Datos de ejemplo insertados');
           });
         }
       });
     }
   });
 }
});
// Exportar la base de datos para usarla en otros archivos
module.exports = db;
