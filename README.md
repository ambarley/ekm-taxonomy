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
