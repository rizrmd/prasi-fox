export const handleFrontendProxy = async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const response = await fetch(`http://localhost:4700${path}`, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
  return response;
};
