import { Machine, assign } from 'xstate';

import { connect } from './whatsapp_session';

const sender = (send, type) => value => send({ type, value });

export default Machine(
  {
    initial: 'generatingQR',
    context: {
      connection: connect(),
      qr: undefined,
      key: undefined,
    },
    states: {
      generatingQR: {
        invoke: {
          id: 'awaitQR',
          src: 'generateQR',
        },
        on: {
          QR_READY: {
            target: 'awaitingQRScan',
            actions: 'setQR',
          },
        },
      },
      awaitingQRScan: {
        invoke: {
          id: 'awaitKey',
          src: 'haveKey',
        },
        on: {
          REFRESH_QR: {
            target: 'awaitingQRScan',
            actions: 'setQR',
          },
          GOT_KEY: {
            target: 'success',
            actions: 'setKey',
          },
        },
      },
      failed: {
        on: {
          RETRY: 'generatingQR',
        },
      },
      success: {
        type: 'final',
      },
      on: {
        ERROR: 'error',
      },
    },
  },
  {
    services: {
      generateQR: ctx => send => {
        const cleanQRListener = ctx.connection.on(
          'qr',
          sender(send, 'QR_READY'),
          sender(send, 'ERROR'),
        );
        return cleanQRListener;
      },
      haveKey: ctx => send => {
        const sendError = sender(send, 'ERROR');
        const cleanKeyListener = ctx.connection.on(
          'id',
          sender(send, 'GOT_KEY'),
          sendError,
        );
        const cleanQRListener = ctx.connection.on(
          'qr',
          sender(send, 'REFRESH_QR'),
          sendError,
        );
        return () => {
          cleanKeyListener();
          cleanQRListener();
        };
      },
    },
    actions: {
      setQR: assign({
        qr: (_ctx, { value }) => value,
      }),
      setKey: assign({
        key: (_ctx, { value }) => {
          console.log(value);
          return value;
        },
      }),
    },
  },
);
