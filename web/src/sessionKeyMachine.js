import { Machine, assign } from 'xstate';

import { connect, generateQR, haveKey } from './whatsapp_session';

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
            actions: 'updateQR',
          },
        },
      },
      awaitingQRScan: {
        invoke: {
          id: 'haveKey',
          src: 'haveKey',
        },
        on: {
          REFRESH_QR: {
            target: 'refreshingQR',
            actions: 'updateQR',
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
      generateQR: (ctx, _event) => send =>
        generateQR(
          ctx.connection,
          value => send({ type: 'QR_READY', value }),
          value => send({ type: 'ERROR', value }),
        ),
      haveKey: (ctx, _event) => send =>
        haveKey(
          ctx.connection,
          value => send({ type: 'GOT_KEY', value }),
          value => send({ type: 'ERROR', value }),
        ),
    },
    actions: {
      setQR: assign({
        qr: (_ctx, event) => event,
      }),
      setKey: assign({
        key: (_ctx, event) => event,
      }),
    },
  },
);
