import { z } from 'zod';

export const albumCrearSchema = z.object({
  titulo: z.string().min(1),
  artista: z.string().min(1),
  genero: z.string().min(1),
  anio: z.number().int().gte(1900).lte(2100),
  sello: z.string().min(1),
  pistas: z.number().int().positive(),
  imagen: z.string().min(1),
  resumen: z.string().min(1),
  descripcion: z.string().min(1)
});

export const albumActualizarSchema = albumCrearSchema.partial();
