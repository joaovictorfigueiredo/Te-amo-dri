import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Heart, 
  Lock, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trophy, 
  KeyRound, 
  ChevronRight, 
  ExternalLink,
  Crown,
  HeartCrack
} from "lucide-react";

interface AppSettings {
  husbandName: string;
  wifeName: string;
  secretPassword: string;
  passwordTip: string;
  whatsappNumber: string;
  quizQuestion: string;
  quizOptionA: string;
  quizOptionB: string;
  romanticLetter: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  husbandName: "João",
  wifeName: "Andrieli",
  secretPassword: "2019",
  passwordTip: "O ano em que nos conhecemos (4 dígitos)",
  whatsappNumber: "5511999999999",
  quizQuestion: "Quem é mais provável de pegar no sono nos primeiros 15 minutos de um filme debaixo das cobertas?",
  quizOptionA: "Eu, com certeza absoluta! 🙋‍♀️",
  quizOptionB: "Você, antes mesmo de acabarem os trailers! 🍿",
  romanticLetter: "Amor, criar esse site foi a forma que encontrei de colocar um pouquinho do nosso mundo em linhas de código. Você alimenta minha felicidade todos os dias, e esse bichinho virtual é o símbolo do cuidado que temos um pelo outro... Feliz Dia dos Namorados! ❤️"
};

interface Particle {
  id: number;
  left: number;
  bottom: number;
  speed: number;
  scale: number;
  opacity: number;
  delay: number;
  emoji: string;
}

