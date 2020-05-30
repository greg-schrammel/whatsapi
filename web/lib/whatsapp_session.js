const WS_URL = `ws://127.0.0.1:3001/w`;

export function connect() {
  if (typeof window === "undefined") return {};
  const connection = new WebSocket(WS_URL);
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
