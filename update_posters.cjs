const fs = require('fs');
const content = fs.readFileSync('src/components/MediaModule.tsx', 'utf8');

// Add `trailerMovieId` state
let newContent = content;

if (!newContent.includes('trailerMovieId')) {
    newContent = newContent.replace(
        /const \[activeTrailerIndex, setActiveTrailerIndex\] = useState\(0\);/,
        `const [activeTrailerIndex, setActiveTrailerIndex] = useState(0);\n  const [trailerMovieId, setTrailerMovieId] = useState<string | null>(null);`
    );
}

// Map the posters
newContent = newContent.replace(
    /<img src=\{movie\.posterUrl\} alt=\{movie\.title\}(.*?) \/>/g,
    `<AnimatePresence>
      {trailerMovieId === movie.id ? (
        <motion.video
          key="reel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          src="https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4"
          autoPlay
          muted
          className="absolute inset-0 w-full h-full object-cover z-20"
        />
      ) : (
        <motion.img
          key="poster"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          src={movie.posterUrl} 
          alt={movie.title} 
          $1 
        />
      )}
    </AnimatePresence>`
);

newContent = newContent.replace(
    /<div className="pt-1\.5 (text-left[^"]*)">([\s\S]*?)<\/div>\s*<\/div>\s*\)\)/g,
    (match, p1, p2) => {
        return `<div className="pt-1.5 ${p1}">
${p2}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setTrailerMovieId(movie.id); 
          setTimeout(() => {
            setTrailerMovieId(cur => cur === movie.id ? null : cur);
          }, 30000);
        }}
        className="mt-1 w-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/20 text-cyan-400 font-mono text-[8px] font-bold uppercase tracking-widest py-1 rounded transition-colors"
      >
        Trailer
      </button>
    </div>
  </div>
))`;
    }
);

fs.writeFileSync('src/components/MediaModule.tsx', newContent, 'utf8');
console.log('Posters updated.');
