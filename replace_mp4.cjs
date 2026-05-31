const fs = require('fs');
const files = ['server.ts', 'src/components/MediaModule.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/https:\/\/archive\.org\/download\/ElephantsDream\/ed_1024_512kb\.mp4/g, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  content = content.replace(/https:\/\/archive\.org\/download\/night_of_the_living_dead\/night_of_the_living_dead_512kb\.mp4/g, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
  fs.writeFileSync(file, content);
}
console.log('Replaced mp4 URLs');
