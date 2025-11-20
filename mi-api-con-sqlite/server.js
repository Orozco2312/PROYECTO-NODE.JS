// ===================================
// ARCHIVO: server.js
// PROPÓSITO: Archivo principal de la aplicación
// ===================================

const express = require('express');
const app = express();

// Middleware para procesar JSON
app.use(express.json());

// Importar rutas

const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');

// ===================================
// RUTA RAÍZ - Página de bienvenida
// ===================================
app.get('/', (req, res) => {
  res.json({
    mensaje: '🎉 ¡Bienvenido a mi API con SQLite3!',
    version: '2.0.0',
    descripcion: 'Esta API permite gestionar tareas, categorias y productos usando SQLite3',
    endpoints: {
    
      categorias: [
        'GET /api/categorias',
        'GET /api/categorias/:id',
        'POST /api/categorias',
        'PUT /api/categorias/:id',
        'DELETE /api/categorias/:id'
      ],
      productos: [
        'GET /api/productos',
        'GET /api/productos/:id',
        'GET /api/productos/categoria/:categoria_id',
        'POST /api/productos',
        'PUT /api/productos/:id',
        'DELETE /api/productos/:id'
      ]
    },
    ejemplos: {
      
      'Crear categoria': {
        metodo: 'POST',
        url: '/api/categorias',
        body: {
          nombre: 'Electrónica',
          descripcion: 'Dispositivos y accesorios'
        }
      },
      'Crear producto': {
        metodo: 'POST',
        url: '/api/productos',
        body: {
          nombre: 'Teléfono X',
          descripcion: 'Smartphone ejemplo',
          precio: 899.99,
          stock: 10,
          categoria_id: 1
        }
      }
    }
  });
});

// ===================================
// USAR LAS RUTAS
// ===================================
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);

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
const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 SERVIDOR INICIADO EXITOSAMENTE 🚀               ║
║                                                       ║
║   📡 Puerto: ${PUERTO}                                ║
║   🌐 URL: http://localhost:${PUERTO}                  ║
║   🗄️  Base de datos: database/*.db                    ║
║                                                       ║
║   📖 Documentación: http://localhost:${PUERTO}/       ║
║                                                       ║
║   Presiona Ctrl+C para detener el servidor            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});
