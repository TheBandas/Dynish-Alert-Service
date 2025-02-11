export const config = {
    sites: [
        {
            name: "Dynish App",
            url: "https://dynish.app/",
            checkType: "http",
            timeout: 10000, // 10 second timeout
            expectedStatus: 200
        },
        {
            name: "Dynish Client App",
            url: "https://client.dynish.app/",
            checkType: "http",
            timeout: 10000,
            expectedStatus: 200
        },
        {
            name: "Dynish API",
            url: "https://api.dynish.app/api/health",
            checkType: "api-health",
            timeout: 10000,
            expectedResponse: { status: "ok" },
            headers: {
                'Accept': 'application/json'
            }
        }
    ],
    emailConfig: {
        from: 'dev@dynish.com',
        to: ['contact@dynish.com', 'dev@dynish.com', 'durgesh.coco@gmail.com'],
        subjectPrefix: "[Website Monitor]",
        smtpOptions: {
            host: 'smtp.zoho.in',
            port: 465,
            secure: true,
            auth: {
                user: 'dev@dynish.com',
                pass: 'Tech@2025' 
            }
        }
    },
    checkInterval: 10000, 
    retryAttempts: 3,
    retryDelay: 5000, 
    logLevel: 'debug',
};