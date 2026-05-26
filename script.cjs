const fs = require('fs');
const file = 'src/components/MediaModule.tsx';
let content = fs.readFileSync(file, 'utf8');

// 3. Grid
content = content.replace(
  /className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2"/g,
  'className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start"'
);

// 2. Movie details layout
content = content.replace(
  /<div className="w-full flex flex-col space-y-3.5 rounded-3xl bg-\[#07080c\]\/90 border border-cyan-500\/10 p-4 md:p-6 relative shadow-2xl text-left bg-gradient-to-b from-\[#090b11\] to-\[#040508\] h-full overflow-hidden">[\s\S]*?<\/div>\s*<\/div>\s*\) : \(/,
  `<div className="w-full max-w-4xl flex flex-col rounded-[32px] bg-[#07080c]/98 border border-cyan-500/20 p-5 md:p-8 relative shadow-[0_0_50px_rgba(0,180,255,0.15)] text-left bg-gradient-to-b from-[#090b11] to-[#040508] max-h-[90vh] overflow-hidden">
                      {/* Top bar */}
                      <div className="flex justify-between items-center z-10 shrink-0 pb-3">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          SINAL CRIPTOGRAFADO TMDB
                        </span>
                      </div>

                      {/* Content middle */}
                      <div className="flex flex-row gap-6 items-stretch relative flex-1 min-h-0 overflow-hidden text-left mb-4 mt-2">
                        {/* Blur Backdrop Effect */}
                        <div className="absolute -inset-10 bg-[#090b11]/20 opacity-20 pointer-events-none select-none blur-3xl" />

                        {/* Left: Poster (40%) */}
                        <div className="w-[40%] shrink-0 flex items-start justify-center">
                          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] w-full max-w-sm relative group animate-fade-in">
                            <img 
                              src={selectedMovie.posterUrl} 
                              alt={selectedMovie.title} 
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                            {(selectedMovie as any).rating && (
                              <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/95 font-mono text-[10px] text-cyan-400 font-bold border border-cyan-400/30 backdrop-blur-md">
                                ★ {(selectedMovie as any).rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Technical Info (60%) scrollable */}
                        <div className="w-[60%] overflow-y-auto no-scrollbar pr-3 flex flex-col justify-start space-y-4">
                          <div className="space-y-1 pl-1">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide leading-tight">
                              {selectedMovie.title}
                            </h2>
                            <p className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                              {selectedMovie.type === 'serie' ? 'Série Oficial' : 'Filme Oficial'} • {(selectedMovie as any).category || 'Premium H.265'}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400 pl-1">
                            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5 font-black text-white">{selectedMovie.year}</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5">Duração: {selectedMovie.duration || selectedMovie.totalDuration || 'N/A'}</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5">Produtor: {selectedMovie.production || 'N/A'}</span>
                          </div>

                          <div className="space-y-2 pb-4 pl-1">
                            <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest border-b border-white/5 pb-1 mt-2">Sinopse</h3>
                            <p className="text-sm md:text-[13px] leading-relaxed text-zinc-300 font-normal select-text">
                              {selectedMovie.overview || 'Nenhuma sinopse disponível para este título no momento.'}
                            </p>
                            
                            <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest border-b border-white/5 pb-1 mt-6">Elenco Principal</h3>
                            <p className="text-xs font-mono text-zinc-400 leading-normal select-text">
                              {selectedMovie.actors || 'Indisponível.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Controls Panel (Fixed) */}
                      <div className="shrink-0 flex flex-col gap-3 pt-4 border-t border-white/5">
                        {/* Actions Row */}
                        <div className="flex gap-4 h-[52px]">
                          <button
                            onClick={() => {
                              triggerHaptic(35);
                              setMoviePlaying(true);
                              setMovieProgress(0);
                              setTimeout(() => {
                                setMovieIsPlaying(true);
                              }, 100);
                            }}
                            className="flex-[1.5] bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-black font-black font-mono text-xs rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all cursor-pointer"
                          >
                            <Play className="w-5 h-5 fill-black shrink-0" />
                            <span>PLAY STREAMING</span>
                          </button>

                          <button
                            onClick={() => toggleFavoriteMovie(selectedMovie.id)}
                            className={\`flex-1 rounded-2xl font-mono text-[11px] uppercase font-black tracking-wide border transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer \${
                              (selectedMovie as any).isFavorite 
                                ? 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                : 'bg-zinc-900/40 text-zinc-400 border-white/5 hover:text-white'
                            }\`}
                          >
                            <Heart className={\`w-4 h-4 shrink-0 \${(selectedMovie as any).isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}\`} />
                            <span>{(selectedMovie as any).isFavorite ? 'REMOVER' : 'FAVORITAR'}</span>
                          </button>

                          <button
                            onClick={() => likeMovie(selectedMovie.id)}
                            className="flex-1 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] rounded-2xl font-black uppercase tracking-wide border border-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <ThumbsUp className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>CURTIR</span>
                          </button>
                        </div>
                        
                        {/* Close Button Full Width bottom */}
                        <button
                          onClick={() => { triggerHaptic(15); setSelectedMovie(null); }}
                          className="w-full py-3.5 mt-2 rounded-2xl border-2 border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono font-black tracking-widest uppercase cursor-pointer transition-all active:scale-95"
                        >
                          ✕ FECHAR ABA
                        </button>
                      </div>

                    </div>
                  ) : (`
);

