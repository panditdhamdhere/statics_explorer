type LogFn = (...args: unknown[]) => void;

const noop: LogFn = () => {};

const levels = {
  values: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10,
    silent: Infinity,
  },
};

function createLogger() {
  const logger = {
    child: () => logger,
    bindings: () => ({}),
    setBindings: () => {},
    level: "silent",
    levels,
    fatal: noop,
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
    trace: noop,
    silent: noop,
  };
  return logger;
}

function pino() {
  return createLogger();
}

pino.levels = levels;

export { levels };
export default pino;
