export function connect() {
  if (typeof window === "undefined") return {};
  const connection = new WebSocket(process.env.WS_URL);
  return {
    on: (tag, onMessage, onError) => {
      const messageListener = ({ data }) => {
        const [payloadTag, payload] = data.split(/,(.*)/);
        if (payloadTag === tag) onMessage(payload);
      };
      const errorListener = ({ data }) => {
        onError(data);
      };

      connection.addEventListener("error", errorListener, { once: true });
      connection.addEventListener("message", messageListener, { once: true });
      return () => {
        connection.removeEventListener("message", messageListener);
        connection.removeEventListener("error", errorListener);
      };
    },
  };
}
export default connect;
