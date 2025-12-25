const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'mysterious-shop-secret-2024';

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // Verify signature
            const signature = req.headers['x-hub-signature-256'];
            if (signature) {
                const hmac = crypto.createHmac('sha256', SECRET);
                const digest = 'sha256=' + hmac.update(body).digest('hex');

                if (signature !== digest) {
                    console.log('❌ Invalid signature');
                    res.writeHead(401);
                    res.end('Invalid signature');
                    return;
                }
            }

            try {
                const payload = JSON.parse(body);

                // Only deploy on push to master
                if (payload.ref === 'refs/heads/master') {
                    console.log('🚀 Deploying...');

                    exec('bash /home/nepav/MysteriousShopApp/scripts/deploy.sh',
                        { maxBuffer: 10 * 1024 * 1024 },
                        (error, stdout, stderr) => {
                            if (error) {
                                console.error('Deploy error:', error);
                                return;
                            }
                            console.log('Deploy output:', stdout);
                            if (stderr) console.error('Deploy stderr:', stderr);
                        }
                    );

                    res.writeHead(200);
                    res.end('Deploy started');
                } else {
                    res.writeHead(200);
                    res.end('Not master branch, skipping');
                }
            } catch (e) {
                console.error('Parse error:', e);
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🎣 Webhook server listening on port ${PORT}`);
});
