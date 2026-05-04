Microsoft Build 2026

June 2-3, 2026
Learn more
 Dismiss alert

Learn

Sign in
Learn  Azure  App Service 

Deploy a Node.js web app in Azure


Summarize this article for me
Choose a development environment

Visual Studio Code

Command-line interface

Azure portal
In this article

Set up your initial environment
Create your Node.js application
Deploy to Azure
Redeploy updates
Show 3 more
In this quickstart, you learn how to create and deploy your first Node.js (Express) web app to Azure App Service. App Service supports various versions of Node.js on both Linux and Windows.
This quickstart configures an App Service app in the Free tier and incurs no cost for your Azure subscription.
This video shows you how to deploy a Node.js web app in Azure.

The steps in the video are also described in the following sections.
Set up your initial environment

Have an Azure account with an active subscription. If you don't have one, you can create an account for free.
Install Node.js LTS. Run the command node --version to verify that Node.js is installed.
Have an FTP client, such as FileZilla, to transfer files to App Service.
Create your Node.js application

In this step, you create a basic Node.js application and ensure it runs on your computer.
 Tip
If you already completed the Node.js tutorial, you can skip ahead to Deploy to Azure.
Create a Node.js application by using the express application generator, which is installed by default with Node.js and npm.
Bash

Copy
npx express-generator myExpressApp --view ejs
If this is the first time you've installed the generator, npx asks you to agree to the installation.
Change to the application's directory and install the npm packages.
Bash

Copy
cd myExpressApp && npm install
Update dependencies to the most secure version.
Bash

Copy
npm audit fix --force
Start the development server with debug information.
Bash

Copy
DEBUG=myexpressapp:* npm start
In a browser, navigate to http://localhost:3000. You should see something like this:
 Screenshot of an Express application running in a browser.
Deploy to Azure

Before you continue, ensure that you have all the prerequisites installed and configured.
 Note
For your Node.js application to run in Azure, it needs to listen on the port provided by the PORT environment variable. In your generated Express app, this environment variable is already used in the startup script bin/www. (Search for process.env.PORT.)
Create Azure resources

Sign in to the Azure portal.
To start creating a Node.js app, browse to https://portal.azure.com/#create/Microsoft.WebSite.
In the Basics tab, under Project Details, ensure the correct subscription is selected and then select Create new to create a resource group. Type myResourceGroup for the name.
 Screenshot of the Project Details section showing where you select the Azure subscription and the resource group for the web app.
Under Instance details, type a globally unique name for your web app and select Code. Select Node 24 LTS in Runtime stack, an Operating System, and a Region you want to serve your app from.
 Screenshot of the Instance Details section.
Under Pricing plans, select Create new to create an App Service plan. Type myAppServicePlan for the name. To change to the Free tier, select Free F1 in the Pricing plan list.
 Screenshot of the App Service Plan section.
Select the Review + create button at the bottom of the page.
 Screenshot showing the Review and create button at the bottom of the page
After validation runs, select the Create button at the bottom of the page.
After deployment is complete, select Go to resource.
 Screenshot showing the Go to resource button.
Get FTPS credentials

Azure App Service supports two types of credentials for FTP/S deployment. These credentials aren't the same as your Azure subscription credentials. In this section, you get the application-scope credentials to use with your FTP client.
From the App Service app page, select Deployment Center under Deployment in the sidebar menu, and then select the FTPS Credentials tab.
 Screenshot that shows the FTPS deployment credentials tab.
Open your FTP client and navigate to your myExpressApp folder.
From the FTPS credentials tab, copy the FTPS endpoint, Username, and Password into your FTP client.
 Screenshot of the FTPS connection details.
Select Connect in your FTP client.
Deploy files with FTPS

Copy all files and directories files to the /site/wwwroot directory in Azure.
 Screenshot of the WWW root directory.
Browse to your app's URL to verify the app is running properly.
Redeploy updates

