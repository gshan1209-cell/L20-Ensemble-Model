import { z } from "zod";
import { CATEGORICAL_OPTIONS } from "./constants";

const categoricalSchema = (field: string) =>
  z.string().refine((val) => CATEGORICAL_OPTIONS[field]?.includes(val), {
    message: `Invalid value for ${field}`,
  });

export const predictionInputSchema = z.object({
  age: z.coerce.number().int().min(17).max(90),
  workclass: categoricalSchema("workclass"),
  education: categoricalSchema("education"),
  marital_status: categoricalSchema("marital_status"),
  occupation: categoricalSchema("occupation"),
  relationship: categoricalSchema("relationship"),
  race: categoricalSchema("race"),
  sex: categoricalSchema("sex"),
  capital_gain: z.coerce.number().int().min(0),
  capital_loss: z.coerce.number().int().min(0),
  hours_per_week: z.coerce.number().int().min(1).max(99),
  native_country: categoricalSchema("native_country"),
});

export type PredictionInput = z.infer<typeof predictionInputSchema>;
