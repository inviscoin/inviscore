const fs = require('fs');
let content = fs.readFileSync('src/components/MediaHubSelectorOverlay.tsx', 'utf8');
content = content.replace(/backdrop-blur-2xl/g, 'backdrop-blur-sm');
content = content.replace(/className={`relative w-full h-\[125px\] rounded-\[28px\] border bg-gradient-to-br from-white\/\[0\.04\] to-white\/\[0\.08\] backdrop-blur-sm transition-transform transition-opacity duration-500 cursor-pointer flex items-center overflow-hidden p-1 transform-gpu /g, 'className={`relative w-full h-[125px] rounded-[28px] border bg-gradient-to-br from-white/[0.04] to-white/[0.08] backdrop-blur-sm transition-transform transition-opacity duration-300 cursor-pointer flex items-center overflow-hidden p-1 transform-gpu will-change-transform ');
fs.writeFileSync('src/components/MediaHubSelectorOverlay.tsx', content);
