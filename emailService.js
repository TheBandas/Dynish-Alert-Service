import nodemailer from 'nodemailer';
import { Logger } from './logger.js';

export class EmailService {
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport(config.smtpOptions);
    }

    async sendNotification(site, status, details = '') {
        if (!this.config.to || this.config.to.length === 0) {
            throw new Error("Email configuration is missing recipients");
        }

        const subject = `${this.config.subjectPrefix}${site.name} is ${status.toUpperCase()}`;
        const text = this.createEmailBody(site, status, details);
        const html = this.createHtmlEmail(site, status, details);

        const mailOptions = {
            from: this.config.from,
            to: this.config.to,
            subject,
            text,
            html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            Logger.info(`Email notification sent`, { site: site.name, status, messageId: info.messageId });
            return info;
        } catch (error) {
            Logger.error(`Failed to send email notification`, { site: site.name, status, error: error.message });
            throw error;
        }
    }

    createEmailBody(site, status, details) {
        return `
Site Name: ${site.name}
URL: ${site.url}
Status: ${status.toUpperCase()}
Timestamp: ${new Date().toUTCString()}
${details}`;
    }

    createHtmlEmail(site, status, details) {
        const statusColor = status === 'up' ? '#28a745' : '#dc3545';
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Website Monitor Alert</h2>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                    <p><strong>Site Name:</strong> ${site.name}</p>
                    <p><strong>URL:</strong> <a href="${site.url}">${site.url}</a></p>
                    <p><strong>Status:</strong> <span style="color: ${statusColor}">${status.toUpperCase()}</span></p>
                    <p><strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
                    ${details ? `<p><strong>Details:</strong> ${details}</p>` : ''}
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    This is an automated message from the Website Monitoring Service.
                </p>
            </div>`;
    }
}
