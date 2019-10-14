import React from 'react';
import Pusher from 'pusher-js';
import fetch from 'isomorphic-unfetch';
import uuid from 'uuid/v4';
import QRCode from 'qrcode-react';
import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';

const pusher = new Pusher(process.env.KEY, { cluster: process.env.CLUSTER });

function startLogin(channelId) {
  fetch(`http://127.0.0.1:3000/w?channel=${channelId}`);
}

function onEvent(channel, event) {
  return new Promise(resolve => channel.bind(event, resolve));
}

const newKeyMachine = Machine(
  {
    initial: 'awaitingQRScan',
    states: {
      generatingQr: {
        invoke: {
          id: 'awaitQR',
          src: 'awaitQRContent',
          onDone: 'awaitingQRScan',
          onError: 'failed',
        },
      },
      awaitingQRScan: {
        invoke: {
          id: 'awaitKey',
          src: 'awaitKey',
          onDone: 'success',
          onError: 'failed',
        },
      },
      failed: {
        on: {
          RETRY: 'generatingQr',
        },
      },
      success: {
        type: 'final',
      },
    },
  },
  {
    services: {
      awaitQRContent: (ctx, _event) => onEvent(ctx.channel, 'qr'),
      awaitKey: (ctx, _event) => onEvent(ctx.channel, 'id'),
    },
  },
);

function Loading() {
  return <span>carregando</span>;
}
function Error({ retry }) {
  return <button onClick={retry}>ERRO</button>;
}
function Key({ value }) {
  return <span>{value}</span>;
}

function Home({ qr, channelId }) {
  const [current, send] = useMachine(newKeyMachine, {
    context: {
      qr,
      channel: pusher.subscribe(channelId),
    },
  });
  return {
    generatingQR: <Loading />,
    awaitingQRScan: <QRCode value={current.context.qr} />,
    failed: <Error onRetry={() => send('RETRY')} />,
    success: <Key value={JSON.stringify(current.context.key)} />,
  }[current.value];
}

Home.getInitialProps = async () => {
  const channelId = uuid();
  pusher.subscribe(channelId);
  startLogin(channelId);
  const qr = await onEvent(channelId, 'qr');
  return { qr, channelId };
};

export default Home;
