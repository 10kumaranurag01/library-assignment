import { z } from "zod";

export const bookQuerySchema = z.object({
  name: z.string().optional(),
  rentMin: z.number().optional(),
  rentMax: z.number().optional(),
  category: z.string().optional(),
});
