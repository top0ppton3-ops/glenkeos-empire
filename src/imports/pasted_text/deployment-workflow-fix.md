
fix: Simplify deployment workflow for Vercel and Supabase #7
All jobs
Run details
Annotations
1 error and 1 warning
Deploy Frontend to Vercel
failed 3 minutes ago in 48s
Search logs
2s
11s
33s
Run amondnet/vercel-action@v25
set environment for vercel cli
set env variable : VERCEL_ORG_ID
set env variable : VERCEL_PROJECT_ID
/usr/local/bin/npx vercel@25.1.0 --prod -t *** -m githubCommitSha=72ad55c3167fd7f9e0fc455c55143efed679feb2 -m githubCommitAuthorName=top0ppton3-ops -m githubCommitAuthorLogin=top0ppton3-ops -m githubDeployment=1 -m githubOrg=top0ppton3-ops -m githubRepo=CODEBUILD_DEFAULT_WEBHOOK_SOURCE_LOCATION -m githubCommitOrg=top0ppton3-ops -m githubCommitRepo=CODEBUILD_DEFAULT_WEBHOOK_SOURCE_LOCATION -m githubCommitMessage="fix: Simplify deployment workflow for Vercel and Supabase

Vercel deployment:
- Remove manual pnpm install step (vercel-action handles this)
- Vercel will automatically install dependencies and build

Supabase Edge Functions deployment:
- Add 'supabase link' step before deploy
- Required to connect CLI to the correct project
- Deploy command simplified to 'supabase functions deploy'

This fixes the deployment failures:
- Vercel: Install dependencies failure
- Supabase: Deploy Edge Functions failure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>" -m githubCommitRef=main
npm warn exec The following package was not found and will be installed: vercel@25.1.0

npm warn exec The following package was not found and will be installed: vercel@25.1.0
npm warn deprecated osenv@0.1.5: This package is no longer supported.

npm warn deprecated osenv@0.1.5: This package is no longer supported.
npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.

npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.

npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated npmlog@5.0.1: This package is no longer supported.

npm warn deprecated npmlog@5.0.1: This package is no longer supported.
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated gauge@3.0.2: This package is no longer supported.

npm warn deprecated gauge@3.0.2: This package is no longer supported.
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported

npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated are-we-there-yet@1.1.7: This package is no longer supported.

npm warn deprecated are-we-there-yet@1.1.7: This package is no longer supported.
npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported

npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
npm warn deprecated npmlog@4.1.2: This package is no longer supported.

npm warn deprecated npmlog@4.1.2: This package is no longer supported.
npm warn deprecated gauge@2.7.4: This package is no longer supported.

npm warn deprecated gauge@2.7.4: This package is no longer supported.
npm warn deprecated node-pre-gyp@0.13.0: Please upgrade to @mapbox/node-pre-gyp: the non-scoped node-pre-gyp package is deprecated and only the @mapbox scoped package will recieve updates in the future

npm warn deprecated node-pre-gyp@0.13.0: Please upgrade to @mapbox/node-pre-gyp: the non-scoped node-pre-gyp package is deprecated and only the @mapbox scoped package will recieve updates in the future
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated tar@4.4.19: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

npm warn deprecated tar@4.4.19: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
Vercel CLI 25.1.0

Vercel CLI 25.1.0
Retrieving project…

Retrieving project…
Deploying top0ppton3-ops-projects/codebuild-default-webhook-source-location

Deploying top0ppton3-ops-projects/codebuild-default-webhook-source-location
Error! Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.

Error! Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)

Error! An unexpected error occurred!
DeploymentError: Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later. Please upgrade by running `npm i -g vercel@latest`.
    at uploadList.<computed>.async_retry_1.default.retries (/home/runner/.npm/_npx/3bd3f5735a5df33c/node_modules/vercel/dist/index.js:217483:27)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Error: The process '/usr/local/bin/npx' failed with exit code 1
0s
0s
0s
