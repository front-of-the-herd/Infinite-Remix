'use client';

import { useState, useEffect } from 'react';

const TRACKS = [
  "Move Your Body by Marshall Jefferson",
  "Your Love by Frankie Knuckles & Jamie Principle",
  "Can You Feel It by Mr. Fingers",
  "Strings of Life by Rhythim Is Rhythim",
  "French Kiss by Lil Louis",
  "Good Life by Inner City",
  "Big Fun by Inner City",
  "Promised Land by Joe Smooth",
  "Show Me Love by Robin S.",
  "Gypsy Woman (She’s Homeless) by Crystal Waters",
  "Finally by CeCe Peniston",
  "Dreamer by Livin’ Joy",
  "Push the Feeling On by Nightcrawlers",
  "Lady (Hear Me Tonight) by Modjo",
  "One More Time by Daft Punk",
  "Music Sounds Better With You by Stardust",
  "Around the World by Daft Punk",
  "Insomnia by Faithless",
  "At Night by Shakedown",
  "Call on Me by Eric Prydz",
  "Pjanoo by Eric Prydz",
  "Titanium by David Guetta ft. Sia",
  "When Love Takes Over by David Guetta ft. Kelly Rowland",
  "I Remember by Deadmau5 & Kaskade",
  "Strobe by Deadmau5",
  "Levels by Avicii",
  "Fade Into Darkness by Avicii",
  "Wake Me Up by Avicii",
  "Don’t You Worry Child by Swedish House Mafia",
  "Greyhound by Swedish House Mafia",
  "Reload by Sebastian Ingrosso & Tommy Trash",
  "Sun Is Shining by Axwell /\\ Ingrosso",
  "More Than You Know by Axwell /\\ Ingrosso",
  "Cola by CamelPhat & Elderbrook",
  "Breathe by CamelPhat & Cristoph",
  "Losing It by Fisher",
  "You Little Beauty by Fisher",
  "Turn Me On by Riton & Oliver Heldens",
  "Gecko (Overdrive) by Oliver Heldens",
  "Koala by Oliver Heldens",
  "Intoxicated by Martin Solveig & GTA",
  "Places by Martin Solveig ft. Ina Wroldsen",
  "Head & Heart by Joel Corry ft. MNEK",
  "Sorry by Joel Corry",
  "Breaking Me by Topic & A7S",
  "Piece of Your Heart by Meduza ft. Goodboys",
  "Paradise by Meduza ft. Dermot Kennedy",
  "Turn Back Time by Diplo & Sonny Fodera",
  "Looking for Me by Paul Woolford & Diplo",
  "Feel So Close by Calvin Harris",
  "I’m Not Alone by Calvin Harris",
  "Summer by Calvin Harris",
  "Slide by Calvin Harris ft. Frank Ocean & Migos",
  "Ocean Drive by Duke Dumont",
  "Need U (100%) by Duke Dumont ft. AME",
  "Red Light Green Light by Duke Dumont",
  "House Work by Jax Jones",
  "You Don’t Know Me by Jax Jones ft. Raye",
  "Instruction by Jax Jones ft. Demi Lovato",
  "Firestone by Kygo ft. Conrad Sewell",
  "Stole the Show by Kygo ft. Parson James",
  "Higher Love by Kygo & Whitney Houston",
  "Lean On by Major Lazer & DJ Snake",
  "Turn Down for What by DJ Snake & Lil Jon",
  "Let Me Love You by DJ Snake ft. Justin Bieber",
  "The Business by Tiësto",
  "Jackie Chan by Tiësto & Dzeko",
  "Adagio for Strings by Tiësto",
  "Opus by Eric Prydz",
  "Generate by Eric Prydz",
  "Midnight City (Eric Prydz Remix) by M83",
  "Sweet Disposition (Axwell Remix) by The Temper Trap",
  "Latch by Disclosure ft. Sam Smith",
  "White Noise by Disclosure ft. AlunaGeorge",
  "You & Me (Flume Remix) by Disclosure",
  "F for You by Disclosure",
  "Ocean Eyes (Astronomyy Remix) by Billie Eilish",
  "Innerbloom by RÜFÜS DU SOL",
  "Treat You Better (Kygo Remix) by Shawn Mendes",
  "Say My Name by ODESZA",
  "Sunset Lover by Petit Biscuit",
  "You Were Right by RÜFÜS DU SOL",
  "Electric Feel (Justice Remix) by MGMT",
  "Safe and Sound by Justice",
  "D.A.N.C.E. by Justice",
  "We Found Love by Rihanna & Calvin Harris",
  "Rather Be by Clean Bandit",
  "Symphony by Clean Bandit ft. Zara Larsson",
  "Rockabye by Clean Bandit ft. Sean Paul",
  "Solo by Clean Bandit ft. Demi Lovato",
  "Wake Me Up Before You Go-Go (Remix) by Various Artists",
  "On My Mind by Diplo & SIDEPIECE",
  "Do It To It by ACRAZE",
  "Ferrari by James Hype & Miggy Dela Rosa",
  "Where You Are by John Summit & Hayla",
  "Human by John Summit",
  "Escape by Kx5 (Deadmau5 & Kaskade)",
  "Go Back by John Summit & Sub Focus",
  "Drifting by Tiësto",
  "Miracle by Calvin Harris & Ellie Goulding"
];

interface AnimatedTitleProps {
  onComplete: (finalSong: string) => void;
}

export default function AnimatedTitle({ onComplete }: AnimatedTitleProps) {
  const [currentText, setCurrentText] = useState('a song');
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;

    // Total duration of animation in ms
    const DURATION = 3500;
    // Base speed
    const BASE_INTERVAL = 60;
    
    let startTime = Date.now();
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const TARGET_SONG = "Fascinated by Company B";
    
    // We want the switching to start fast, and slow down slightly at the end
    const tick = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= DURATION) {
        // Animation finished, lock in the target
        setCurrentText(TARGET_SONG);
        setFinished(true);
        onComplete(TARGET_SONG);
        return;
      }
      
      // Update the text to a random song
      const randomSong = TRACKS[Math.floor(Math.random() * TRACKS.length)];
      setCurrentText(randomSong);
      
      // Calculate next tick (easing out for cinematic effect)
      const progress = elapsed / DURATION;
      const currentInterval = BASE_INTERVAL + (progress * progress * progress * 350); 
      
      timeoutId = setTimeout(tick, currentInterval);
    };

    // Delay start slightly to let the page visually settle
    const initialDelay = setTimeout(() => {
      startTime = Date.now();
      tick();
    }, 600);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutId);
    };
  }, [finished, onComplete]);

  return (
    <span 
      className={`text-orange-500 italic transition-all duration-300 ${!finished ? 'blur-[1px] opacity-90' : 'blur-0 opacity-100'}`}
    >
      {currentText}
    </span>
  );
}
