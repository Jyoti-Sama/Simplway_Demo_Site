# Simplway Server

A Node.js server that interacts with Google Sheets to manage opportunity updates and usage records.

## Features

- Opportunity Update Management
  - Add new opportunities
  - Update existing opportunities
  - Track received timestamps
- Usage Records Management
  - Create usage records for different services
  - Track usage amounts
  - Support for multiple service types (Browser, API, Pipeline)

## Prerequisites

- Node.js (v14 or higher)
- Google Cloud Platform account
- Google Sheets API enabled
- Service account credentials

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd simplway-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google Sheets credentials:
   - Create a service account in Google Cloud Console
   - Download the credentials JSON file
   - For local development:
     - Rename it to `gs_creds.json.json`
     - Place it in the project root directory
   - For Vercel deployment:
     - Open the JSON file
     - Copy the following values:
       - `client_email`
       - `private_key`
       - Your Google Sheet ID

## Environment Variables

The following environment variables are required:

### Local Development
Create a `.env` file in the project root:
```env
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
```

### Vercel Deployment
1. Go to your project in the Vercel dashboard
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add the following variables:
   - `GOOGLE_SHEETS_ID`: Your Google Sheet ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email from the JSON file
   - `GOOGLE_PRIVATE_KEY`: Private key from the JSON file (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts)

Note: For the `GOOGLE_PRIVATE_KEY`, make sure to:
- Copy the entire private key including the BEGIN and END markers
- Replace all newlines with `\n`
- Enclose the entire value in quotes

Example:
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNBPxjGvBrpYbw\n...\n-----END PRIVATE KEY-----\n"
```

## API Endpoints

### Opportunity Update
- **POST** `/api/opportunity-update`
  - Updates or creates an opportunity record
  - Request body:
    ```json
    {
      "accountId": "string",
      "opportunityId": "string",
      "lineItemId": "string",
      "productCode": "string"
    }
    ```

### Create Usage Records
- **GET** `/api/create-usage-records`
  - Creates usage records for all accounts
  - No request body required

### Health Check
- **GET** `/api/health`
  - Checks server and sheets connection status
  - Returns:
    ```json
    {
      "status": "ok",
      "sheetsInitialized": boolean
    }
    ```

## Development

Run the server locally:
```bash
npm run dev
```

## Deployment

This project is configured for deployment on Vercel.

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

## Project Structure

```
simplway-server/
├── index.js           # Main server file
├── vercel.json        # Vercel configuration
├── package.json       # Project dependencies
├── .env              # Local environment variables (not in git)
├── gs_creds.json.json # Google Sheets credentials (not in git)
└── README.md         # This file
```

## Error Handling

The server includes comprehensive error handling for:
- Google Sheets API errors
- Invalid requests
- Missing or malformed data
- Connection issues

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.


