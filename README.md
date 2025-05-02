# Enterprise Knowledge Management Taxonomy

This repository contains the taxonomy structure for our Enterprise Knowledge Management (EKM) initiative.

## Taxonomy Structure

- **Knowledge Type** (Flat Structure, Single Select)
  - Policy and Procedure
  - Overview
  - Brand Standard
  - Best Practice
  - Walkthrough
  - Troubleshooting

- **Locale** (Hierarchical Structure, Multi-Select)
  - Global
  - AMER
    - US
    - Canada
  - EMEA
    - France
    - Germany
    - Sweden
    - Spain
    - UK
    - South Africa
  - APAC
    - Australia
    - New Zealand
    - Japan
      
- **Audience** (Hierarchical Structure, Multi-Select)
  - nCino Employee
    - Manager-Only
    - New Hire

## Repository Structure

- `taxonomy/core-categories.yaml`: Defines the main category types
- `taxonomy/subcategories/`: Contains the detailed taxonomy for each category
- `scripts/`: Contains scripts to transform and import the taxonomy

## How to Use This Repository

### 1. Make Changes to the Taxonomy

Edit the YAML files in the `taxonomy/` directory to update the taxonomy structure.

### 2. Import to Contentful

To import this taxonomy into Contentful:

1. Clone this repository to your local machine:
   ```
   git clone https://github.com/yourusername/contentful-taxonomy.git
   cd contentful-taxonomy
   ```

2. Install required packages:
   ```
   npm install js-yaml dotenv
   npm install -g contentful-cli
   ```

3. Create a `.env` file with your Contentful credentials:
   ```
   CONTENTFUL_ORGANIZATION_ID=your_organization_id
   CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
   ```

4. Run the import script:
   ```
   node scripts/import-to-contentful.js
   ```

### 3. Working with Claude AI

You can use Claude to help suggest taxonomy tags by sharing this repository link and content to analyze:

Example: "Based on the taxonomy at https://github.com/yourusername/contentful-taxonomy, what tags would you suggest for this content: [Your content here]"
