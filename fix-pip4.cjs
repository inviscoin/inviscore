const fs = require('fs');
const ctxFile = 'src/context/InvisContext.tsx';
let ctxContent = fs.readFileSync(ctxFile, 'utf8');

// add isMediaPipMode to context Type
ctxContent = ctxContent.replace(
  /activeBlocks: DashboardBlock\[\];/,
  `activeBlocks: DashboardBlock[];\n  isMediaPipMode: boolean;\n  setIsMediaPipMode: (v: boolean) => void;`
);

// add to state and provide
ctxContent = ctxContent.replace(
  /const \[activeBlocks, setActiveBlocks\] = useState<DashboardBlock\[\]>\(\[\]\);/,
  `const [activeBlocks, setActiveBlocks] = useState<DashboardBlock[]>([]);\n  const [isMediaPipMode, setIsMediaPipMode] = useState(false);`
);

ctxContent = ctxContent.replace(
  /activeBlocks,\n\s*addBlock,/,
  `activeBlocks,\n      isMediaPipMode,\n      setIsMediaPipMode,\n      addBlock,`
);

fs.writeFileSync(ctxFile, ctxContent, 'utf8');

const masterFile = 'src/components/DashboardMaster.tsx';
let masterContent = fs.readFileSync(masterFile, 'utf8');

masterContent = masterContent.replace(
  /const visibleBlocks = activeBlocks\.filter\(b => !b\.minimized\);/,
  `const { isMediaPipMode } = useInvis();\n  const visibleBlocks = activeBlocks.filter(b => !b.minimized);`
);

masterContent = masterContent.replace(
  /className="w-full h-full flex-1 overflow-hidden flex flex-col relative bg-black\/10"/g,
  `className={\`w-full h-full overflow-hidden flex flex-col relative bg-black/10 \${
                      (visibleBlocks.length === 2 && block.type === 'media') 
                        ? (isMediaPipMode ? 'flex-1' : 'flex-[2]') 
                        : (visibleBlocks.length === 2 && block.type !== 'media')
                          ? (isMediaPipMode ? 'flex-[2]' : 'flex-1')
                          : 'flex-1'
                    }\`}`
);

fs.writeFileSync(masterFile, masterContent, 'utf8');


const mediaFile = 'src/components/MediaModule.tsx';
let mediaContent = fs.readFileSync(mediaFile, 'utf8');

mediaContent = mediaContent.replace(
  /const { currentUser, closeBlock, addTransaction, mediaSubTab, setMediaHubSelectorOpen, addBlock, activeBlocks } = useInvis\(\);/,
  `const { currentUser, closeBlock, addTransaction, mediaSubTab, setMediaHubSelectorOpen, addBlock, activeBlocks, isMediaPipMode, setIsMediaPipMode } = useInvis();`
);

mediaContent = mediaContent.replace(
  /const \[isBlockMode, setIsBlockMode\] = useState\(false\);/g,
  `// const [isBlockMode, setIsBlockMode] = useState(false); (mapped to context)`
);

mediaContent = mediaContent.replace(/setIsBlockMode/g, 'setIsMediaPipMode');
mediaContent = mediaContent.replace(/isBlockMode/g, 'isMediaPipMode');


fs.writeFileSync(mediaFile, mediaContent, 'utf8');
console.log('done context replacement');
