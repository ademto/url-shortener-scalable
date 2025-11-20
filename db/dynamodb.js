const { PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../config/aws');

/**
 * Create a new shortened URL entry in DynamoDB
 */
async function createUrl(shortCode, originalUrl) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      shortCode,
      originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    },
    ConditionExpression: 'attribute_not_exists(shortCode)' // Prevent overwriting
  };

  try {
    await docClient.send(new PutCommand(params));
    return { success: true, data: params.Item };
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return { success: false, error: 'Short code already exists' };
    }
    throw error;
  }
}

/**
 * Get URL data by short code
 */
async function getUrl(shortCode) {
  const params = {
    TableName: TABLE_NAME,
    Key: { shortCode }
  };

  try {
    const result = await docClient.send(new GetCommand(params));
    if (!result.Item) {
      return { success: false, error: 'Short URL not found' };
    }
    return { success: true, data: result.Item };
  } catch (error) {
    throw error;
  }
}

/**
 * Increment click counter for a short code
 */
async function incrementClicks(shortCode) {
  const params = {
    TableName: TABLE_NAME,
    Key: { shortCode },
    UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :inc',
    ExpressionAttributeValues: {
      ':inc': 1,
      ':zero': 0
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await docClient.send(new UpdateCommand(params));
    return { success: true, data: result.Attributes };
  } catch (error) {
    throw error;
  }
}

/**
 * Get all URLs (for debugging - use with caution in production)
 */
async function getAllUrls(limit = 100) {
  const params = {
    TableName: TABLE_NAME,
    Limit: limit
  };

  try {
    const result = await docClient.send(new ScanCommand(params));
    return { 
      success: true, 
      data: result.Items || [],
      count: result.Count || 0
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Check if DynamoDB connection is healthy
 */
async function healthCheck() {
  try {
    const params = {
      TableName: TABLE_NAME,
      Limit: 1
    };
    await docClient.send(new ScanCommand(params));
    return { success: true, message: 'DynamoDB connection healthy' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  createUrl,
  getUrl,
  incrementClicks,
  getAllUrls,
  healthCheck
};
