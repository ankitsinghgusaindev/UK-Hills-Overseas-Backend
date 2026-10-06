export function successResponse<T>(
  data: T,
  message = "Request successful",
  status = 200,
  meta?: Record<string, unknown>,
) {
  return Response.json(
    {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    },
    { status },
  );
}

export function errorResponse(
  message: string,
  status = 500,
  errors?: unknown,
) {
  return Response.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    { status },
  );
}