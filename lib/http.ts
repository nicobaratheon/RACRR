export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function errorResponse(error: string, status: number, message?: string): Response {
  return Response.json({ error, message: message ?? error }, { status });
}
