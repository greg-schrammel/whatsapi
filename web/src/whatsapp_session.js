export function connect() {
  if (typeof window === 'undefined') return {};
  const connection = new WebSocket('ws://127.0.0.1:3000/w');
  return {
    on: (tag, onMessage, onError) => {
      connection.onmessage = message => {
        if (message.type !== 'utf8') return;
        const [payloadTag, payload] = message.utf8Data.split(/,(.*)/);
        if (payloadTag === tag) onMessage(payload);
      };
      connection.onerror = onError;
    },
  };
}

export async function generateQR(connection, send, sendError) {
  connection.on('qr', send, sendError);
}

export async function haveKey(connection, refreshQR, send, sendError) {
  connection.on('qr', refreshQR, sendError);
  connection.on('id', send, sendError);
}
