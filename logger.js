import { config } from './config.js';

export class Logger {
    static levels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    };

    static currentLevel = Logger.levels[config.logLevel || 'info'];

    static formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
    }

    static debug(message, meta) {
        if (Logger.currentLevel <= Logger.levels.debug) {
            console.debug(Logger.formatMessage('debug', message, meta));
        }
    }

    static info(message, meta) {
        if (Logger.currentLevel <= Logger.levels.info) {
            console.info(Logger.formatMessage('info', message, meta));
        }
    }

    static warn(message, meta) {
        if (Logger.currentLevel <= Logger.levels.warn) {
            console.warn(Logger.formatMessage('warn', message, meta));
        }
    }

    static error(message, meta) {
        if (Logger.currentLevel <= Logger.levels.error) {
            console.error(Logger.formatMessage('error', message, meta));
        }
    }
}
