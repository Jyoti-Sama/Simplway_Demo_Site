const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const net = require('net');

// Get credentials from environment variables
const creds = {
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key?.replace(/\\n/g, '\n'),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain
};

const app = express();
const DEFAULT_PORT = 3000;

// Function to find an available port
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try the next one
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
        server.listen(startPort, () => {
            server.close(() => {
                resolve(startPort);
            });
        });
    });
}

// sheet setup
const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
let doc;
let sheet1;
let sheet2;

async function initSheets() {
    try {
        if (!doc) {
            console.log('Initializing Google Sheets connection...');
            const auth = new JWT({
                email: creds.client_email,
                key: creds.private_key,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            doc = new GoogleSpreadsheet(SHEET_ID, auth);
        }

        if (!sheet1 || !sheet2) {
            console.log('Loading sheet information...');
            await doc.loadInfo();
            console.log('Document loaded:', doc.title);
            
            sheet1 = doc.sheetsByIndex[0];
            console.log('Sheet1 loaded:', sheet1.title);
            
            sheet2 = doc.sheetsByIndex[1];
            if (!sheet2) {
                console.log('Creating Sheet2...');
                sheet2 = await doc.addSheet({
                    headerValues: ['Account__c', 'Date__c', 'Service__c', 'Usage_Amount__c']
                });
                console.log('Sheet2 created:', sheet2.title);
            } else {
                console.log('Sheet2 loaded:', sheet2.title);
            }
            
            // Load header rows to ensure they exist
            await sheet1.loadHeaderRow();
            if (sheet2) {
                await sheet2.loadHeaderRow();
            }
        }
        
        console.log('Sheets initialized successfully');
        return true;
    } catch (err) {
        console.error('Error initializing sheets:', err);
        return false;
    }
}

// Initialize sheets on server start
initSheets().catch(err => {
    console.error('Failed to initialize sheets:', err);
});

app.use(express.json());

// Middleware to ensure sheets are initialized
async function ensureSheetsInitialized(req, res, next) {
    if (!sheet1 || !sheet2) {
        const initialized = await initSheets();
        if (!initialized) {
            return res.status(500).json({
                success: false,
                error: 'Failed to initialize Google Sheets connection'
            });
        }
    }
    next();
}

app.post('/api/opportunity-update', ensureSheetsInitialized, async (req, res) => {
    try {
        const update = req.body;
        console.log('Received update:', update);
        
        const rows = await sheet1.getRows();
        console.log('Found rows:', rows.length);
        
        // Find existing row with matching accountId and productCode
        const existingRow = rows.find(row => 
            row.get('accountId') === update.accountId && 
            row.get('productCode') === update.productCode
        );

        if (existingRow) {
            console.log('Updating existing row');
            // Update existing row
            Object.assign(existingRow, {
                ...update,
                receivedAt: new Date().toISOString()
            });
            await existingRow.save();
            res.json({ received: true, savedToSheet: true, updated: true });
        } else {
            console.log('Adding new row');
            // Add new row
            await sheet1.addRow({
                ...update,
                receivedAt: new Date().toISOString()
            });
            res.json({ received: true, savedToSheet: true, updated: false });
        }
    } catch (err) {
        console.error('Error in /api/opportunity-update:', err);
        res.status(500).json({
            received: true,
            savedToSheet: false,
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});

app.get('/api/create-usage-records', ensureSheetsInitialized, async (req, res) => {
    try {
        const rows = await sheet1.getRows();
        console.log('Found rows:', rows.length);
        
        for (const row of rows) {
            const accountId = row.get('accountId');
            const productCode = row.get('productCode');
            const receivedAt = row.get('receivedAt');
            
            console.log('Row values:', { accountId, productCode, receivedAt });
        }    

        // for (const row of rows) {
        //   const accountId = row.get('accountId');
        //   
        //   // Create usage records for each service type
        //   const services = ['Browser', 'API', 'Pipeline'];
        //   for (const service of services) {
        //     await sheet2.addRow({
        //       Account__c: accountId,
        //       Date__c: new Date().toISOString(),
        //       Service__c: service,
        //       Usage_Amount__c: Math.floor(Math.random() * 100)
        //     });
        //   }
        // }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Error in /api/create-usage-records:', err);
        res.status(500).json({ 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error' 
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const initialized = await initSheets();
        res.json({ 
            status: 'ok', 
            sheetsInitialized: initialized,
            sheets: {
                sheet1: sheet1?.title,
                sheet2: sheet2?.title
            }
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'error', 
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});

// Export the Express API
module.exports = app;
