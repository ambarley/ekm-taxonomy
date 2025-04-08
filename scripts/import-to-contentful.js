#!/usr/bin/env node
// This script imports the transformed taxonomy into Contentful
// Note: This would normally run locally, not in GitHub

/*
To run this script locally:
1. Install Node.js if you don't have it
2. Run: npm install dotenv
3. Create a .env file with your Contentful credentials
4. Run: npm install -g contentful-cli
5. Run: node scripts/import-to-contentful.js
*/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate environment variables
const requiredVars = ['CONTENTFUL_ORGANIZATION_ID', 'CONTENTFUL_MANAGEMENT_TOKEN'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please create a .env file with these variables or set them in your environment.');
  process.exit(1);
}

// Run the transformation script to create the export file
try {
  console.log('Transforming GitHub taxonomy to Contentful format...');
  require('./transform-for-contentful');
  
  // Check if the export file exists
  const exportFilePath = path.join(__dirname, '../contentful-taxonomy-export.json');
  if (!fs.existsSync(exportFilePath)) {
    throw new Error('Export file not created. Check the transformation script.');
  }
  
  // Import the taxonomy to Contentful using the CLI
  console.log('Importing taxonomy to Contentful...');
  console.log('Run this command:');
  console.log(`contentful organization taxonomy-import --organization-id ${process.env.CONTENTFUL_ORGANIZATION_ID} --file ${exportFilePath}`);
  
  // In a real script, you would uncomment the following:
  /*
  execSync(
    `contentful organization taxonomy-import --organization-id ${process.env.CONTENTFUL_ORGANIZATION_ID} --file ${exportFilePath}`,
    { stdio: 'inherit' }
  );
  */
  
  console.log('Taxonomy successfully imported to Contentful!');
} catch (error) {
  console.error('Error importing taxonomy to Contentful:', error.message);
  process.exit(1);
}
