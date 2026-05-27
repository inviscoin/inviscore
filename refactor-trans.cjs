const fs = require('fs');

const files = [
  'src/components/WalletModal.tsx',
  'src/components/DashboardMaster.tsx',
  'src/components/HeaderTop.tsx',
  'src/components/LockScreen.tsx',
  'src/components/LoginScreen.tsx',
  'src/components/OnboardingFlow.tsx',
  'src/components/RegisterScreen.tsx',
  'src/components/LibraryModule.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('useTranslation')) return;
  
  // Add import hook
  content = content.replace(/import \{ useInvis, ([^}]+) \} from '\.\.\/context\/InvisContext';/, "import { useInvis, $1 } from '../context/InvisContext';\nimport { useTranslation } from '../hooks/useTranslation';");
  content = content.replace(/import \{ useInvis \} from '\.\.\/context\/InvisContext';/, "import { useInvis } from '../context/InvisContext';\nimport { useTranslation } from '../hooks/useTranslation';");
  
  // Replace DICTIONARY[language]
  content = content.replace(/const currentTexts = DICTIONARY\[language\] \|\| DICTIONARY\['pt-BR'\];/g, 'const { currentTexts } = useTranslation();');
  content = content.replace(/const currentTexts = DICTIONARY\[language\];/g, 'const { currentTexts } = useTranslation();');
  
  fs.writeFileSync(file, content);
});
