import VError from "verror";

export function catchChainedError(message: string) {
  return function onError(originError: any) {
    const wrappedError = new VError(originError, message);
    return wrappedError;
  };
}

export function throwChainedError(message: string) {
  return function onError(error: any) {
    throw new VError(error, message);
  };
}
