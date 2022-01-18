import VError from "verror";

export function chainError(message: string) {
  return function onError(originError: any) {
    const wrappedError = new VError(originError, message);
    return wrappedError;
  };
}

export function chainAndThrowError(message: string) {
  return function throwError(error: any) {
    throw new VError(error, message);
  };
}
