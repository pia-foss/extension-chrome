function createMethod(context) {
  return (function call(callOpts) {
    this.$request = { ...callOpts };
    return Promise.resolve()
      .then(() => {
        return this.$response || new Response();
      });
  })
    // eslint-disable-next-line no-extra-bind
    .bind(context);
}

const http = {};
http.get = createMethod(http);
http.head = createMethod(http);
http.post = createMethod(http);

export default http;
