const fs = require('fs');
const file = 'src/components/MediaModule.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update the video play size conditional to factor in activeBlocks
content = content.replace(
  /className=\{`transition-all duration-500 bg-black overflow-hidden group flex items-center justify-center \$\{\s*\(isBlockMode \|\| isCompact\)\s*\?\s*"w-full aspect-video rounded-3xl border border-cyan-500\/50 shadow-\[0_0_20px_rgba\(6,182,212,0\.22\)\] relative"\s*:\s*"fixed top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2 w-\[100vh\] h-\[100vw\] rotate-90 z-\[9999\] shadow-2xl origin-center"\s*\}`\}/,
  `className={\`transition-all duration-500 bg-black overflow-hidden group flex items-center justify-center \${
                          (isBlockMode || activeBlocks.length > 1 || isCompact)
                            ? "w-full aspect-video rounded-3xl border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.22)] relative"
                            : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vh] h-[100vw] rotate-90 z-[9999] shadow-2xl origin-center"
                        }\`}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('done rotation replace');
