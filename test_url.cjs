const https = require('https');

https.request('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', { method: 'HEAD' }, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
}).end();
