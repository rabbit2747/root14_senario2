import http from "node:http";

const targetHost = process.env.ORION_LAB_TARGET_HOST;
const targetPort = Number(process.env.ORION_LAB_TARGET_PORT || "28081");
const targetTimeoutMs = Number(process.env.ORION_LAB_TARGET_TIMEOUT_MS || "2500");
const listenHost = process.env.ORION_LAB_LISTEN_HOST || "127.0.0.1";
const listenPorts = (process.env.ORION_LAB_LISTEN_PORTS || "18081,5175")
  .split(",")
  .map((port) => Number(port.trim()))
  .filter(Boolean);

if (!targetHost) {
  console.error("ORION_LAB_TARGET_HOST is required.");
  process.exit(1);
}

function createProxyServer(listenPort) {
  const server = http.createServer((clientReq, clientRes) => {
    const headers = {
      ...clientReq.headers,
      host: `${targetHost}:${targetPort}`,
    };
    delete headers.connection;
    delete headers["proxy-connection"];
    headers.connection = "close";

    const proxyReq = http.request(
      {
        hostname: targetHost,
        port: targetPort,
        path: clientReq.url,
        method: clientReq.method,
        headers,
        agent: false,
      },
      (proxyRes) => {
        clientRes.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(clientRes);
      },
    );

    proxyReq.setTimeout(targetTimeoutMs, () => {
      proxyReq.destroy(new Error(`target timed out after ${targetTimeoutMs}ms`));
    });

    proxyReq.on("error", (error) => {
      if (clientRes.headersSent) {
        clientRes.destroy(error);
        return;
      }
      clientRes.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      clientRes.end(`Orion lab proxy target unavailable: ${error.message}\n`);
    });

    clientReq.pipe(proxyReq);
  });

  server.on("error", (error) => {
    console.error(`Failed to listen on ${listenHost}:${listenPort}: ${error.message}`);
  });

  server.listen(listenPort, listenHost, () => {
    console.log(
      `Orion lab proxy listening on http://${listenHost}:${listenPort} -> http://${targetHost}:${targetPort}`,
    );
  });
}

for (const port of listenPorts) {
  createProxyServer(port);
}