You can deploy changes to this app by making edits in Visual Studio Code, saving your files, and then redeploying to your Azure app. For example:
From the sample project, open views/index.ejs and change
HTML

Copy
<p>Welcome to <%= title %></p>
to
HTML

Copy
<p>Welcome to Azure</p>
Save your changes, then redeploy the app using your FTP client.
Once deployment is complete, refresh the webpage. You should see that the Welcome to Express message was changed to Welcome to Azure.
Stream logs

You can access the console logs generated from inside the app and the container in which it runs. You can stream log output (calls to console.log()) from the Node.js app directly in the Azure portal.
In the same App Service page for your app, use the sidebar menu to scroll to the Monitoring section and select Log stream.
 Screenshot of Log stream in Azure App service.
After a few seconds, the output window shows a message indicating that you're connected to the log-streaming service. You can generate more output activity by refreshing the page in the browser.
Output

Copy
Connecting...
2021-10-26T21:04:14  Welcome, you are now connected to log-streaming service.
Starting Log Tail -n 10 of existing logs ----
/appsvctmp/volatile/logs/runtime/81b1b83b27ea1c3d598a1cdec28c71c4074ce66c735d0be57f15a8d07cb3178e.log
2021-10-26T21:04:08.614384810Z: [INFO]
2021-10-26T21:04:08.614393710Z: [INFO]  # Enter the source directory to make sure the script runs where the user expects
2021-10-26T21:04:08.614399010Z: [INFO]  cd "/home/site/wwwroot"
2021-10-26T21:04:08.614403210Z: [INFO]
2021-10-26T21:04:08.614407110Z: [INFO]  export NODE_PATH=/usr/local/lib/node_modules:$NODE_PATH
2021-10-26T21:04:08.614411210Z: [INFO]  if [ -z "$PORT" ]; then
2021-10-26T21:04:08.614415310Z: [INFO]          export PORT=8080
2021-10-26T21:04:08.614419610Z: [INFO]  fi
2021-10-26T21:04:08.614423411Z: [INFO]
2021-10-26T21:04:08.614427211Z: [INFO]  node /opt/startup/default-static-site.js
Ending Log Tail of existing logs ---
Clean up resources

You can delete the resource group, App service, and all related resources when they're no longer needed.
From your App Service overview page, select the resource group you created in the Create Azure resources step.
 Screenshot of resource group in App Service overview page.
From the resource group page, select Delete resource group. Confirm the name of the resource group to finish deleting the resources.
 Screenshot of Delete resource group.
Related content

Congratulations, you've successfully completed this quickstart!
Deploy a Node.js + MongoDB web app to Azure
Configure a Node.js app
 Use a custom domain and a managed certificate to secure your app
Check out the other Azure extensions.
Azure Cosmos DB
Azure Functions
Docker Extension Pack
Azure CLI Tools
Azure Resource Manager Tools
Or get them all by installing the Node Pack for Azure extension pack.
 Note: The author created this article with assistance from AI. Learn more
Feedback

Was this page helpful?


Yes

No
Additional resources

Documentation
Configure Node.js Apps - Azure App Service
Learn how to configure a Node.js app in the native Windows instances, or in a prebuilt Linux container, in Azure App Service.
Deployment best practices - Azure App Service
Learn about the key mechanisms of deploying to Azure App Service. Find language-specific recommendations and other caveats.
Deploy a Node.js + MongoDB app to Azure - Azure App Service
Learn how to deploy a Node.js app using Express.js and a MongoDB database using Azure App Service in Linux.
Show 5 more
Training
Module
Host a web application with Azure App Service - Training
Create a website using C#, Java, Python, or Node.js and deploy it through the hosted web app platform in Azure App Service.
Certification
Microsoft Certified: Azure Developer Associate - Certifications
Build end-to-end solutions in Microsoft Azure to create Azure Functions, implement and manage web apps, develop solutions utilizing Azure storage, and more.
Last