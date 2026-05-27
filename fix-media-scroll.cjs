const fs = require('fs');

let content = fs.readFileSync('src/components/MediaModule.tsx', 'utf8');

// Update initial counts to 60
content = content.replace(/useState\(30\);/g, 'useState(60);');
content = content.replace(/< 30/g, '< 120'); // Allow limits to grow
content = content.replace(/Math\.min\(30,/g, 'Math.min(180,');
content = content.replace(/prev \+ 15/g, 'prev + 60');

// Modify the vertical container scroll logic
const oldHandleContainerScroll = `  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight > scrollHeight - 220) {
      // Preload more into horizontal limits dynamically (+15 titles!)
      setFavoritesLimit(prev => prev + 15);
      setContinueWatchingLimit(prev => prev + 15);
      setSuggestionsLimit(prev => prev + 15);
      setNetflixLimit(prev => prev + 15);
      setDisneyLimit(prev => prev + 15);
      setHboLimit(prev => prev + 15);
      setPrimeLimit(prev => prev + 15);
      setGloboplayLimit(prev => prev + 15);

      // Increase main catalog search grid limits
      const totalMatch = memoizedCategories.filtered.length;

      if (visiblePostersCount < totalMatch) {
         setVisiblePostersCount(prev => Math.min(totalMatch, prev + 15));
      } else {
        // Expand the main catalog by fabricating 30 new titles dynamically!
        const newItems: Movie[] = [];
        const currentCount = moviesList.length;
        for (let i = 0; i < 30; i++) {
          const baseItem = CINEMA_ROSTER[i % CINEMA_ROSTER.length];
          newItems.push({
            ...baseItem,
            id: \`gen-\${Date.now()}-\${currentCount + i}\`,
            title: \`\${baseItem.title} - Expansão \${currentCount + i}\`,
            year: baseItem.year + Math.floor(Math.random() * 5),
          });
        }
        setMoviesList(prev => [...prev, ...newItems]);
        setVisiblePostersCount(prev => prev + 15);
      }
      triggerHaptic(10);
    }
  };`;

const newHandleContainerScroll = `  const scrollCountRef = useRef(0);
  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight > scrollHeight - 220) {
      scrollCountRef.current += 1;
      // Preload more into horizontal limits dynamically (+60 titles!)
      setFavoritesLimit(prev => prev + 60);
      setContinueWatchingLimit(prev => prev + 60);
      setSuggestionsLimit(prev => prev + 60);
      setNetflixLimit(prev => prev + 60);
      setDisneyLimit(prev => prev + 60);
      setHboLimit(prev => prev + 60);
      setPrimeLimit(prev => prev + 60);
      setGloboplayLimit(prev => prev + 60);

      // Increase main catalog search grid limits
      const totalMatch = memoizedCategories.filtered.length;

      if (visiblePostersCount < totalMatch) {
         setVisiblePostersCount(prev => Math.min(totalMatch, prev + 60));
      } else {
        if (scrollCountRef.current % 3 === 0) {
          // Expand the main catalog by fabricating 60 new titles dynamically!
          const newItems: Movie[] = [];
          const currentCount = moviesList.length;
          for (let i = 0; i < 60; i++) {
            const baseItem = CINEMA_ROSTER[i % CINEMA_ROSTER.length] || CINEMA_ROSTER[0];
            newItems.push({
              ...baseItem,
              id: \`gen-\${Date.now()}-\${currentCount + i}\`,
              title: \`\${baseItem.title} - \${currentCount + i}\`,
              year: baseItem.year + Math.floor(Math.random() * 5),
            });
          }
          setMoviesList(prev => [...prev, ...newItems]);
          setVisiblePostersCount(prev => prev + 60);
        }
      }
      triggerHaptic(10);
    }
  };`;

content = content.replace(oldHandleContainerScroll, newHandleContainerScroll);

fs.writeFileSync('src/components/MediaModule.tsx', content, 'utf8');
