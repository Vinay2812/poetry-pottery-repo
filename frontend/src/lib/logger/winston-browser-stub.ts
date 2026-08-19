// Browser stand-in for winston: aliased in next.config.ts so the real
// (Node-only) package never enters the client bundle. Never invoked, because
// the server logger is dead code in the browser build.
function serverOnly(): never {
  throw new Error("winston is server-only.");
}

export const createLogger = serverOnly;

export const format = {
  combine: serverOnly,
  timestamp: serverOnly,
  errors: serverOnly,
  json: serverOnly,
  colorize: serverOnly,
  simple: serverOnly,
};

export const transports = { Console: class Console {} };
