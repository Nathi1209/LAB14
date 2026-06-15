import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'discostore.db');
const seedPath = path.join(dataDir, 'albumes.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS albumes (
    slug         TEXT PRIMARY KEY,
    titulo       TEXT NOT NULL,
    artista      TEXT NOT NULL,
    genero       TEXT NOT NULL,
    anio         INTEGER NOT NULL,
    sello        TEXT NOT NULL,
    pistas       INTEGER NOT NULL,
    imagen       TEXT NOT NULL,
    resumen      TEXT NOT NULL,
    descripcion  TEXT NOT NULL
  );
`);

function poblarDesdeJSON() {
  if (!fs.existsSync(seedPath)) {
    throw new Error(`No se encontro el archivo semilla: ${seedPath}`);
  }
  const albumes = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  const insert = db.prepare(`
    INSERT INTO albumes (slug, titulo, artista, genero, anio, sello, pistas, imagen, resumen, descripcion)
    VALUES (@slug, @titulo, @artista, @genero, @anio, @sello, @pistas, @imagen, @resumen, @descripcion)
  `);
  const cargar = db.transaction((items) => {
    for (const a of items) insert.run(a);
  });
  cargar(albumes);
  console.log(`Base de datos poblada con ${albumes.length} albumes desde albumes.json`);
}

const total = db.prepare('SELECT COUNT(*) AS n FROM albumes').get().n;
if (total === 0) {
  poblarDesdeJSON();
}
