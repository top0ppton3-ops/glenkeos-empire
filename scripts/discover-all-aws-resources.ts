#!/usr/bin/env tsx

/**
 * GLENKEOS - Complete AWS Infrastructure Discovery
 * Scans all relevant AWS services to find existing resources
 */

import { AmplifyClient, GetAppCommand, GetBackendEnvironmentCommand, ListAppsCommand } from '@aws-sdk/client-amplify';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient, ListUserPoolsCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { APIGatewayClient, GetRestApisCommand } from '@aws-sdk/client-api-gateway';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { AppSyncClient, ListGraphqlApisCommand } from '@aws-sdk/client-appsync';

const AWS_REGION = 'us-east-2';
const APP_ID = 'd262l1qtvcxnk9';
const ENV_NAME = 'staging';

const amplifyClient = new AmplifyClient({ region: AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });
const lambdaClient = new LambdaClient({ region: AWS_REGION });
const apiGatewayClient = new APIGatewayClient({ region: AWS_REGION });
const rdsClient = new RDSClient({ region: AWS_REGION });
const s3Client = new S3Client({ region: AWS_REGION });
const appsyncClient = new AppSyncClient({ region: AWS_REGION });

async function discoverAllResources() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  GLENKEOS - COMPLETE AWS INFRASTRUCTURE DISCOVERY        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`Region: ${AWS_REGION}`);
  console.log(`Environment: ${ENV_NAME}\n`);

  const discovered: any = {
    amplify: [],
    dynamodb: [],
    cognito: [],
    lambda: [],
    apiGateway: [],
    appsync: [],
    rds: [],
    s3: []
  };

  try {
    // 1. Amplify Apps
    console.log('📱 Scanning Amplify Apps...');
    try {
      const appsResponse = await amplifyClient.send(new ListAppsCommand({ maxResults: 25 }));
      discovered.amplify = appsResponse.apps || [];
      console.log(`   Found ${discovered.amplify.length} Amplify app(s)`);
      discovered.amplify.forEach((app: any) => {
        console.log(`   ✓ ${app.name} (${app.appId})`);
      });
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // 2. DynamoDB Tables
    console.log('🗄️  Scanning DynamoDB Tables...');
    try {
      const tablesResponse = await dynamoClient.send(new ListTablesCommand({}));
      discovered.dynamodb = tablesResponse.TableNames || [];
      console.log(`   Found ${discovered.dynamodb.length} table(s)`);
      discovered.dynamodb.forEach((table: string) => {
        console.log(`   ✓ ${table}`);
      });
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // 3. Cognito User Pools
    console.log('🔐 Scanning Cognito User Pools...');
    try {
      const poolsResponse = await cognitoClient.send(new ListUserPoolsCommand({ MaxResults: 60 }));
      discovered.cognito = poolsResponse.UserPools || [];
      console.log(`   Found ${discovered.cognito.length} user pool(s)`);
      discovered.cognito.forEach((pool: any) => {
        console.log(`   ✓ ${pool.Name} (${pool.Id})`);
      });
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // 4. Lambda Functions
    console.log('⚡ Scanning Lambda Functions...');
    try {
      const functionsResponse = await lambdaClient.send(new ListFunctionsCommand({ MaxItems: 100 }));
      discovered.lambda = functionsResponse.Functions || [];
      console.log(`   Found ${discovered.lambda.length} function(s)`);
      discovered.lambda.forEach((fn: any) => {
        console.log(`   ✓ ${fn.FunctionName} (${fn.Runtime})`);
      });
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // 5. API Gateway (REST APIs)
    console.log('🌐 Scanning API Gateway REST APIs...');
    try {
      const apisResponse = await apiGatewayClient.send(new GetRestApisCommand({ limit: 100 }));
      discovered.apiGateway = apisResponse.items || [];
      console.log(`   Found ${discovered.apiGateway.length} REST API(s)`);
      discovered.apiGateway.forEach((api: any) => {
        console.log(`   ✓ ${api.name} (${api.id})`);
      });
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // 6. AppSync (GraphQL APIs)
    console.log('📊 Scanning AppSync GraphQL APIs...');
    try {
      const appsyncResponse = await appsyncClient.send(new ListGraphqlApisCommand({ maxResults: 25 }));
      discovered.appsync = appsyncResponse.graphqlApis || [];
      console.log(`   Found ${discovered.appsync.length} GraphQL API(s)`);
      discovered.appsync.forEach((api: any) => {
        console.log(`   ✓ ${api.name} (${api.apiId})`);
      });
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // 7. RDS Databases
    console.log('💾 Scanning RDS Databases...');
    try {
      const rdsResponse = await rdsClient.send(new DescribeDBInstancesCommand({}));
      discovered.rds = rdsResponse.DBInstances || [];
      console.log(`   Found ${discovered.rds.length} database(s)`);
      discovered.rds.forEach((db: any) => {
        console.log(`   ✓ ${db.DBInstanceIdentifier} (${db.Engine} ${db.EngineVersion})`);
      });
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // 8. S3 Buckets
    console.log('🪣 Scanning S3 Buckets...');
    try {
      const bucketsResponse = await s3Client.send(new ListBucketsCommand({}));
      discovered.s3 = bucketsResponse.Buckets || [];
      const relevantBuckets = discovered.s3.filter((b: any) =>
        b.Name?.includes('amplify') ||
        b.Name?.includes('glenkeos') ||
        b.Name?.includes(APP_ID)
      );
      console.log(`   Found ${discovered.s3.length} total bucket(s), ${relevantBuckets.length} relevant`);
      relevantBuckets.forEach((bucket: any) => {
        console.log(`   ✓ ${bucket.Name}`);
      });
      discovered.s3 = relevantBuckets;
    } catch (error: any) {
      console.log(`   ⚠️  ${error.message}`);
    }
    console.log();

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DISCOVERY SUMMARY\n');
    console.log(`Amplify Apps:         ${discovered.amplify.length}`);
    console.log(`DynamoDB Tables:      ${discovered.dynamodb.length}`);
    console.log(`Cognito User Pools:   ${discovered.cognito.length}`);
    console.log(`Lambda Functions:     ${discovered.lambda.length}`);
    console.log(`API Gateway (REST):   ${discovered.apiGateway.length}`);
    console.log(`AppSync (GraphQL):    ${discovered.appsync.length}`);
    console.log(`RDS Databases:        ${discovered.rds.length}`);
    console.log(`S3 Buckets:           ${discovered.s3.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Save to JSON
    const fs = require('fs');
    const outputPath = './generated/execution/aws-infrastructure-inventory.json';
    fs.writeFileSync(outputPath, JSON.stringify(discovered, null, 2));
    console.log(`✓ Full inventory saved to: ${outputPath}\n`);

    return discovered;

  } catch (error: any) {
    console.error('❌ Error during discovery:');
    console.error(`   ${error.message}\n`);
    throw error;
  }
}

discoverAllResources()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
