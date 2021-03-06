/* eslint-disable react/prop-types */
import React from "react";
import QRCode from "qrcode-react";
import { useMachine } from "@xstate/react";

import sessionKeyMachine from "../lib/sessionKeyMachine";

function Loading() {
  return <span>loading</span>;
}
function Error({ onRetry }) {
  return (
    <button type="button" onClick={onRetry}>
      error, click to retry
    </button>
  );
}
function Key({ value }) {
  return <span>{value}</span>;
}

function Session() {
  const [current, send] = useMachine(sessionKeyMachine);
  return {
    generatingQR: <Loading />,
    awaitingQRScan: <QRCode value={current.context.qr} />,
    failed: <Error onRetry={() => send("RETRY")} />,
    success: <Key value={JSON.stringify(current.context.key)} />,
  }[current.value];
}

export default Session;
