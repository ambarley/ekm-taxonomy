#!/usr/bin/env node
// This script imports the transformed taxonomy into Contentful
// Updated for April 2025 Contentful CLI and API compatibility
// Optimized for n8n integration

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

// Define paths
const exportFilePath = path.join(__dirname, '../contentful-taxonomy-export.json');
const importLogPath = path.join(__dirname, '../import-log.json');

// Run the import process
async function importTaxonomy() {
  try {
    console.log('Transforming GitHub taxonomy to Contentful format...');
    
    // Run the transformation script
    const transformTaxonomy = require('./transform-for-contentful');
    const taxonomyData = transformTaxonomy();
    
    // Check if the export file exists
    if (!fs.existsSync(exportFilePath)) {
      throw new Error('Export file not created. Check the transformation script.');
    }
    
    // Log import timestamp for n8n tracking
    const importMeta = {
      timestamp: new Date().toISOString(),
      totalConcepts: taxonomyData.metadata.totalConcepts,
      conceptSchemes: taxonomyData.taxonomy.conceptSchemes.map(scheme => ({
        id: scheme.sys.id,
        name: scheme.name,
        conceptCount: taxonomyData.metadata.conceptsPerScheme[scheme.sys.id] || 0
      }))
    };
    
    fs.writeFileSync(importLogPath, JSON.stringify(importMeta, null, 2));
    
    // Import the taxonomy to Contentful using the CLI
    console.log('Importing taxonomy to Contentful...');
    console.log('Using Enhanced Taxonomy API (April 2025)');
    
    // Construct the CLI command
    const cliCommand = `contentful organization taxonomy-import --organization-id ${process.env.CONTENTFUL_ORGANIZATION_ID} --management-token ${process.env.CONTENTFUL_MANAGEMENT_TOKEN} --file ${exportFilePath} --format 2025-04`;
    
    // Log the command without the token for security
    const sanitizedCommand = cliCommand.replace(process.env.CONTENTFUL_MANAGEMENT_TOKEN, '[REDACTED]');
    console.log(`Running command: ${sanitizedCommand}`);
    
    // Execute the command - commented out for safety, uncomment when ready to use
    /*
    execSync(
      cliCommand,
      { stdio: 'inherit' }
    );
    */
    
    // For n8n integration - create a status file that n8n can check
    const statusData = {
      status: 'ready_for_import',
      command: sanitizedCommand,
      file: exportFilePath,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../n8n-import-status.json'),
      JSON.stringify(statusData, null, 2)
    );
    
    console.log('Taxonomy prepared for import to Contentful!');
    console.log('n8n integration: Status file created at n8n-import-status.json');
    console.log('To import directly, uncomment the execSync section in this script.');
    
    return statusData;
  } catch (error) {
    console.error('Error importing taxonomy to Contentful:', error.message);
    
    // Create error status for n8n to process
    const errorStatus = {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../n8n-import-status.json'),
      JSON.stringify(errorStatus, null, 2)
    );
    
    process.exit(1);
  }
}

// When run directly
if (require.main === module) {
  importTaxonomy();
}

// Export for use in other scripts
module.exports = importTaxonomy;
