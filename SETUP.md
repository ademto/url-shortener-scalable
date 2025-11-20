# DynamoDB Setup Guide

## Prerequisites

1. **AWS Account** with access to DynamoDB
2. **AWS CLI** installed (optional but recommended)
3. **IAM User** with DynamoDB permissions

## Step 1: Create IAM User (if needed)

1. Go to AWS Console → IAM → Users → Create User
2. Attach policy: `AmazonDynamoDBFullAccess`
3. Create access keys (Access Key ID + Secret Access Key)
4. Save credentials securely

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your AWS credentials:
```env
PORT=3000
BASE_URL=http://localhost:3000

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# DynamoDB
DYNAMODB_TABLE_NAME=url-shortener
```

**Important:** Never commit `.env` to version control!

## Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `@aws-sdk/client-dynamodb` - DynamoDB client
- `@aws-sdk/lib-dynamodb` - Document client for easier operations
- `express`, `cors`, `dotenv` - Web server dependencies

## Step 4: Create DynamoDB Table

Run the table creation script:

```bash
npm run create-table
```

This creates a table with:
- **Table Name:** `url-shortener` (or your custom name from `.env`)
- **Primary Key:** `shortCode` (String)
- **Billing Mode:** Pay-per-request (no provisioned capacity needed)

**Alternative: Create via AWS Console**

1. Go to AWS Console → DynamoDB → Tables → Create table
2. Table name: `url-shortener`
3. Partition key: `shortCode` (String)
4. Table settings: Default settings
5. Billing mode: On-demand

## Step 5: Verify Table Creation

Check if the table exists:

```bash
aws dynamodb describe-table --table-name url-shortener --region us-east-1
```

Or check in AWS Console → DynamoDB → Tables

## Step 6: Start the Application

```bash
npm start
```

The app will:
- Connect to DynamoDB using your credentials
- Start the server on port 3000
- Health check endpoint will verify DynamoDB connection

## Step 7: Test the Application

1. **Open browser:** http://localhost:3000
2. **Shorten a URL:** Enter a long URL and click "Shorten URL"
3. **Check health:** http://localhost:3000/health (should show database: connected)
4. **Test redirect:** Click the shortened URL to verify redirection

## Troubleshooting

### Error: "Unable to locate credentials"

- Verify `.env` file exists and contains valid AWS credentials
- Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set

### Error: "ResourceNotFoundException"

- Table doesn't exist - run `npm run create-table`
- Verify table name matches `DYNAMODB_TABLE_NAME` in `.env`
- Check AWS region is correct

### Error: "AccessDeniedException"

- IAM user lacks DynamoDB permissions
- Attach `AmazonDynamoDBFullAccess` policy to your IAM user

### Health check shows "database: disconnected"

- Check AWS credentials are valid
- Verify DynamoDB table exists in the correct region
- Check network connectivity to AWS

## DynamoDB Costs

**Pay-per-request pricing (On-demand mode):**
- Write requests: $1.25 per million requests
- Read requests: $0.25 per million requests
- Storage: $0.25 per GB-month

**Free tier:**
- 25 GB of storage
- 25 write capacity units
- 25 read capacity units

For a small URL shortener, costs should be minimal (< $1/month).

## Next Steps

Once DynamoDB is working locally, you can:
1. Deploy to EC2 (Phase 3)
2. Use IAM roles instead of access keys (more secure)
3. Add DynamoDB Global Secondary Indexes for analytics
4. Enable DynamoDB Streams for real-time processing
