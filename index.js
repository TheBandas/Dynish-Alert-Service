import { config } from './config.js';
import { WebsiteMonitor } from './monitor.js';
import { Logger } from './logger.js';

process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection', { reason: reason?.message || reason });
    process.exit(1);
});

const monitor = new WebsiteMonitor(config);
monitor.start().catch(error => {
    Logger.error('Failed to start monitoring service', { error: error.message });
    process.exit(1);
});
