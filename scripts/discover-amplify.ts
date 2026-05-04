#!/usr/bin/env ts-node

/**
 * GLENKEOS - AWS Amplify Backend Discovery
 * Discovers existing infrastructure and maps it to the platform spec
 */

import { AmplifyClient, GetAppCommand, GetBackendEnvironmentCommand } from '@aws-sdk/client-amplify';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient, ListUserPoolsCommand } from '@aws-sdk/client-cognito-identity-provider';

const AWS_REGION = 'us-east-2';
const APP_ID = 'd262l1qtvcxnk9';
const ENV_NAME = 'staging';

const amplifyClient = new AmplifyClient({ region: AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

async function discoverInfrastructure() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  GLENKEOS - AWS AMPLIFY BACKEND DISCOVERY                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`App ID: ${APP_ID}`);
  console.log(`Environment: ${ENV_NAME}`);
  console.log(`Region: ${AWS_REGION}\n`);

  console.log('─────────────────────────────────────────────────────────────\n');
  console.log('DISCOVERING RESOURCES...\n');

  try {
    console.log('📱 Querying Amplify App...');
    const appResponse = await amplifyClient.send(new GetAppCommand({ appId: APP_ID }));
    console.log(`✓ App Name: ${appResponse.app?.name}`);
    console.log(`✓ Default Domain: ${appResponse.app?.defaultDomain}`);
    console.log(`✓ Repository: ${appResponse.app?.repository || 'N/A'}\n`);

    console.log('🌍 Querying Backend Environment...');
    const envResponse = await amplifyClient.send(
      new GetBackendEnvironmentCommand({ appId: APP_ID, environmentName: ENV_NAME })
    );
    console.log(`✓ Environment: ${envResponse.backendEnvironment?.environmentName}`);
    console.log(`✓ Stack Name: ${envResponse.backendEnvironment?.stackArn?.split('/')[1] || 'N/A'}\n`);

    console.log('🗄️  Querying DynamoDB Tables...');
    const tablesResponse = await dynamoClient.send(new ListTablesCommand({}));
    const amplifyTables = tablesResponse.TableNames?.filter(name =>
      name.includes(APP_ID) || name.includes(ENV_NAME)
    ) || [];
    if (amplifyTables.length > 0) {
      amplifyTables.forEach(table => console.log(`  ✓ ${table}`));
    } else {
      console.log('  (No Amplify-related tables found)');
    }
    console.log();

    console.log('🔐 Querying Cognito User Pools...');
    const userPoolsResponse = await cognitoClient.send(new ListUserPoolsCommand({ MaxResults: 60 }));
    const amplifyPools = userPoolsResponse.UserPools?.filter(pool =>
      pool.Name?.includes(APP_ID) || pool.Name?.includes(ENV_NAME)
    ) || [];
    if (amplifyPools.length > 0) {
      amplifyPools.forEach(pool => console.log(`  ✓ ${pool.Name} (${pool.Id})`));
    } else {
      console.log('  (No Amplify-related user pools found)');
    }
    console.log();

    console.log('─────────────────────────────────────────────────────────────\n');
    console.log('DISCOVERY COMPLETE\n');
    console.log(`Total DynamoDB Tables: ${amplifyTables.length}`);
    console.log(`Total Cognito Pools: ${amplifyPools.length}\n`);

  } catch (error: unknown) {
    console.error('❌ Error discovering infrastructure:');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`   ${errorMessage}\n`);

    if (error instanceof Error && (error.name === 'UnrecognizedClientException' || error.name === 'InvalidSignatureException')) {
      console.log('⚠️  Authentication failed. Please verify AWS credentials.\n');
    }
  }
}

discoverInfrastructure().catch(console.error);
