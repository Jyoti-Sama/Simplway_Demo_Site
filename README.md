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
   - Rename it to `gs_creds.json.json`
   - Place it in the project root directory

4. Configure Google Sheet:
   - Create a new Google Sheet
   - Share it with your service account email
   - Copy the Sheet ID from the URL
   - Update the `SHEET_ID` in `index.js`

## Environment Variables

The following environment variables are required:

- `GOOGLE_SHEETS_ID`: Your Google Sheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
- `GOOGLE_PRIVATE_KEY`: Service account private key

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
├── gs_creds.json.json # Google Sheets credentials
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


