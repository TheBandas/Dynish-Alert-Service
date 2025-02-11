import fetch from 'node-fetch';
import { Logger } from './logger.js';
import { EmailService } from './emailService.js';

export class WebsiteMonitor {

    constructor(config) {
        this.config = config;
        this.siteStatuses = new Map();
        this.emailService = new EmailService(config.emailConfig);
        this.initialize();
    }

    initialize() {
        for (const site of this.config.sites) {
            this.siteStatuses.set(site.name, { status: 'up', lastCheck: null, consecutiveFailures: 0 });
        }
    }

    async checkWebsite(site) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), site.timeout || 10000);

        try {
            const response = await fetch(site.url, {
                signal: controller.signal,
                headers: site.headers || {}
            });

            if (site.checkType === 'api-health') {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status !== site.expectedResponse.status) {
                    throw new Error(`API health check failed. Status: ${data.status}`);
                }
            } else if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            Logger.error(`Website check failed`, { site: site.name, error: error.message });
            return false;
        } finally {
            clearTimeout(timeout);
        }
    }

    async monitorSite(site) {
        const siteStatus = this.siteStatuses.get(site.name);
        let isUp = false;

        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            if (await this.checkWebsite(site)) {
                isUp = true;
                break;
            }
            if (attempt < this.config.retryAttempts) {
                Logger.debug(`Retrying check`, { site: site.name, attempt });
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
            }
        }

        const currentStatus = isUp ? 'up' : 'down';
        if (currentStatus !== siteStatus.status) {
            Logger.info(`Site status changed`, { 
                site: site.name, 
                previousStatus: siteStatus.status, 
                currentStatus 
            });

            try {
                await this.emailService.sendNotification(
                    site,
                    currentStatus,
                    `Site ${currentStatus === 'down' ? 'is unreachable' : 'has recovered'}`
                );
            } catch (error) {
                Logger.error(`Failed to send notification`, { site: site.name, error: error.message });
            }

            this.siteStatuses.set(site.name, {
                ...siteStatus,
                status: currentStatus,
                lastCheck: new Date(),
                consecutiveFailures: isUp ? 0 : siteStatus.consecutiveFailures + 1
            });
        } else {
            Logger.debug(`Site status unchanged`, { site: site.name, status: currentStatus });
        }
    }

    async start() {
        Logger.info('Starting website monitoring service');
        
        const monitor = async () => {
            for (const site of this.config.sites) {
                await this.monitorSite(site).catch(error => {
                    Logger.error(`Error monitoring site`, { site: site.name, error: error.message });
                });
            }
        };

        // Initial check
        await monitor();

        // Schedule regular checks
        setInterval(monitor, this.config.checkInterval);
    }
}

