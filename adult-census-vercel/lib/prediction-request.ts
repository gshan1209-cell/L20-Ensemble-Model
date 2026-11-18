import { TextDecoder } from "node:util";

export const MAX_PREDICTION_REQUEST_BYTES = 8192;

export class PredictionRequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// Bound this scalar JSON API before JSON parsing or schema validation. This does
// not change Next's other parsers or repair dependencies bundled inside Next.
export async function readPredictionRequest(request: Request): Promise<unknown> {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new PredictionRequestError(415, "Content-Type must be application/json");
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_PREDICTION_REQUEST_BYTES) {
    throw new PredictionRequestError(413, "Prediction request exceeds 8192 bytes");
  }
  if (!request.body) {
    throw new PredictionRequestError(400, "Invalid JSON request");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_PREDICTION_REQUEST_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new PredictionRequestError(413, "Prediction request exceeds 8192 bytes");
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof PredictionRequestError) throw error;
    throw new PredictionRequestError(400, "Invalid JSON request");
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new PredictionRequestError(400, "Invalid JSON request");
  }
}
