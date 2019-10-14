import React from 'react';
import QRCode from 'qrcode-react';
import { useMachine } from '@xstate/react';

import sessionKeyMachine from './sessionKeyMachine';

function Loading() {
  return <span>carregando</span>;
}
function Error({ onRetry }) {
  return <button onClick={onRetry}>ERRO</button>;
}
function Key({ value }) {
  return <span>{value}</span>;
}

function Home() {
  const [current, send] = useMachine(sessionKeyMachine);
  return {
    generatingQR: <Loading />,
    awaitingQRScan: <QRCode value={current.context.qr} />,
    failed: <Error onRetry={() => send('RETRY')} />,
    success: <Key value={JSON.stringify(current.context.key)} />,
  }[current.value];
}

export default Home;
