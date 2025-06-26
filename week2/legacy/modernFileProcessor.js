const fs = require('fs').promises;
const path = require('path');

/**
 * Processes a text file by trimming whitespace from each line
 * @param {string} filePath - Path to the input file
 * @param {string} [outputPath='output.txt'] - Path for the output file
 * @returns {Promise<void>}
 * @throws {Error} If file path is invalid or file operations fail
 */
async function processFile(filePath, outputPath = 'output.txt') {
  try {
    // Input validation
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path: Path must be a non-empty string');
    }

    // Resolve and validate file paths
    const resolvedInputPath = path.resolve(filePath);
    const resolvedOutputPath = path.resolve(outputPath);

    // Check if input file exists and is accessible
    try {
      await fs.access(resolvedInputPath);
    } catch (err) {
      throw new Error(`Input file not accessible: ${filePath}`);
    }

    // Read and process file content
    const data = await fs.readFile(resolvedInputPath, 'utf8');
    
    // Process data using modern array methods
    const result = data
      .split('\n')
      .map(line => line.trim())
      .join('\n');

    // Write processed content to output file
    await fs.writeFile(resolvedOutputPath, result);
    
    console.log(`File processed successfully! Output saved to: ${outputPath}`);
    return result;
  } catch (error) {
    // Enhanced error handling with specific error types
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${error.path}`);
    } else if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${error.path}`);
    } else {
      throw new Error(`Processing failed: ${error.message}`);
    }
  }
}

// Export the function for testing
module.exports = { processFile };

// Example usage with error handling
async function main() {
  try {
    await processFile('input.txt', 'output.txt');
  } catch (error) {
    console.error('Error:', error.message);
    // Only exit if run directly
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
} 