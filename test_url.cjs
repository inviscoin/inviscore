const http = require('http');

http.get('http://localhost:3000/api/tmdb/trending', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Result length:', json.length);
      console.log('First item:', json[0]);
    } catch (e) {
      console.log('Response string:', data.substring(0, 500));
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