// 4. Video Player HUD
content = content.replace(
  /<div className="absolute bottom-6 w-\[95%\] max-w-\[900px\] flex flex-col gap-4 z-50 bg-black\/60 p-4 rounded-3xl border border-white\/5 backdrop-blur-md shadow-2xl">[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>/,
  `{/* Expanded Bottom Control HUD */}
                            <div className="absolute bottom-8 w-[95%] max-w-[900px] flex flex-col gap-0 z-50">
                              
                              {/* Timeline Navigation */}
                              <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl p-3 rounded-t-3xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                                <span className="text-[10px] font-mono font-bold text-cyan-400 w-10 text-right">{formatTime(currentTime)}</span>
                                <div 
                                  onClick={handleMovieTimelineClick}
                                  className="flex-1 h-3 relative flex items-center group/timeline cursor-pointer"
                                >
                                  {/* Background Track */}
                                  <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full" />
                                  {/* Filled Track */}
                                  <div 
                                    className="absolute left-0 h-1 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all"
                                    style={{ width: \`\${movieProgress}%\` }}
                                  />
                                  {/* Scrubber Ball */}
                                  <div 
                                    className="absolute w-4 h-4 bg-white rounded-full transition-transform scale-0 group-hover/timeline:scale-100 shadow-[0_0_15px_white]"
                                    style={{ left: \`calc(\${movieProgress}% - 8px)\` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-zinc-400 w-10">{formatTime(duration)}</span>
                              </div>

                              {/* Option Switches row */}
                              <div className="flex justify-center items-end gap-3 bg-black/70 backdrop-blur-md pt-3 pb-4 px-6 rounded-b-3xl border-b border-x border-white/10 shadow-2xl">
                                
                                {/* Item: Audio Lang */}
                                <div className="relative group/menu flex flex-col items-center">
                                  <div className="absolute bottom-full mb-3 hidden group-hover/menu:flex flex-col bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl origin-bottom animate-in fade-in zoom-in duration-200">
                                    <button onClick={() => setMovieAudioLang('PT-BR')} className={\`px-4 py-2 text-[9px] font-mono font-bold uppercase rounded-lg whitespace-nowrap transition-colors \${movieAudioLang==='PT-BR' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-zinc-300'}\`}>Áudio: PT-BR</button>
                                    <button onClick={() => setMovieAudioLang('EN')} className={\`px-4 py-2 text-[9px] font-mono font-bold uppercase rounded-lg whitespace-nowrap transition-colors \${movieAudioLang==='EN' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-zinc-300'}\`}>Áudio: EN</button>
                                  </div>
                                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 shadow-lg text-zinc-300 transition-colors">
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Item: Subtitles */}
                                <div className="relative group/menu flex flex-col items-center">
                                  <div className="absolute bottom-full mb-3 hidden group-hover/menu:flex flex-col bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl origin-bottom animate-in fade-in zoom-in duration-200">
                                    <button className={\`px-4 py-2 text-[9px] font-mono font-bold uppercase rounded-lg whitespace-nowrap transition-colors bg-cyan-500/20 text-cyan-400\`}>Legenda: OFF</button>
                                    <button className={\`px-4 py-2 text-[9px] font-mono font-bold uppercase rounded-lg whitespace-nowrap transition-colors hover:bg-white/5 text-zinc-300\`}>Legenda: PT-BR</button>
                                  </div>
                                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 shadow-lg text-zinc-300 transition-colors">
                                    <Type className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Item: Playback Speed */}
                                <div className="relative group/menu flex flex-col items-center">
                                  <div className="absolute bottom-full mb-3 hidden group-hover/menu:flex flex-col bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl origin-bottom animate-in fade-in zoom-in duration-200">
                                    {[0.5, 1, 1.5, 2].map((sp) => (
                                      <button 
                                        key={sp}
                                        onClick={() => {
                                          triggerHaptic(10);
                                          setMovieSpeed(sp);
                                          if (movieVideoRef.current) movieVideoRef.current.playbackRate = sp;
                                        }}
                                        className={\`px-4 py-2 text-[9px] font-mono font-bold uppercase rounded-lg whitespace-nowrap transition-colors \${movieSpeed === sp ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-zinc-300'}\`}
                                      >
                                        Velocidade: {sp}x
                                      </button>
                                    ))}
                                  </div>
                                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 shadow-lg text-zinc-300 transition-colors">
                                    <Clock className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Item: Favorites */}
                                <div className="relative group/menu flex flex-col items-center">
                                  <button 
                                    onClick={() => { triggerHaptic(20); toggleFavoriteMovie(selectedMovie.id); }}
                                    className={\`flex items-center justify-center w-10 h-10 rounded-full border shadow-lg transition-colors \${
                                      (selectedMovie as any).isFavorite ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' : 'bg-zinc-800/80 hover:bg-zinc-700 border-white/10 text-zinc-300'
                                    }\`}
                                  >
                                    <Heart className={\`w-4 h-4 \${(selectedMovie as any).isFavorite ? 'fill-rose-400' : ''}\`} />
                                  </button>
                                </div>

                                {/* Item: Share */}
                                <div className="relative group/menu flex flex-col items-center">
                                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 shadow-lg text-cyan-400 transition-colors">
                                    <Users className="w-4 h-4" />
                                  </button>
                                </div>

                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </motion.div>
                )}`
);

// We need to also add motion.div glass-container class update:
content = content.replace(
  /className="w-full flex flex-col space-y-4 font-sans text-left"/,
  'className="fixed inset-0 z-[7000] flex flex-col justify-center items-center p-2 sm:p-5 md:p-8 bg-black/90 font-sans glass-container"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
