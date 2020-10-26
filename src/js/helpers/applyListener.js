export default function createApplyListener(fn) {
  return (app, api) => {
    fn(app, api.addListener.bind(api));
  };
}
