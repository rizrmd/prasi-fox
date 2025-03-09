export const serveStatic = async (req: Request) => {
  const url = new URL(req.url);
  const requestPath = url.pathname;
  
  // Resolve the path to frontend/dist directory
  const distPath = "frontend/dist";
  const basePath = process.cwd();
  const fullPath = Bun.resolveSync(basePath, distPath + requestPath);
  
  // Security check to ensure the path is within the dist directory
  const distFullPath = Bun.resolveSync(basePath, distPath);
  if (!fullPath.startsWith(distFullPath)) {
    return new Response("Forbidden", { status: 403 });
  }
  
  const file = Bun.file(fullPath);
  
  // Check if file exists
  if (!(await file.exists())) {
    return new Response("Not Found", { status: 404 });
  }
  
  return new Response(file);
};
