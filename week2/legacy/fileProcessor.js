const fs = require('fs');

function processFile(filePath) {
  // Read the file asynchronously
  fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) {
      console.log('Error reading file:', err);
      return;
    }

    // Process data
    let result = '';
    let lines = data.split('\n');
    for (let i = 0; i < lines.length; i++) {
      result += lines[i].trim() + '\n';
    }

    // Save the result back to a new file
    fs.writeFile('output.txt', result, function(err) {
      if (err) {
        console.log('Error writing file:', err);
        return;
      }
      console.log('File processed successfully!');
    });
  });
}

processFile('input.txt'); 