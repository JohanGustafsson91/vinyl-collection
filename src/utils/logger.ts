export const logger = {
  error: console.error,
  info: console.info,
  timeStart: (id: string) => {
    console.time(id);
    return function timeEnd() {
      console.timeEnd(id);
    };
  },
};
