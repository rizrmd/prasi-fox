import { pack, unpack } from "msgpackr";

export const apiClient = <
  T extends { handler: (...arg: any[]) => Promise<any> }
>(
  path: string,
  opt?: { msgpack: boolean }
) => {
  if (typeof window === "undefined") {
    return null as unknown as T["handler"];
  }
  let cfg = (window as any).config as typeof config;
  return (async (...args: any[]) => {
    if (!cfg) {
      await new Promise<void>((done) => {
        const ival = setInterval(() => {
          if ((window as any).config) {
            done();
            clearInterval(ival);
          }
        }, 10);
      });
      cfg = (window as any).config as typeof config;
    }
    const url = new URL(location.href);
    url.pathname = path;
    const res = await fetch(url.toString(), {
      method: "POST",
      body: opt?.msgpack === false ? JSON.stringify(args) : pack(args),
      credentials: "include",
      headers:
        opt?.msgpack === false
          ? {
              "Content-Type": "application/json",
            }
          : {
              "Content-Type": "application/msgpack",
            },
    });

    return opt?.msgpack === false
      ? await res.json()
      : unpack(new Uint8Array(await res.arrayBuffer()));
  }) as T["handler"];
};
