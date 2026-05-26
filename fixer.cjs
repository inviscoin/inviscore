const fs = require('fs');
const file = 'src/components/MediaModule.tsx';
let content = fs.readFileSync(file, 'utf8');

// Play button z-index
content = content.replace(
  /className="absolute z-40 w-20 h-20 bg-gradient-[^"]*"/g,
  match => match.replace('z-40', 'z-[80]')
);

// HUD positioning
content = content.replace(
  /<div className="absolute bottom-8 w-\[95%\] max-w-\[900px\] flex flex-col gap-0 z-50">/g,
  '<div className={`absolute w-[95%] max-w-[900px] flex flex-col gap-0 z-[60] pointer-events-auto ${isBlockMode ? \'bottom-2\' : \'bottom-8\'}`}>'
);

// Timeline border radius
content = content.replace(
  /<div className="flex items-center gap-4 bg-black\/80 backdrop-blur-xl p-3 rounded-t-3xl border border-white\/10 shadow-\[0_-10px_40px_rgba\(0,0,0,0\.5\)\]">/g,
  '<div className={`flex items-center gap-4 bg-black/80 backdrop-blur-xl p-3 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isBlockMode ? \'rounded-3xl\' : \'rounded-t-3xl\'}`}>'
);

// Switch row hiding
content = content.replace(
  /\{(\s*)\/\*\s*Option Switches row\s*\*\/\}(\s*)<div className="flex justify-center items-end gap-3([^>]+)>/g,
  '{$1/* Option Switches row */}$2{!isBlockMode && (\n<div className="flex justify-center items-end gap-3$3>'
);

// Add closing brace
content = content.replace(
  /(\s*)<\/div>(\s*)<\/div>(\s*)<\/div>(\s*)\)}/g,
  '$1</div>$2)}</div >$3</div>$4)}' // this is very fragile, let's not use regex for the end.
);

fs.writeFileSync(file, content, 'utf8');
console.log('first replace done');
