const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const PORT = 9000;
const SECRET = 'vapecity-deploy-secret-2024';

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/deploy') {
        let body = '';

        req.on('data', chunk => { body += chunk; });

        req.on('end', () => {
            // Verify GitHub signature
            const signature = req.headers['x-hub-signature-256'];
            if (signature) {
                const hmac = crypto.createHmac('sha256', SECRET);
                const digest = 'sha256=' + hmac.update(body).digest('hex');
                if (signature !== digest) {
                    console.log('[WEBHOOK] Invalid signature');
                    res.writeHead(401);
                    res.end('Invalid signature');
                    return;
                }
            }

            console.log('[WEBHOOK] Received deploy request');
            res.writeHead(200);
            res.end('Deploy started');

            // Run deploy script
            exec('/home/nepav/deploy.sh', (error, stdout, stderr) => {
                if (error) {
                    console.error('[DEPLOY ERROR]', error);
                    return;
                }
                console.log('[DEPLOY OUTPUT]', stdout);
                if (stderr) console.error('[DEPLOY STDERR]', stderr);
            });
        });
    } else {
        res.writeHead(200);
        res.end('Webhook server running');
    }
});

server.listen(PORT, () => {
    console.log(`[WEBHOOK] Server listening on port ${PORT}`);
});
