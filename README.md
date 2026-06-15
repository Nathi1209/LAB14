# DiscoStore API

API REST para administrar el catalogo de albumes de la tienda de musica **DiscoStore**.

## Tecnologias

- Node.js + Express
- SQLite (better-sqlite3)
- Zod (validacion)
- dotenv

## Requisitos

- Node.js 20 o superior

## Instalacion

```bash
npm install
```

## Configuracion

Copia `.env.example` a `.env` y ajusta si lo necesitas:

```
PORT=3000
HOST=localhost
```

## Ejecucion

```bash
npm start
```

Al iniciar, la base de datos SQLite se crea en `data/discostore.db` y se puebla automaticamente desde `data/albumes.json` si la tabla esta vacia.

## Endpoints

| Metodo | Ruta              | Descripcion                                  |
|--------|-------------------|----------------------------------------------|
| GET    | /                 | Informacion del API                          |
| GET    | /albumes          | Lista todos los albumes                      |
| GET    | /album/:slug      | Devuelve un album por su slug                |
| GET    | /genero/:genero   | Devuelve los slugs de los albumes del genero |
| GET    | /search/:text     | Busca albumes por titulo o artista           |
| POST   | /albumes          | Crea un album                                |
| PUT    | /album/:slug      | Actualiza un album                           |
| DELETE | /album/:slug      | Elimina un album                             |
| GET    | /imagenes/*       | Sirve imagenes de portadas                   |
