// This script transforms YAML taxonomy files to Contentful's expected JSON format
// Note: This would normally run locally, but here we're just creating the file in GitHub

/*
To run this script locally:
1. Clone your repository
2. Install Node.js if you don't have it
3. Run: npm install js-yaml
4. Run: node scripts/transform-for-contentful.js
*/

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to convert GitHub taxonomy to Contentful format
function transformTaxonomy() {
  try {
    // Load core categories
    const coreCategories = yaml.load(
      fs.readFileSync(path.join(__dirname, '../taxonomy/core-categories.yaml'), 'utf8')
    );
    
    // Load all subcategory files
    const subcategoriesPath = path.join(__dirname, '../taxonomy/subcategories');
    const subcategoryFiles = fs.readdirSync(subcategoriesPath);
    
    // Initialize Contentful format
    const contentfulFormat = {
      taxonomy: {
        concepts: [],
        conceptSchemes: []
      }
    };
    
    // Transform core categories to concept schemes
    coreCategories.categories.forEach(category => {
      contentfulFormat.taxonomy.conceptSchemes.push({
        sys: {
          id: category.id
        },
        name: category.name,
        description: category.description
      });
    });
    
    // Process all subcategory files
    const processedConcepts = new Map();
    
    subcategoryFiles.forEach(file => {
      if (file.endsWith('.yaml')) {
        const categoryData = yaml.load(
          fs.readFileSync(path.join(subcategoriesPath, file), 'utf8')
        );
        
        // Get parent category
        const parentId = categoryData.parent;
        
        // Process subcategories
        processSubcategories(categoryData.subcategories, parentId, null, contentfulFormat, processedConcepts);
      }
    });
    
    // Write to output file
    fs.writeFileSync(
      path.join(__dirname, '../contentful-taxonomy-export.json'),
      JSON.stringify(contentfulFormat, null, 2)
    );
    
    console.log('Taxonomy transformed successfully to Contentful format!');
    return contentfulFormat;
  } catch (error) {
    console.error('Error transforming taxonomy:', error);
    throw error;
  }
}

// Helper function to process subcategories recursively
function processSubcategories(subcategories, schemeId, parentId, contentfulFormat, processedConcepts) {
  if (!subcategories || !Array.isArray(subcategories)) {
    return;
  }
  
  subcategories.forEach(subcategory => {
    // Skip if already processed
    if (processedConcepts.has(subcategory.id)) {
      return;
    }
    
    // Create concept object
    const concept = {
      sys: {
        id: subcategory.id
      },
      preferredLabel: subcategory.name,
      description: subcategory.description,
      inScheme: schemeId ? [{ sys: { id: schemeId } }] : [],
      broader: parentId ? [{ sys: { id: parentId } }] : []
    };
    
    // Add to concepts array
    contentfulFormat.taxonomy.concepts.push(concept);
    
    // Mark as processed
    processedConcepts.set(subcategory.id, true);
    
    // Process nested subcategories if any
    if (subcategory.subcategories && Array.isArray(subcategory.subcategories)) {
      processSubcategories(
        subcategory.subcategories, 
        schemeId, 
        subcategory.id, 
        contentfulFormat, 
        processedConcepts
      );
    }
  });
}

// When run directly
if (require.main === module) {
  transformTaxonomy();
}

// Export for use in other scripts
module.exports = transformTaxonomy;
