import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { albumCrearSchema, albumActualizarSchema } from './schemas.js';
import { generarSlug } from './slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

app.use('/imagenes', express.static(path.join(__dirname, '..', 'imagenes')));

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

app.post('/albumes', (req, res) => {
  const parseo = albumCrearSchema.safeParse(req.body);
  if (!parseo.success) {
    return res.status(400).json({ error: 'Datos invalidos', detalles: parseo.error.issues });
  }
  const datos = parseo.data;
  const slug = generarSlug(datos.titulo);

  const existe = db.prepare('SELECT 1 FROM albumes WHERE slug = ?').get(slug);
  if (existe) {
    return res.status(409).json({ error: `Ya existe un album con el slug "${slug}"` });
  }

  const album = { slug, ...datos };
  db.prepare(`
    INSERT INTO albumes (slug, titulo, artista, genero, anio, sello, pistas, imagen, resumen, descripcion)
    VALUES (@slug, @titulo, @artista, @genero, @anio, @sello, @pistas, @imagen, @resumen, @descripcion)
  `).run(album);

  res.status(201).location(`/album/${slug}`).json(album);
});

app.put('/album/:slug', (req, res) => {
  const actual = db.prepare('SELECT * FROM albumes WHERE slug = ?').get(req.params.slug);
  if (!actual) {
    return res.status(404).json({ error: 'Album no encontrado' });
  }

  const parseo = albumActualizarSchema.safeParse(req.body);
  if (!parseo.success) {
    return res.status(400).json({ error: 'Datos invalidos', detalles: parseo.error.issues });
  }

  const actualizado = { ...actual, ...parseo.data };
  db.prepare(`
    UPDATE albumes
       SET titulo = @titulo, artista = @artista, genero = @genero, anio = @anio,
           sello = @sello, pistas = @pistas, imagen = @imagen,
           resumen = @resumen, descripcion = @descripcion
     WHERE slug = @slug
  `).run(actualizado);

  res.status(200).json(actualizado);
});

app.delete('/album/:slug', (req, res) => {
  const resultado = db.prepare('DELETE FROM albumes WHERE slug = ?').run(req.params.slug);
  if (resultado.changes === 0) {
    return res.status(404).json({ error: 'Album no encontrado' });
  }
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`DiscoStore API escuchando en http://${HOST}:${PORT}`);
});
