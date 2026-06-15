import 'dotenv/config';
import express from 'express';
import { db } from './db.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'DiscoStore API',
    version: '1.0.0',
    descripcion: 'API REST para administrar el catalogo de albumes de DiscoStore',
    endpoints: {
      'GET /albumes': 'Lista todos los albumes',
      'GET /album/:slug': 'Devuelve un album por su slug',
      'GET /genero/:genero': 'Devuelve los slugs de los albumes del genero',
      'GET /search/:text': 'Busca albumes por titulo o artista',
      'POST /albumes': 'Crea un album',
      'PUT /album/:slug': 'Actualiza un album',
      'DELETE /album/:slug': 'Elimina un album',
      'GET /imagenes/*': 'Sirve imagenes de portadas'
    }
  });
});

app.get('/albumes', (req, res) => {
  const albumes = db.prepare('SELECT * FROM albumes ORDER BY titulo').all();
  res.status(200).json(albumes);
});

app.get('/album/:slug', (req, res) => {
  const album = db.prepare('SELECT * FROM albumes WHERE slug = ?').get(req.params.slug);
  if (!album) {
    return res.status(404).json({ error: 'Album no encontrado' });
  }
  res.status(200).json(album);
});

app.get('/genero/:genero', (req, res) => {
  const filas = db
    .prepare('SELECT slug FROM albumes WHERE LOWER(genero) = LOWER(?) ORDER BY titulo')
    .all(req.params.genero);
  res.status(200).json(filas.map((f) => f.slug));
});

app.get('/search/:text', (req, res) => {
  const q = `%${req.params.text}%`;
  const albumes = db
    .prepare(`
      SELECT * FROM albumes
      WHERE titulo LIKE ? COLLATE NOCASE
         OR artista LIKE ? COLLATE NOCASE
      ORDER BY titulo
    `)
    .all(q, q);
  res.status(200).json(albumes);
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`DiscoStore API escuchando en http://${HOST}:${PORT}`);
});
