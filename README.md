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

## Poblado de la base de datos

La carga del archivo JSON es **obligatoria**: al iniciar el servidor por primera vez:

1. Se crea (si no existe) la base SQLite en `data/discostore.db`.
2. Si la tabla `albumes` esta vacia, se carga automaticamente todo `data/albumes.json`.

A partir de ese momento, las operaciones POST / PUT / DELETE modifican la base de datos. Para repoblar desde cero basta con eliminar `data/discostore.db` y volver a iniciar el servidor.

## Ejecucion

```bash
npm start
```

Salida esperada:

```
DiscoStore API escuchando en http://localhost:3000
```

## Endpoints

| Metodo | Ruta              | Codigo exito | Descripcion                                  |
|--------|-------------------|--------------|----------------------------------------------|
| GET    | /                 | 200          | Informacion del API                          |
| GET    | /albumes          | 200          | Lista todos los albumes                      |
| GET    | /album/:slug      | 200          | Devuelve un album por su slug                |
| GET    | /genero/:genero   | 200          | Devuelve los slugs de los albumes del genero |
| GET    | /search/:text     | 200          | Busca albumes por titulo o artista           |
| POST   | /albumes          | 201          | Crea un album (cabecera `Location`)          |
| PUT    | /album/:slug      | 200          | Actualiza un album                           |
| DELETE | /album/:slug      | 204          | Elimina un album                             |
| GET    | /imagenes/*       | 200          | Sirve imagenes de portadas                   |

### Codigos de error

- **400 Bad Request** — la validacion del cuerpo con Zod fallo.
- **404 Not Found** — el album indicado no existe.
- **409 Conflict** — se intenta crear un album cuyo slug ya existe.

## Estructura de un album

```json
{
  "titulo": "Thriller",
  "artista": "Michael Jackson",
  "genero": "Pop",
  "anio": 1982,
  "sello": "Epic",
  "pistas": 9,
  "imagen": "thriller.avif",
  "slug": "thriller",
  "resumen": "El album mas vendido de la historia.",
  "descripcion": "Album de Michael Jackson que redefinio la musica pop de los anos 80."
}
```

El campo `slug` se genera a partir del `titulo` en el servidor (no se envia en POST).

## Ejemplos de uso

```bash
# Listar todos los albumes
curl http://localhost:3000/albumes

# Obtener uno por slug
curl http://localhost:3000/album/thriller

# Listar slugs por genero
curl http://localhost:3000/genero/Pop

# Buscar por titulo o artista
curl http://localhost:3000/search/jackson

# Crear un album
curl -X POST http://localhost:3000/albumes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "OK Computer",
    "artista": "Radiohead",
    "genero": "Rock Alternativo",
    "anio": 1997,
    "sello": "Parlophone",
    "pistas": 12,
    "imagen": "ok-computer.avif",
    "resumen": "Tercer album de Radiohead.",
    "descripcion": "Disco clave del rock alternativo de los 90."
  }'

# Actualizar (campos parciales)
curl -X PUT http://localhost:3000/album/thriller \
  -H "Content-Type: application/json" \
  -d '{ "pistas": 10 }'

# Eliminar
curl -X DELETE http://localhost:3000/album/thriller
```

## Estructura del proyecto

```
LAB14/
├── data/
│   ├── albumes.json        # semilla obligatoria
│   └── discostore.db       # SQLite (generado, ignorado por git)
├── imagenes/               # portadas servidas en /imagenes/*
├── src/
│   ├── index.js            # servidor Express y rutas
│   ├── db.js               # conexion SQLite + carga del JSON
│   ├── schemas.js          # validaciones Zod
│   └── slug.js             # generador de slugs
├── .env                    # PORT y HOST (no se sube)
├── .env.example
├── package.json
├── README.md
└── REFERENCIAS.md
```
