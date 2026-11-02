import app from './app.js';
import { getLogger } from './utils/logger.js';
import { bootEnv } from './config/bootConfig.js';
import { connectKafka } from './db/kafka.js';

const logger = getLogger().setTag('server.ts');
const PORT = bootEnv.PORT;

connectKafka()
    .then(() => {
        app.listen(PORT, () => {
            logger.log(`Server running on http://localhost:${PORT}`);
            logger.log(`Docs available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((err) => {
        logger.error('Failed to start server', err);
        process.exit(1);
    });
