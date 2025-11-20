# URL Shortener - Scalable AWS Application

A simple, scalable URL shortener built with Node.js and Express, designed for deployment on AWS with EC2, Application Load Balancer (ALB), and Auto Scaling.

## Features

- ✅ Shorten long URLs to compact codes
- ✅ Automatic redirection
- ✅ Click tracking
- ✅ DynamoDB persistent storage
- ✅ Health check endpoint for ALB
- ✅ Modern, responsive UI
- ✅ AWS SDK integration

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: AWS DynamoDB (pay-per-request)
- **Frontend**: Vanilla JavaScript + CSS
- **AWS SDK**: v3 (modular)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- AWS Account with DynamoDB access
- AWS credentials (Access Key ID + Secret Access Key)

### Installation

1. Clone or navigate to the project directory:
```bash
cd url-shortener-scalable
```

2. Install dependencies:
```bash
npm install
```

3. Configure AWS credentials:
```bash
cp .env.example .env
# Edit .env and add your AWS credentials
```

4. Create DynamoDB table:
```bash
npm run create-table
```

5. Start the server:
```bash
npm start
```

**For detailed setup instructions, see [SETUP.md](SETUP.md)**

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser:
```
http://localhost:3000
```

## API Endpoints

### Shorten URL
```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "success": true,
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/very/long/url"
}
```

### Redirect
```http
GET /:shortCode
```
Redirects to the original URL.

### Get Statistics
```http
GET /api/stats/:shortCode
```

**Response:**
```json
{
  "success": true,
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "clicks": 42
}
```

### Health Check (for ALB)
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### List All URLs (Debug)
```http
GET /api/all
```

## Project Structure

```
url-shortener-scalable/
├── server.js              # Main Express application
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── SETUP.md              # DynamoDB setup guide
├── config/
│   └── aws.js            # AWS SDK configuration
├── db/
│   └── dynamodb.js       # DynamoDB operations
├── routes/
│   └── url.js            # URL shortening routes
├── utils/
│   └── shortcode.js      # Short code generation utilities
├── scripts/
│   └── create-table.js   # DynamoDB table creation
└── public/
    └── index.html        # Frontend UI
```

## AWS Deployment (Coming Soon)

This application is designed to be deployed on AWS with:

- **EC2 Instances**: Run the Node.js application
- **Application Load Balancer**: Distribute traffic across instances
- **Auto Scaling Group**: Scale based on demand
- **DynamoDB**: Persistent storage ✅
- **IAM Roles**: Secure access to DynamoDB (no hardcoded credentials)

## Roadmap

### Phase 1: Basic API ✅
- [x] Express server
- [x] Random short code generation
- [x] In-memory storage
- [x] Basic error handling
- [x] Frontend UI

### Phase 2: DynamoDB Integration ✅
- [x] AWS SDK v3 setup
- [x] DynamoDB client configuration
- [x] Table creation script
- [x] CRUD operations
- [x] Health check with DB connection
- [x] Click tracking

### Phase 3: AWS Deployment
- [ ] EC2 user data script
- [ ] ALB configuration
- [ ] Auto Scaling setup
- [ ] Security groups

### Phase 4: Advanced Features
- [ ] Custom short codes
- [ ] Analytics dashboard
- [ ] Rate limiting
- [ ] Redis caching

## License

MIT
