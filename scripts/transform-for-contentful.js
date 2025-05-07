// This script transforms YAML taxonomy files to Contentful's expected JSON format for 2025 API
// Compatible with enhanced taxonomy CDA delivery and CLI import/export

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Constants for Contentful limits (April 2025)
const CONTENTFUL_LIMITS = {
  MAX_TOTAL_CONCEPTS: 6000,
  MAX_CONCEPTS_PER_SCHEME: 2000,
  MAX_CONCEPT_SCHEMES: 20,
  MAX_HIERARCHY_DEPTH: 5
};

// Function to convert GitHub taxonomy to Contentful format
function transformTaxonomy() {
  try {
    // Load core categories - UPDATED PATH
    const coreCategories = yaml.load(
      fs.readFileSync(path.join(__dirname, '../core-categories.yaml'), 'utf8')
    );
    
    // Load all subcategory files - UPDATED PATH
    const subcategoriesPath = path.join(__dirname, '../subcategories');
    const subcategoryFiles = fs.readdirSync(subcategoriesPath);
    
    // Initialize Contentful format - updated for April 2025 CDA format
    const contentfulFormat = {
      taxonomy: {
        version: "2025-04", // Version identifier for the new format
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
        description: category.description || ""
      });
    });
    
    // Validate concept scheme count
    if (contentfulFormat.taxonomy.conceptSchemes.length > CONTENTFUL_LIMITS.MAX_CONCEPT_SCHEMES) {
      console.warn(`Warning: You have ${contentfulFormat.taxonomy.conceptSchemes.length} concept schemes, which exceeds Contentful's limit of ${CONTENTFUL_LIMITS.MAX_CONCEPT_SCHEMES}.`);
    }
    
    // Process all subcategory files
    const processedConcepts = new Map();
    const conceptCounts = new Map(); // Track concepts per scheme
    let totalConcepts = 0;
    let maxDepth = 0;
    
    subcategoryFiles.forEach(file => {
      if (file.endsWith('.yaml')) {
        const categoryData = yaml.load(
          fs.readFileSync(path.join(subcategoriesPath, file), 'utf8')
        );
        
        // Get parent category
        const parentId = categoryData.parent;
        
        // Initialize concept count for this scheme if not exists
        if (!conceptCounts.has(parentId)) {
          conceptCounts.set(parentId, 0);
        }
        
        // Process subcategories
        const depth = processSubcategories(
          categoryData.subcategories, 
          parentId, 
          null, 
          contentfulFormat, 
          processedConcepts,
          conceptCounts,
          1 // Start at depth 1
        );
        
        // Track max depth
        maxDepth = Math.max(maxDepth, depth);
      }
    });
    
    // Calculate total concepts
    totalConcepts = contentfulFormat.taxonomy.concepts.length;
    
    // Validate total concepts
    if (totalConcepts > CONTENTFUL_LIMITS.MAX_TOTAL_CONCEPTS) {
      console.warn(`Warning: You have ${totalConcepts} total concepts, which exceeds Contentful's limit of ${CONTENTFUL_LIMITS.MAX_TOTAL_CONCEPTS}.`);
    }
    
    // Validate concepts per scheme
    conceptCounts.forEach((count, schemeId) => {
      if (count > CONTENTFUL_LIMITS.MAX_CONCEPTS_PER_SCHEME) {
        console.warn(`Warning: Concept scheme "${schemeId}" has ${count} concepts, which exceeds Contentful's limit of ${CONTENTFUL_LIMITS.MAX_CONCEPTS_PER_SCHEME}.`);
      }
    });
    
    // Validate hierarchy depth
    if (maxDepth > CONTENTFUL_LIMITS.MAX_HIERARCHY_DEPTH) {
      console.warn(`Warning: Your taxonomy has a maximum depth of ${maxDepth}, which exceeds Contentful's limit of ${CONTENTFUL_LIMITS.MAX_HIERARCHY_DEPTH}.`);
    }
    
    // Add metadata for n8n compatibility
    contentfulFormat.metadata = {
      totalConcepts,
      conceptsPerScheme: Object.fromEntries(conceptCounts),
      maxDepth,
      generatedAt: new Date().toISOString(),
      compatibilityVersion: "2025-04-11" // Contentful API version reference
    };
    
    // Write to output file
    fs.writeFileSync(
      path.join(__dirname, '../contentful-taxonomy-export.json'),
      JSON.stringify(contentfulFormat, null, 2)
    );
    
    console.log('Taxonomy transformed successfully to Contentful format!');
    console.log(`Total concepts: ${totalConcepts}`);
    console.log(`Max hierarchy depth: ${maxDepth}`);
    
    return contentfulFormat;
  } catch (error) {
    console.error('Error transforming taxonomy:', error);
    throw error;
  }
}

// Helper function remains unchanged
function processSubcategories(subcategories, schemeId, parentId, contentfulFormat, processedConcepts, conceptCounts, currentDepth) {
  if (!subcategories || !Array.isArray(subcategories)) {
    return currentDepth;
  }
  
  let maxDepth = currentDepth;
  
  subcategories.forEach(subcategory => {
    // Skip if already processed
    if (processedConcepts.has(subcategory.id)) {
      return;
    }
    
    // Increment concept count for this scheme
    conceptCounts.set(schemeId, conceptCounts.get(schemeId) + 1);
    
    // Create concept object - updated for SKOS compliance
    const concept = {
      sys: {
        id: subcategory.id
      },
      preferredLabel: subcategory.name, // SKOS terminology
      description: subcategory.description || "",
      inScheme: schemeId ? [{ sys: { id: schemeId } }] : [], // SKOS relationship
      broader: parentId ? [{ sys: { id: parentId } }] : [] // SKOS relationship
    };
    
    // Add alternative labels if provided (SKOS compliance)
    if (subcategory.alternativeLabels && Array.isArray(subcategory.alternativeLabels)) {
      concept.altLabels = subcategory.alternativeLabels;
    }
    
    // Add to concepts array
    contentfulFormat.taxonomy.concepts.push(concept);
    
    // Mark as processed
    processedConcepts.set(subcategory.id, true);
    
    // Process nested subcategories if any
    if (subcategory.subcategories && Array.isArray(subcategory.subcategories)) {
      const subDepth = processSubcategories(
        subcategory.subcategories, 
        schemeId, 
        subcategory.id, 
        contentfulFormat, 
        processedConcepts, 
        conceptCounts,
        currentDepth + 1
      );
      
      maxDepth = Math.max(maxDepth, subDepth);
    }
  });
  
  return maxDepth;
}

// When run directly
if (require.main === module) {
  transformTaxonomy();
}

// Export for use in other scripts
module.exports = transformTaxonomy;
