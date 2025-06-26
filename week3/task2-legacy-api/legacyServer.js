const http = require('http');
const url = require('url');

function validateForm(data) {
  var errors = {};
  if (!data.name || !data.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = 'Email is invalid';
  }
  if (data.age && isNaN(Number(data.age))) {
    errors.age = 'Age must be a number';
  }
  return errors;
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

var server = http.createServer(function(req, res) {
  var parsedUrl = url.parse(req.url, true);
  if (req.method === 'POST' && parsedUrl.pathname === '/legacy-form') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
      var errors = validateForm(data);
      if (Object.keys(errors).length > 0) {
        return sendJson(res, 400, { errors: errors });
      }
      sendJson(res, 200, { message: 'Form submitted successfully!', data: data });
    });
  } else {
    sendJson(res, 404, { error: 'Not found' });
  }
});

if (require.main === module) {
  server.listen(3002, function() {
    console.log('Pure Node.js legacy server running on port 3002');
  });
}

module.exports = server; 