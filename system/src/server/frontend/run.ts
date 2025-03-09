export const runFrontendDev = () => {
  const frontend = Bun.spawn(["bun", "--silent", "run", "dev"], {
    cwd: "./frontend",
  });
};

export const buildFrontend = async () => {
  const frontend = Bun.spawn(["bun", "--silent", "run", "build"], {
    cwd: "./frontend",
  });
  await new Promise(async (resolve) => {
    const reader = frontend.stdout.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(new TextDecoder().decode(value));
    }
    frontend.kill();
    resolve(undefined);
  });
  return frontend;
};
