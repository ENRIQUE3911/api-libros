// =====================================================
// API REST básica de Libros con Node.js y Express
// Bloque 3 - Actividad 1 - Programación para la Web (UGB)
// Autor: José Enrique Castillo Benavides
// =====================================================

// 1. Importar Express
const express = require('express');

// 2. Crear la aplicación
const app = express();
const PORT = process.env.PORT || 3000; // Render asigna su propio puerto; en local se usa 3000

// 3. "Base de datos" en memoria: arreglo de objetos
const libros = [
  { id: 1, nombre: 'Cien años de soledad', anioPublicacion: 1967, autor: 'Gabriel García Márquez', disponible: true },
  { id: 2, nombre: 'Don Quijote de la Mancha', anioPublicacion: 1605, autor: 'Miguel de Cervantes', disponible: true },
  { id: 3, nombre: 'Cuentos de barro', anioPublicacion: 1933, autor: 'Salarrué', disponible: false },
  { id: 4, nombre: 'El principito', anioPublicacion: 1943, autor: 'Antoine de Saint-Exupéry', disponible: true },
  { id: 5, nombre: '1984', anioPublicacion: 1949, autor: 'George Orwell', disponible: false },
  { id: 6, nombre: 'Clean Code', anioPublicacion: 2008, autor: 'Robert C. Martin', disponible: true },
  { id: 7, nombre: 'JavaScript: The Good Parts', anioPublicacion: 2008, autor: 'Douglas Crockford', disponible: true },
  { id: 8, nombre: 'El amor en los tiempos del cólera', anioPublicacion: 1985, autor: 'Gabriel García Márquez', disponible: true }
];

// =====================================================
// RUTAS
// =====================================================

// Criterio 1: Listar todos los libros
// GET /libros
app.get('/libros', (req, res) => {
  res.status(200).json({
    total: libros.length,
    libros: libros
  });
});

// Criterio 2: Ruta que devuelve un JSON con los libros disponibles
// GET /libros/disponibles
app.get('/libros/disponibles', (req, res) => {
  const disponibles = libros.filter((libro) => libro.disponible === true);

  res.status(200).json({
    total: disponibles.length,
    libros: disponibles
  });
});

// Función auxiliar: quita tildes, pasa a minúsculas y elimina espacios
// extremos, para que la búsqueda no falle por mayúsculas o acentos.
const normalizar = (texto) =>
  String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Criterio 3: Buscar libros por nombre (parámetro de consulta)
// GET /libros/buscar?nombre=texto
app.get('/libros/buscar', (req, res) => {
  const { nombre } = req.query;

  // Validación: el parámetro "nombre" es obligatorio
  if (!nombre || normalizar(nombre) === '') {
    return res.status(400).json({
      error: 'Parámetro requerido',
      mensaje: 'Debe enviar el parámetro "nombre". Ejemplo: /libros/buscar?nombre=quijote'
    });
  }

  const resultados = libros.filter((libro) =>
    normalizar(libro.nombre).includes(normalizar(nombre))
  );

  // Sin coincidencias
  if (resultados.length === 0) {
    return res.status(404).json({
      error: 'Sin resultados',
      mensaje: `No se encontraron libros que coincidan con "${nombre}"`
    });
  }

  res.status(200).json({
    busqueda: nombre,
    total: resultados.length,
    libros: resultados
  });
});

// Criterio 4: Obtener detalles de un libro por ID (ruta dinámica)
// GET /libros/:id
// IMPORTANTE: va después de /libros/disponibles y /libros/buscar,
// para que esas palabras no se interpreten como un :id.
app.get('/libros/:id', (req, res) => {
  // req.params.id llega como texto; se convierte a número
  const id = Number(req.params.id);

  // Validación: el ID debe ser un número entero positivo
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID inválido',
      mensaje: `El ID "${req.params.id}" no es válido. Debe ser un número entero positivo.`
    });
  }

  const libro = libros.find((l) => l.id === id);

  // Libro no encontrado
  if (!libro) {
    return res.status(404).json({
      error: 'Libro no encontrado',
      mensaje: `No existe un libro con el ID ${id}`
    });
  }

  res.status(200).json(libro);
});

// =====================================================
// Criterio 5: MANEJO DE ERRORES (siempre en JSON)
// Estos middleware van DESPUÉS de todas las rutas.
// =====================================================

// Ruta no existente -> 404 en formato JSON
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe`
  });
});

// Errores inesperados -> respuesta JSON con el código adecuado
app.use((err, req, res, next) => {
  console.error(err); // registro técnico solo en la terminal del servidor

  const status = err.status || err.statusCode || 500;

  if (status === 500) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'Ocurrió un error inesperado. Intente nuevamente.'
    });
  }

  res.status(status).json({
    error: 'Solicitud inválida',
    mensaje: 'La solicitud no pudo procesarse. Verifique que la URL esté bien escrita.'
  });
});

// 4. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});