interface MiniParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function App() {
  const [currentAct, setCurrentAct] = useState<1 | 2 | 3>(1);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("romance_app_settings");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.wifeName === "Princesa" || parsed.husbandName === "Seu Amor") {
          return DEFAULT_SETTINGS;
        }
        if (parsed.secretPassword === "2022") {
          parsed.secretPassword = "2019";
          parsed.passwordTip = "O ano em que nos conhecemos (4 dígitos)";
          localStorage.setItem("romance_app_settings", JSON.stringify(parsed));
        }
        return parsed; 
      } catch (e) { 
        return DEFAULT_SETTINGS; 
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [portalError, setPortalError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const [quizErrorModal, setQuizErrorModal] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  // Estados do Ato 3
  const [petEmoji, setPetEmoji] = useState(() => {
    const saved = localStorage.getItem("romance_pet_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.emoji || "🦊";
      } catch (e) {}
    }
    return "🦊";
  });

  const [petFullness, setPetFullness] = useState(() => {
    const saved = localStorage.getItem("romance_pet_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedFullness = typeof parsed.fullness === 'number' ? parsed.fullness : 60;
        const lastUpdated = typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : Date.now();
        const hoursPassed = (Date.now() - lastUpdated) / (1000 * 60 * 60);
        if (hoursPassed > 0) {
          // Drops 2.5% per hour (60% per day)
          return Math.max(0, Math.round(savedFullness - hoursPassed * 2.5));
        }
        return Math.round(savedFullness);
      } catch (e) {}
    }
    return 60;
  });

  const [petLove, setPetLove] = useState(() => {
    const saved = localStorage.getItem("romance_pet_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedLove = typeof parsed.love === 'number' ? parsed.love : 60;
        const lastUpdated = typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : Date.now();
        const hoursPassed = (Date.now() - lastUpdated) / (1000 * 60 * 60);
        if (hoursPassed > 0) {
          // Drops 2.0% per hour (48% per day)
          return Math.max(0, Math.round(savedLove - hoursPassed * 2.0));
        }
        return Math.round(savedLove);
      } catch (e) {}
    }
    return 60;
  });

  const [petActionReaction, setPetActionReaction] = useState("");
  const [miniParticles, setMiniParticles] = useState<MiniParticle[]>([]);
  const [revealedLetter, setRevealedLetter] = useState("");
  const [letterIndex, setLetterIndex] = useState(0);
  const [isPlayingLetterSynth, setIsPlayingLetterSynth] = useState(false);

  // Controle do painel de administração (marido)
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminHusbandName, setAdminHusbandName] = useState(settings.husbandName);
  const [adminWifeName, setAdminWifeName] = useState(settings.wifeName);
  const [adminPassword, setAdminPassword] = useState(settings.secretPassword);
  const [adminTip, setAdminTip] = useState(settings.passwordTip);
  const [adminWhatsapp, setAdminWhatsapp] = useState(settings.whatsappNumber);
  const [adminQuestion, setAdminQuestion] = useState(settings.quizQuestion);
  const [adminOptionA, setAdminOptionA] = useState(settings.quizOptionA);
  const [adminOptionB, setAdminOptionB] = useState(settings.quizOptionB);
  const [adminLetter, setAdminLetter] = useState(settings.romanticLetter);

  const [stars, setStars] = useState<Particle[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const emojis = ["❤️", "💖", "✨", "🌸", "💕", "🤍"];
    const generatedStars = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95,
      bottom: Math.random() * 100,
      speed: 8 + Math.random() * 10,
      scale: 0.5 + Math.random() * 0.8,
      opacity: 0.2 + Math.random() * 0.6,
      delay: Math.random() * -15,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    setStars(generatedStars);
  }, []);

  useEffect(() => {
    if (currentAct === 3) {
      setRevealedLetter("");
      setLetterIndex(0);
    }
  }, [currentAct, settings.romanticLetter]);

  useEffect(() => {
    if (currentAct === 3 && letterIndex < settings.romanticLetter.length) {
      const timer = setTimeout(() => {
        setRevealedLetter((prev) => prev + settings.romanticLetter[letterIndex]);
        setLetterIndex((prev) => prev + 1);
        if (soundEnabled && letterIndex % 3 === 0) {
          playQuietTypewriter();
        }
      }, 45);
      return () => clearTimeout(timer);
    }
  }, [currentAct, letterIndex, settings.romanticLetter, soundEnabled]);

  const playSynthesizer = (type: "click" | "success" | "error" | "feed" | "love" | "musicbox" | "pop") => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const playTone = (freq: number, oscType: OscillatorType, dur: number, startDelay: number = 0, volume: number = 0.08) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
        gain.gain.setValueAtTime(volume, ctx.currentTime + startDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startDelay);
        osc.stop(ctx.currentTime + startDelay + dur);
      };

      if (type === "click") {
        playTone(392.00, "triangle", 0.12, 0, 0.05);
      } else if (type === "pop") {
        playTone(587.33, "sine", 0.08, 0, 0.04);
      } else if (type === "error") {
        playTone(220, "sawtooth", 0.25, 0, 0.08);
        playTone(175, "sawtooth", 0.25, 0.07, 0.08);
      } else if (type === "feed") {
        playTone(523.25, "sine", 0.15, 0, 0.06);
        playTone(659.25, "sine", 0.15, 0.05, 0.06);
        playTone(783.99, "sine", 0.2, 0.1, 0.05);
      } else if (type === "love") {
        playTone(587.33, "sine", 0.12, 0, 0.05);
        playTone(783.99, "sine", 0.12, 0.04, 0.05);
        playTone(987.77, "sine", 0.12, 0.08, 0.05);
        playTone(1174.66, "sine", 0.25, 0.12, 0.04);
      } else if (type === "success") {
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        notes.forEach((freq, idx) => {
          playTone(freq, "triangle", 0.2, idx * 0.06, 0.05);
        });
      } else if (type === "musicbox") {
        const melody = [
          { f: 523.25, d: 0.4, t: 0 },
          { f: 659.25, d: 0.4, t: 0.3 },
          { f: 783.99, d: 0.4, t: 0.6 },
          { f: 987.77, d: 0.4, t: 0.9 },
          { f: 1046.50, d: 0.5, t: 1.2 },
          { f: 880.00, d: 0.4, t: 1.5 },
          { f: 783.99, d: 0.5, t: 1.8 },
          { f: 659.25, d: 0.4, t: 2.1 },
          { f: 587.33, d: 0.4, t: 2.4 },
          { f: 698.46, d: 0.4, t: 2.7 },
          { f: 783.99, d: 0.5, t: 3.0 },
          { f: 1046.50, d: 0.6, t: 3.3 },
        ];
        melody.forEach((note) => {
          playTone(note.f, "sine", note.d, note.t, 0.05);
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const playQuietTypewriter = () => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(350 + Math.random() * 150, ctx.currentTime);
      gain.gain.setValueAtTime(0.005, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch (e) {}
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === settings.secretPassword) {
      playSynthesizer("success");
      setPortalError(null);
      setFlashActive(true);
      setTimeout(() => {
        setFlashActive(false);
        setCurrentAct(2);
      }, 700);
    } else {
      playSynthesizer("error");
      setIsShaking(true);
      setPortalError("Senha incorreta! Pense bem, o amor da sua vida está esperando... 🤔");
      setTimeout(() => setIsShaking(false), 440);
    }
  };

  const handleQuizAnswer = (option: "A" | "B") => {
    if (option === "B") {
      playSynthesizer("success");
      setQuizSuccess(true);
      setTimeout(() => {
        setQuizSuccess(false);
        setFlashActive(true);
        setTimeout(() => {
          setFlashActive(false);
          setCurrentAct(3);
        }, 600);
      }, 1500);
    } else {
      playSynthesizer("error");
      setQuizErrorModal(true);
    }
  };

  const saveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: AppSettings = {
      husbandName: adminHusbandName,
      wifeName: adminWifeName,
      secretPassword: adminPassword,
      passwordTip: adminTip,
      whatsappNumber: adminWhatsapp,
      quizQuestion: adminQuestion,
      quizOptionA: adminOptionA,
      quizOptionB: adminOptionB,
      romanticLetter: adminLetter
    };
    setSettings(newSettings);
    localStorage.setItem("romance_app_settings", JSON.stringify(newSettings));
    setShowAdmin(false);
    playSynthesizer("success");
    setCurrentAct(1);
    setPasswordInput("");
    setPortalError(null);
  };

  // Salva o estado do pet no localStorage sempre que ele for atualizado
  useEffect(() => {
    const stateToSave = {
      emoji: petEmoji,
      fullness: petFullness,
      love: petLove,
      lastUpdated: Date.now()
    };
    localStorage.setItem("romance_pet_state", JSON.stringify(stateToSave));
  }, [petEmoji, petFullness, petLove]);

  // Redução contínua leve das barras se eles ficarem com a página aberta
  useEffect(() => {
    if (currentAct !== 3) return;
    const interval = setInterval(() => {
      setPetFullness((prev) => Math.max(0, Math.round(prev - 1)));
      setPetLove((prev) => Math.max(0, Math.round(prev - 1)));
    }, 25000);
    return () => clearInterval(interval);
  }, [currentAct]);

  const resetEverything = () => {
    setCurrentAct(1);
    setPasswordInput("");
    setPortalError(null);
    setPetFullness(60);
    setPetLove(60);
    setPetActionReaction("");
    setMiniParticles([]);
    playSynthesizer("click");
  };

  const spawnParticles = (emoji: string) => {
    const freshParticles = Array.from({ length: 6 }).map((_, idx) => ({
      id: Math.random() + idx,
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 60,
      emoji: emoji
    }));
    setMiniParticles((prev) => [...prev, ...freshParticles]);
    setTimeout(() => {
      setMiniParticles((prev) => prev.filter((p) => !freshParticles.find((fp) => fp.id === p.id)));
    }, 1000);
  };

  const feedPet = () => {
    playSynthesizer("feed");
    const wasDead = petFullness <= 0 && petLove <= 0;
    setPetFullness((prev) => Math.min(prev + 15, 100));
    if (wasDead) {
      setPetActionReaction("Ressuscitou! Comidinha salvou o pet! 🍓✨");
    } else {
      setPetActionReaction("Nhac! Delícia! 🍓 (+15 Fome)");
    }
    spawnParticles("🍓");
    setTimeout(() => setPetActionReaction(""), 3000);
  };

  const petTheAnimal = () => {
    playSynthesizer("love");
    const wasDead = petFullness <= 0 && petLove <= 0;
    setPetLove((prev) => Math.min(prev + 15, 100));
    if (wasDead) {
      setPetActionReaction("Ressuscitou! Seu amor o salvou! ❤️✨");
    } else {
      setPetActionReaction("Prrr... Eu te amo! 🥰 (+15 Carinho)");
    }
    spawnParticles("❤️");
    setTimeout(() => setPetActionReaction(""), 3000);
  };

  const getPetStatusText = () => {
    if (petFullness <= 0 && petLove <= 0) return "💀 Desmaiou de Fome!";
    if (petFullness < 20 || petLove < 20) return "⚠️ Precisa de Atenção!";
    const total = petFullness + petLove;
    if (total >= 190) return "👑 Pet Supremo!";
    if (total >= 140) return "🔥 Super Alegre!";
    if (total >= 90) return "😊 Muito Feliz!";
    return "😴 Meio Cansado";
  };

  const getDisplayedEmoji = () => {
    if (petFullness <= 0 && petLove <= 0) return "💀";
    if (petFullness < 20) return "🥺";
    return petEmoji;
  };

  const getWhatsappLink = (couponText: string) => {
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(couponText)}`;
  };

  const playMusicBox = () => {
    setIsPlayingLetterSynth(true);
    playSynthesizer("musicbox");
    setTimeout(() => setIsPlayingLetterSynth(false), 4500);
  };

  return (
    <div id="valentines-app" className="relative w-full min-h-screen bg-slate-950 font-sans text-stone-100 overflow-x-hidden flex flex-col justify-between selection:bg-pink-600 selection:text-white">
      
      {/* Luzes Atmosféricas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-950/40 opacity-70 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-950/40 opacity-70 blur-[100px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute text-xl pointer-events-none select-none animate-heart-rise"
            style={{
              left: `${star.left}%`,
              bottom: `-10%`,
              animationDuration: `${star.speed}s`,
              animationDelay: `${star.delay}s`,
              fontSize: `${star.scale * 1.4}rem`,
              opacity: star.opacity,
            }}
          >
            {star.emoji}
          </div>
        ))}
      </div>

      {/* Top Banner */}
      <header className="relative z-35 flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
          <span className="font-serif italic font-semibold text-base bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-300">
            Nosso Universo
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button 
            id="sound-toggle-btn"
            onClick={() => { setSoundEnabled(!soundEnabled); playSynthesizer("pop"); }}
            title={soundEnabled ? "Mutar áudio" : "Ativar áudio"}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-stone-300"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {currentAct > 1 && (
            <button
              id="reset-state-btn"
              onClick={resetEverything}
              title="Voltar ao início"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-stone-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            id="admin-settings-btn"
            onClick={() => { setShowAdmin(!showAdmin); playSynthesizer("click"); }}
            title="Ajustes do Marido"
            className="p-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/10 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Screen flash effect */}
      {flashActive && (
        <div className="fixed inset-0 z-50 bg-pink-50/90 pointer-events-none transition-all duration-500 ease-out" />
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        
        {/* ATO 1: O PORTAL */}
        {currentAct === 1 && (
          <div className="w-full max-w-sm my-6 animate-fade-in">
            <div 
              id="portal-glass-card"
              className={`backdrop-blur-xl bg-slate-900/60 border border-pink-500/15 rounded-3xl p-7 shadow-2xl relative overflow-hidden transition-all duration-300 ${
                isShaking ? "animate-shake-error border-red-500" : ""
              }`}
            >
              <div className="absolute top-[-10%] right-[-10%] w-20 h-20 rounded-full bg-pink-500/15 blur-xl pointer-events-none" />
              
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-3 animate-float-gentle text-pink-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="font-serif text-2xl font-normal text-white">
                  🌌 Portal do Nosso Universo
                </h1>
                <p className="text-xs text-stone-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  Oi, <span className="text-pink-300 font-medium">{settings.wifeName}</span>. Entre com a chave mágica do nosso coração para iniciar esta jornada.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label htmlFor="portal-password" className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 text-center">
                    Senha Secreta
                  </label>
                  <input
                    id="portal-password"
                    type="password"
                    placeholder="••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-center py-3 bg-slate-950 border border-white/5 rounded-2xl focus:border-pink-500/40 focus:outline-none text-white font-mono text-xl transition-all"
                  />
                  <p className="text-[11px] text-pink-300/80 mt-2 text-center italic">
                    💡 Dica: {settings.passwordTip}
                  </p>
                </div>

                {portalError && (
                  <div className="bg-red-550/10 border border-red-500/20 p-2.5 rounded-xl text-center text-xs text-red-200">
                    {portalError}
                  </div>
                )}

                <button
                  type="submit"
                  id="unlock-portal-btn"
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium py-3 px-6 rounded-2xl shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <span>Ativar Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ATO 2: O QUIZ DOS MOMENTOS */}
        {currentAct === 2 && (
          <div className="w-full max-w-lg my-6 animate-fade-in">
            <div className="backdrop-blur-xl bg-slate-900/60 border border-pink-500/15 rounded-3xl p-7 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-pink-400">
                  Etapa 2: Afinidade
                </span>
                <span className="text-[10px] bg-pink-500/10 p-1 px-2.5 rounded-full text-pink-300">
                  Ato II de III
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-pink-500/10 border border-pink-500/10 text-pink-400 mb-3 animate-float-gentle">
                  <Heart className="w-6 h-6 fill-pink-500/20" />
                </div>
                <h2 className="font-serif text-xl font-normal text-white">
                  🏹 Teste de Afinidade do Casal
                </h2>
                <div className="w-10 h-[1px] bg-gradient-to-r from-pink-500 to-purple-500 mx-auto my-3" />
                <p className="text-stone-200 text-base italic leading-relaxed max-w-sm mx-auto">
                  "{settings.quizQuestion}"
                </p>
              </div>

              <div className="space-y-3.5 max-w-sm mx-auto">
                <button
                  id="quiz-option-a-btn"
                  onClick={() => handleQuizAnswer("A")}
                  className="w-full text-left p-4 rounded-xl bg-slate-950/50 border border-white/5 hover:border-pink-500/20 hover:bg-slate-950 transition-all flex items-start space-x-3 text-stone-300 group"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-stone-800 text-xs font-semibold group-hover:bg-pink-900/40 transition-colors">
                    A
                  </span>
                  <span className="text-xs pt-0.5">{settings.quizOptionA}</span>
                </button>

                <button
                  id="quiz-option-b-btn"
                  onClick={() => handleQuizAnswer("B")}
                  className="w-full text-left p-4 rounded-xl bg-slate-950/50 border border-white/5 hover:border-pink-500/30 hover:bg-slate-950 transition-all flex items-start space-x-3 text-stone-300 group"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-stone-800 text-xs font-semibold group-hover:bg-pink-500/40 transition-colors">
                    B
                  </span>
                  <span className="text-xs pt-0.5">{settings.quizOptionB}</span>
                </button>
              </div>

              {quizSuccess && (
                <div className="absolute inset-0 bg-slate-950 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                  <div className="w-12 h-12 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 mb-3 animate-bounce">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-normal text-white mb-2">
                    Resposta Correta! 🎉
                  </h3>
                  <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                    Você o conhece perfeitamente! Revelando o presente especial agora...
                  </p>
                </div>
              )}

              {quizErrorModal && (
                <div className="absolute inset-0 bg-slate-950 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-30 border border-red-500/20">
                  <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center text-red-400 mb-3 animate-float-gentle">
                    <HeartCrack className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-normal text-white">
                    Errou feio, errou rude! 😜
                  </h3>
                  <p className="text-xs text-stone-300 mt-2 mb-4">
                    Não vale colar! Tenta outra vez, {settings.wifeName}...
                  </p>
                  <button
                    id="retry-quiz-btn"
                    onClick={() => { setQuizErrorModal(false); playSynthesizer("click"); }}
                    className="p-2 px-5 bg-pink-600/25 border border-pink-500/30 text-pink-300 hover:text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                  >
                    Tentar de novo 💖
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ATO 3: O GRANDE FINAL */}
        {currentAct === 3 && (
          <div className="w-full max-w-4xl my-6 animate-fade-in flex flex-col space-y-6">
            
            <div className="text-center">
              <span className="p-1 px-3 text-[10px] uppercase bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-full font-semibold">
                💝 Presente Revelado!
              </span>
              <h1 className="font-serif text-2xl md:text-4xl mt-2.5 mb-1 text-white">
                Feliz Dia dos Namorados, {settings.wifeName}! ❤️
              </h1>
              <p className="text-xs text-pink-300">
                Seja bem-vinda ao nosso cantinho místico e feliz!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* VIRTUAL PET */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="backdrop-blur-xl bg-slate-900/60 border border-pink-500/15 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-semibold uppercase text-stone-300">
                        Pet Cupido
                      </span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-pink-500/20 rounded-full text-pink-300">
                      {getPetStatusText()}
                    </span>
                  </div>

                  {/* Pet Selector */}
                  <div className="flex items-center justify-center space-x-1.5 mb-3 bg-slate-950/40 p-1.5 rounded-lg">
                    {["🦊", "🐱", "🐶", "🐼", "🦄"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => { setPetEmoji(emoji); playSynthesizer("pop"); }}
                        className={`text-lg p-1 rounded-md transition-all ${
                          petEmoji === emoji ? "bg-pink-500/25 border border-pink-500/30 scale-105" : "hover:bg-white/5"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Pet Canvas */}
                  <div className="relative py-6 bg-slate-950/40 rounded-xl border border-white/5 h-36 flex items-center justify-center">
                    {/* Mini Click Particles */}
                    {miniParticles.map((part) => (
                      <div
                        key={part.id}
                        className="absolute text-xl pointer-events-none"
                        style={{
                          transform: `translate(${part.x}px, ${part.y}px)`,
                          animation: "heartUp 1s ease-out forwards",
                        }}
                      >
                        {part.emoji}
                      </div>
                    ))}

                    <div className="flex flex-col items-center">
                      <div 
                        className="text-6xl select-none animate-bounce mb-1 cursor-pointer"
                        onClick={petTheAnimal}
                      >
                        {getDisplayedEmoji()}
                      </div>
                      <div className="w-12 h-1 bg-pink-900/20 rounded-full blur-xs" />
                    </div>

                    {petActionReaction && (
                      <div className="absolute top-2.5 bg-pink-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded-xl shadow-md border border-pink-500/25">
                        {petActionReaction}
                      </div>
                    )}
                  </div>

                  {/* Pet Meters */}
                  <div className="space-y-2.5 my-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5 text-stone-300">
                        <span>🍓 Alimentação</span>
                        <span>{petFullness}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-rose-400" style={{ width: `${petFullness}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5 text-stone-300">
                        <span>💖 Carinho</span>
                        <span>{petLove}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-purple-500" style={{ width: `${petLove}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="feed-pet-btn"
                      onClick={feedPet}
                      className="p-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-[11px] font-semibold border border-pink-500/10 cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1"
                    >
                      <span>Alimentar</span>
                      <span>🍓</span>
                    </button>
                    <button
                      id="pet-affection-btn"
                      onClick={petTheAnimal}
                      className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-semibold border border-purple-500/10 cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1"
                    >
                      <span>Dar Carinho</span>
                      <span>✨</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-white/5 p-3 rounded-xl flex items-center justify-between text-[10px]">
                  <span className="text-stone-400">Total acumulado:</span>
                  <span className="text-pink-300 font-semibold">{petFullness + petLove} carinho-pontos!</span>
                </div>
              </div>

              {/* CARD DE CARTA & CUPONS */}
              <div className="lg:col-span-7 flex flex-col space-y-5">
                
                {/* Carta */}
                <div className="backdrop-blur-xl bg-slate-900/60 border border-pink-500/15 rounded-3xl p-6 relative">
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-serif italic text-lg text-pink-300 flex items-center leading-none">
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse mr-1.5" />
                      Minha Carta fofa
                    </h3>
                    <button
                      id="musicbox-melody-btn"
                      onClick={playMusicBox}
                      disabled={isPlayingLetterSynth}
                      className={`p-1.5 px-3 rounded-lg text-[10px] flex items-center space-x-1 transition-all ${
                        isPlayingLetterSynth 
                          ? "bg-amber-500/20 text-amber-300 animate-pulse" 
                          : "bg-white/5 hover:bg-white/10 text-stone-300"
                      }`}
                    >
                      <span>🎵 Caixinha</span>
                    </button>
                  </div>

                  <div className="font-serif text-stone-200 text-sm leading-relaxed p-4 bg-slate-950/40 rounded-xl border border-white/5 italic min-h-[100px] overflow-y-auto max-h-48">
                    {revealedLetter}
                    {letterIndex < settings.romanticLetter.length && (
                      <span className="inline-block w-2 h-3 bg-pink-500 ml-0.5 animate-pulse" />
                    )}
                  </div>

                  {letterIndex >= settings.romanticLetter.length && (
                    <div className="text-right mt-2">
                      <button
                        id="replay-typewriter-btn"
                        onClick={() => { setLetterIndex(0); setRevealedLetter(""); playSynthesizer("click"); }}
                        className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center space-x-1 ml-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reler</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Cupons */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center space-x-1 pl-1">
                    <Crown className="w-3 h-3" />
                    <span>Seus Cupons Especiais</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Cupom 1: Sushi */}
                    <div className="bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/15 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xl">🍣</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-305 rounded-md uppercase font-bold tracking-wider">Premium</span>
                        </div>
                        <h4 className="font-serif text-sm font-medium text-amber-200 mt-1">Vale Rodízio Japonês</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                          Um jantar maravilhoso com suas peças favoritas de sushi, temaki e sashimis fresquinhos. Pago inteiramente pelo João!
                        </p>
                      </div>

                      <a
                        href={getWhatsappLink("João! Resgatei meu Vale Jantar Japonês 🍣! Me leva hoje à noite para comer sushi bem gostoso? ❤️")}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSynthesizer("success")}
                        className="mt-3 w-full p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg text-center flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Resgatar Cupom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Cupom 2: Massagem */}
                    <div className="bg-gradient-to-br from-slate-900 to-rose-950/20 border border-rose-500/15 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xl">💆‍♀️</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-md uppercase font-bold tracking-wider">Dengo</span>
                        </div>
                        <h4 className="font-serif text-sm font-medium text-rose-250 mt-1">Vale Massagem & Cafuné</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                          Dá direito a uma massagem super relaxante nas costas e pés, acompanhada de muito cafuné carinhoso.
                        </p>
                      </div>

                      <a
                        href={getWhatsappLink("Amor! Quero cobrar o meu Vale Massagem e Cafuné bem dengozo agora! 💆‍♀️🛌❤️")}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSynthesizer("success")}
                        className="mt-3 w-full p-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg text-center flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Resgatar Cupom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Cupom 3: Cinema com Pipoca & Chamego */}
                    <div className="bg-gradient-to-br from-slate-900 to-orange-950/20 border border-orange-500/15 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xl">🍿</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-md uppercase font-bold tracking-wider">Lazer</span>
                        </div>
                        <h4 className="font-serif text-sm font-medium text-orange-200 mt-1">Vale Cinema & Chamego</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                          Você escolhe o filme nos mínimos detalhes e ganha a pipoca gigante com chocolate. João promete não fechar o olho!
                        </p>
                      </div>

                      <a
                        href={getWhatsappLink("João! Resgatei meu Vale Cinema e Chamego 🍿🎬! Prepada para deitarmos grudadinhos e assistir um filminho fofo? Amo você! ❤️")}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSynthesizer("success")}
                        className="mt-3 w-full p-2 bg-orange-500 hover:bg-orange-400 text-slate-950 text-[11px] font-bold rounded-lg text-center flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Resgatar Cupom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Cupom 4: Café na Cama Luxuoso */}
                    <div className="bg-gradient-to-br from-slate-900 to-amber-900/10 border border-amber-600/15 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xl">🥞</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-md uppercase font-bold tracking-wider">Surpresa</span>
                        </div>
                        <h4 className="font-serif text-sm font-medium text-amber-100 mt-1">Vale Café na Cama Luxo</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                          Café quentinho, panquecas (ou pãozinho na chapa), frutas cortadas e suco servidos direto na sua cama com amor.
                        </p>
                      </div>

                      <a
                        href={getWhatsappLink("Amor da minha vida! Acabei de resgatar o Vale Café na Cama especial ☕🥞! Pode acordar amanhã sabendo que o café está por sua conta! Beijos! 😘❤️")}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSynthesizer("success")}
                        className="mt-3 w-full p-2 bg-amber-600 hover:bg-amber-505 text-white text-[11px] font-bold rounded-lg text-center flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Resgatar Cupom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Cupom 5: Pizza & Vinho de Sexta */}
                    <div className="bg-gradient-to-br from-slate-900 to-purple-950/20 border border-purple-500/15 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xl">🍕</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-md uppercase font-bold tracking-wider">Noite Dupla</span>
                        </div>
                        <h4 className="font-serif text-sm font-medium text-purple-200 mt-1">Vale Pizza & Vinho de Sexta</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                          Escolha seus dois sabores preferidos de pizza e acompanhe com aquele vinho gostoso que você tanto ama tomar.
                        </p>
                      </div>

                      <a
                        href={getWhatsappLink("Meu bem! Acabei de resgatar meu Vale Pizza e Vinho de Sexta-feira 🍕🍷! Garanta a nossa noitinha de paz e muito queijo! ❤️")}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSynthesizer("success")}
                        className="mt-3 w-full p-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg text-center flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Resgatar Cupom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Cupom 6: Perdão Absoluto de DR */}
                    <div className="bg-gradient-to-br from-slate-900 to-teal-950/20 border border-teal-500/15 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xl">🕊️</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-md uppercase font-bold tracking-wider">Coringa</span>
                        </div>
                        <h4 className="font-serif text-sm font-medium text-teal-200 mt-1">Vale Paz Absoluta (Anti-DR)</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                          Use em discussões bobas por ciúmes de séries ou bobagens. O João se rende na hora e dá dengo!
                        </p>
                      </div>

                      <a
                        href={getWhatsappLink("João! Estou usando meu Vale Paz e Perdão Absoluto 🕊️💬 para encerrar essa bobeira imediatamente e exigir abraço apertado! Te amo! ❤️")}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSynthesizer("success")}
                        className="mt-3 w-full p-2 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-lg text-center flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Resgatar Cupom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Locked Coupon 1 */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4.5">
                      <div className="text-stone-500 flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">🔒 Cupom Secreto Especial</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                        Desbloqueia automaticamente na próxima semana se o bichinho continuar alimentado e com carinho em dia!
                      </p>
                    </div>

                    {/* Locked Coupon 2 */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4.5">
                      <div className="text-stone-500 flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">🔒 Próxima Surpresa de Inverno</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                        Desbloqueia em breve. Um chocolate quente e fondue especial entregues direto para aquecer nossa noite.
                      </p>
                    </div>

                    {/* Locked Coupon 3 */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4.5 sm:col-span-2">
                      <div className="text-stone-500 flex items-center space-x-1 justify-center">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">🔒 Suprema Noite Estelar Especial</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 leading-relaxed text-center">
                        Bloqueado magneticamente. Requer 200 pontos acumulados com o Pet Cupido do casal para liberar o resgate!
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* PAINEL DE CONTROLE DO MARIDO (DRAWER) */}
      {showAdmin && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-slate-900 border-l border-white/10 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4 animate-fade-in">
                <div>
                  <h3 className="font-serif text-lg text-white">
                    🛠️ Painel do Marido
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Ajuste fotos, nomes, senhas e textos!
                  </p>
                </div>
                <button
                  onClick={() => { setShowAdmin(false); playSynthesizer("click"); }}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={saveAdminSettings} className="space-y-3.5 text-xs text-stone-300">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 mb-1">Seu Nome</label>
                    <input
                      type="text"
                      value={adminHusbandName}
                      onChange={(e) => setAdminHusbandName(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 mb-1">Nome Dela</label>
                    <input
                      type="text"
                      value={adminWifeName}
                      onChange={(e) => setAdminWifeName(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 mb-1">Senha do Portal (Ato 1)</label>
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 mb-1">Dica de Senha</label>
                  <input
                    type="text"
                    value={adminTip}
                    onChange={(e) => setAdminTip(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 mb-1">Seu WhatsApp (apenas números)</label>
                  <input
                    type="text"
                    value={adminWhatsapp}
                    onChange={(e) => setAdminWhatsapp(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white font-mono"
                    placeholder="Ex: 5511999999999"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 mb-1">Pergunta do Quiz (Ato 2)</label>
                  <textarea
                    value={adminQuestion}
                    onChange={(e) => setAdminQuestion(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 mb-1">Opção A (Incorreta)</label>
                    <input
                      type="text"
                      value={adminOptionA}
                      onChange={(e) => setAdminOptionA(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 mb-1">Opção B (Correta)</label>
                    <input
                      type="text"
                      value={adminOptionB}
                      onChange={(e) => setAdminOptionB(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white text-[10px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 mb-1">Carta de Amor (Ato 3)</label>
                  <textarea
                    value={adminLetter}
                    onChange={(e) => setAdminLetter(e.target.value)}
                    rows={4}
                    className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-white text-xs resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-stone-800 flex space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowAdmin(false); playSynthesizer("click"); }}
                    className="p-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 font-medium cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="p-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 font-medium text-white cursor-pointer"
                  >
                    Salvar & Resetar
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider block text-center mb-1">Como usar</span>
              <p className="text-[10px] text-stone-400 leading-normal text-center">
                Configure esses valores e eles serão mantidos no navegador (localStorage). Quando sua esposa jogar, ela verá os dados personalizados!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 text-center border-t border-white/5 bg-slate-950/50">
        <p className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">
          Feito com ❤️ por {settings.husbandName} • {new Date().getFullYear()} • Sempre Infinito
        </p>
      </footer>

    </div>
  );
}
