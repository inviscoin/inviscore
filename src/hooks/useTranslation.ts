import { useInvis, DICTIONARY } from '../context/InvisContext';

export const useTranslation = () => {
  const { language } = useInvis();
  const currentTexts = DICTIONARY[language] || DICTIONARY['pt-BR'];
  
  const t = (key: keyof typeof DICTIONARY['pt-BR'] | string, fallback?: string): string => {
    return (currentTexts as any)[key] || fallback || key;
  };

  return { t, currentTexts, language };
};
