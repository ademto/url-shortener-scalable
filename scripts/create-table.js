require('dotenv').config();
const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { client } = require('../config/aws');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'url-shortener';

const params = {
  TableName: TABLE_NAME,
  KeySchema: [
    { AttributeName: 'shortCode', KeyType: 'HASH' } // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'shortCode', AttributeType: 'S' }
  ],
  BillingMode: 'PAY_PER_REQUEST', // On-demand pricing (no need to provision capacity)
  Tags: [
    { Key: 'Project', Value: 'url-shortener' },
    { Key: 'Environment', Value: process.env.NODE_ENV || 'development' }
  ]
};

async function createTable() {
  try {
    console.log(`Creating DynamoDB table: ${TABLE_NAME}...`);
    const command = new CreateTableCommand(params);
    const response = await client.send(command);
    
    console.log('✅ Table created successfully!');
    console.log(`Table ARN: ${response.TableDescription.TableArn}`);
    console.log(`Table Status: ${response.TableDescription.TableStatus}`);
    console.log('\nNote: Table may take a few moments to become ACTIVE.');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Table "${TABLE_NAME}" already exists.`);
    } else {
      console.error('❌ Error creating table:', error.message);
      throw error;
    }
  }
}

createTable();
