/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Shapes, 
  Volume2, 
  Hash, 
  Languages, 
  Leaf, 
  BookOpen, 
  PlusCircle, 
  User, 
  BookOpenCheck, 
  Coins, 
  Users,
  ChevronLeft,
  Sparkles,
  Award,
  Gamepad2,
  BookMarked,
  Lightbulb,
  Volume2 as SpeakerIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { STAGES, StageId, Module } from './constants';
import { generateIndianStory, Story, textToSpeech } from './services/geminiService';
import { playRawPcm } from './lib/audioUtils';

const ICON_MAP: Record<string, any> = {
  Palette, Shapes, Volume2, Hash, Languages, Leaf, BookOpen, PlusCircle, User, BookOpenCheck, Coins, Users
};

export default function App() {
  const [currentStageId, setCurrentStageId] = useState<StageId | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [view, setView] = useState<'dashboard' | 'stage' | 'module' | 'parent-dashboard'>('dashboard');
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const [stars, setStars] = useState(120);
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const offlineTips = [
    { title: 'Nature Sorting', description: 'Collect different leaves and stones. Ask the child to sort them by size and color.', area: 'Panchakosha' },
    { title: 'Story Weaving', description: 'Start a story with one sentence and let the child add the next. Use Indian folk themes.', area: 'Language' },
    { title: 'Market Play', description: 'Use play money or pebbles to simulate a small vegetable market at home.', area: 'Numeracy' },
  ];

  const [selectedAvatar, setSelectedAvatar] = useState('👦');

  const avatars = [
    { emoji: '👦', name: 'Boy' },
    { emoji: '👧', name: 'Girl' },
    { emoji: '🐘', name: 'Golu' },
    { emoji: '🐅', name: 'Sheru' },
    { emoji: '🦚', name: 'Mayur' },
    { emoji: '🐒', name: 'Bajrangi' },
    { emoji: '🐢', name: 'Kachu' },
    { emoji: '🦊', name: 'Lomri' },
  ];

  // Mock progress data for the Parent Dashboard
  const progressStats = [
    { label: 'Literacy', value: completedModuleIds.filter(id => id.includes('phonics') || id.includes('words') || id.includes('reading')).length * 33 + 10, color: 'bg-brand-red' },
    { label: 'Numeracy', value: completedModuleIds.filter(id => id.includes('counting') || id.includes('math') || id.includes('money')).length * 33 + 10, color: 'bg-brand-purple' },
    { label: 'Cognitive', value: 40, color: 'bg-brand-blue' },
    { label: 'Physical', value: 20, color: 'bg-brand-green' },
  ];

  const handleCompleteLevel = () => {
    playPopSound();
    setStars(prev => prev + 10);
    if (activeModule && !completedModuleIds.includes(activeModule.id)) {
      setCompletedModuleIds(prev => [...prev, activeModule.id]);
    }
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (answerStatus !== 'idle') return;

    if (isCorrect) {
      setAnswerStatus('correct');
      handleCompleteLevel();
      speakText("Waah! Shandaar! You found the right answer!");
    } else {
      setAnswerStatus('incorrect');
      const badAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3');
      badAudio.volume = 0.1;
      badAudio.play().catch(() => {});
      speakText("Humm, not quite. Let's try again, you can do it!");
    }
    
    setTimeout(() => setAnswerStatus('idle'), 2000);
  };

  const currentStage = useMemo(() => 
    STAGES.find(s => s.id === currentStageId), 
    [currentStageId]
  );

  const playPopSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const speakText = async (text: string) => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const base64 = await textToSpeech(text);
      await playRawPcm(base64);
    } catch (e) {
      console.error("Speech failed", e);
    } finally {
      setSpeaking(false);
    }
  };

  const handleSelectStage = (id: StageId) => {
    playPopSound();
    const stage = STAGES.find(s => s.id === id);
    if (stage) {
      speakText(`Welcome to the ${stage.name} stage! Let's explore together.`);
    }
    setCurrentStageId(id);
    setView('stage');
  };

  const handleSelectModule = (module: Module) => {
    playPopSound();
    speakText(`Let's play ${module.title}! ${module.description}`);
    setActiveModule(module);
    setView('module');
  };

  const handleBack = () => {
    if (view === 'module') setView('stage');
    else if (view === 'stage') setView('dashboard');
  };

  const handleFetchStory = async () => {
    setLoading(true);
    try {
      const stageName = currentStage?.name || "Grade 1";
      const topic = "Animals in the Indian Forest";
      const s = await generateIndianStory(topic, stageName);
      setStory(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-dark font-sans selection:bg-brand-yellow/30 overflow-x-hidden">
      {/* Header */}
      <header className="h-24 bg-white border-b-4 border-brand-yellow flex items-center justify-between px-8 sticky top-0 z-50 shrink-0">
        <div 
          className="flex items-center gap-4 cursor-pointer" 
          onClick={() => { setView('dashboard'); setStory(null); }}
          id="logo-container"
        >
          <div className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm">B</div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-dark leading-none">BALVATIKA</h1>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Foundational Learning • NCF 2024</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {view !== 'dashboard' && (
            <button 
              onClick={() => {
                if (view === 'parent-dashboard') setView('dashboard');
                else handleBack();
              }}
              className="px-4 py-2 bg-white border-2 border-[#E9ECEF] rounded-full text-text-muted text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
              id="back-button"
            >
              <ChevronLeft className="w-4 h-4" /> {view === 'parent-dashboard' ? 'Home' : 'Back'}
            </button>
          )}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l-2 border-gray-100">
            <div className="text-right">
              <p className="text-xs font-bold text-text-dark">User Profile</p>
              <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">{stars} Stars ⭐</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-brand-yellow bg-brand-blue overflow-hidden flex items-center justify-center text-2xl">
              {selectedAvatar}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
              id="dashboard-view"
            >
              {/* Featured / Hero */}
              <section className="bg-white rounded-[40px] border-4 border-brand-yellow relative overflow-hidden flex flex-col lg:flex-row min-h-[400px]">
                <div className="lg:w-1/2 p-10 md:p-14 flex flex-col justify-center items-start">
                  <span className="px-3 py-1 bg-brand-yellow rounded-full text-[10px] font-black w-max mb-6 tracking-widest">TODAY'S MISSION</span>
                  <h2 className="text-4xl md:text-5xl font-black text-text-dark leading-[1.1] mb-6">
                    Discover the <span className="text-brand-red">Magic of India</span>
                  </h2>
                  <p className="text-text-muted text-lg mb-8 max-w-md">
                    Explore festivals, crafts, and nature through interactive games designed for every foundational stage.
                  </p>
                  <motion.button 
                    onClick={() => handleSelectStage('leaf')}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-max px-8 py-4 bg-brand-red text-white rounded-2xl font-black text-xl border-b-8 border-[#D93B41] active:border-b-0 hover:brightness-110 transition-all flex items-center gap-3"
                  >
                    Start Journey <Gamepad2 className="w-6 h-6" />
                  </motion.button>
                </div>
                <div className="lg:w-1/2 bg-brand-yellow/30 flex items-center justify-center p-8 lg:p-12">
                  <div className="w-full h-full bg-white/40 rounded-[30px] border-4 border-dashed border-white/60 flex items-center justify-center text-9xl shadow-inner animate-pulse">
                    🐘
                  </div>
                </div>
              </section>

              {/* Stage Selection */}
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-1 w-12 bg-brand-red rounded-full"></div>
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.3em]">Growth Stages</h3>
                  </div>
                  <button 
                    onClick={() => speakText("Namaste young explorer! Welcome to BalVatika. Pick a stage to begin your adventure!")}
                    disabled={speaking}
                    className="flex items-center gap-2 text-brand-red font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <SpeakerIcon className={`w-4 h-4 ${speaking ? 'animate-pulse' : ''}`} />
                    Hear Greeting
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {STAGES.map((stage, idx) => (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectStage(stage.id)}
                      className="cursor-pointer group"
                      id={`stage-card-${stage.id}`}
                    >
                      <div className={`bg-white p-8 rounded-[32px] border-4 transition-all h-full flex flex-col justify-between 
                        ${stage.id === 'root' ? 'border-brand-red hover:bg-brand-red/5' : 
                          stage.id === 'stem' ? 'border-brand-green hover:bg-brand-green/5' : 
                          stage.id === 'leaf' ? 'border-brand-blue hover:bg-brand-blue/5' : 'border-brand-purple hover:bg-brand-purple/5'}`}
                      >
                        <div className="space-y-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-6 transition-transform
                            ${stage.id === 'root' ? 'bg-brand-red' : 
                              stage.id === 'stem' ? 'bg-brand-green' : 
                              stage.id === 'leaf' ? 'bg-brand-blue' : 'bg-brand-purple'}`}
                          >
                            {stage.id === 'root' ? <Award className="text-white w-8 h-8" /> : 
                             stage.id === 'stem' ? <PlusCircle className="text-white w-8 h-8" /> : 
                             stage.id === 'leaf' ? <Leaf className="text-white w-8 h-8" /> : <Sparkles className="text-white w-8 h-8" />}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-text-dark mb-1 capitalize">{stage.name} Stage</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">{stage.ageRange}</p>
                            <p className="text-text-dark/70 text-sm font-medium leading-relaxed">{stage.description}</p>
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                           <span className="font-black text-sm uppercase tracking-tighter">Open Level</span>
                           <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-text-dark transition-colors">
                              <ChevronLeft className="w-4 h-4 rotate-180" />
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Teacher's Corner Entry Point */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="bg-brand-blue rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer shadow-2xl shadow-brand-blue/20"
                onClick={() => setView('parent-dashboard')}
                id="teachers-corner-card"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                  <Users className="w-64 h-64" />
                </div>
                <div className="space-y-4 relative z-10 text-center md:text-left">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Guardian Portal</span>
                  <h3 className="text-4xl font-black italic tracking-tight">Teacher's Corner</h3>
                  <p className="text-white/80 max-w-md font-medium">View progress reports, curriculum alignment, and offline activity ideas for your young explorer.</p>
                </div>
                <div className="relative z-10">
                  <button className="px-10 py-4 bg-white text-brand-blue rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
                    Open Insights
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {view === 'parent-dashboard' && (
            <motion.div 
              key="parent-dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
              id="parent-dashboard-view"
            >
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-text-dark tracking-tighter">PROGRESS INSIGHTS</h2>
                <p className="text-text-muted text-lg font-medium">Nurturing {currentStage?.fullName || 'the Early Explorer'}'s growth journey.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Learning Progress Chart (Simulated with Bars) */}
                <div className="bg-white rounded-[40px] p-8 md:p-12 border-4 border-[#E9ECEF] flex flex-col gap-10">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-text-dark">Skill Mastery</h4>
                  <div className="space-y-8">
                    {progressStats.map((stat) => (
                      <div key={stat.label} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="font-black text-sm uppercase tracking-widest text-text-muted">{stat.label}</span>
                          <span className="font-black text-2xl text-text-dark">{stat.value}%</span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${stat.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Offline Activity Tips */}
                <div className="bg-brand-yellow/10 rounded-[40px] p-8 md:p-12 border-4 border-brand-yellow/30 flex flex-col gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center text-text-dark">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tight text-text-dark italic">Daily Offline Tips</h4>
                  </div>
                  <div className="space-y-6">
                    {offlineTips.map((tip, i) => (
                      <div key={i} className="p-6 bg-white rounded-3xl border-2 border-brand-yellow/20 shadow-sm space-y-2">
                        <span className="px-2 py-0.5 bg-brand-yellow/20 text-brand-yellow rounded-md text-[9px] font-black uppercase tracking-widest leading-none">
                          {tip.area}
                        </span>
                        <h5 className="font-black text-text-dark text-lg">{tip.title}</h5>
                        <p className="text-text-muted text-sm leading-relaxed">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avatar Character Gallery */}
              <div className="bg-white rounded-[40px] border-4 border-brand-purple p-8 md:p-12">
                 <div className="flex items-center justify-between mb-8">
                   <h4 className="text-2xl font-black uppercase tracking-tight text-brand-purple italic">Choose Hero Avatar</h4>
                   <span className="text-sm font-black text-text-muted uppercase tracking-widest">Select One</span>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                   {avatars.map((av, i) => (
                     <motion.div
                       key={i}
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => {
                         setSelectedAvatar(av.emoji);
                         playPopSound();
                         speakText(`Hi! I am ${av.name}. Great choice!`);
                       }}
                       className={`aspect-square cursor-pointer rounded-3xl border-4 flex flex-col items-center justify-center transition-all ${
                         selectedAvatar === av.emoji 
                           ? 'border-brand-purple bg-brand-purple/10 scale-105 shadow-lg' 
                           : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                       }`}
                     >
                       <span className="text-4xl mb-1">{av.emoji}</span>
                       <span className={`text-[10px] font-black uppercase tracking-tight ${
                         selectedAvatar === av.emoji ? 'text-brand-purple' : 'text-text-muted'
                       }`}>
                         {av.name}
                       </span>
                     </motion.div>
                   ))}
                 </div>
              </div>

              {/* Milestones Card */}
              <div className="bg-white rounded-[40px] border-4 border-brand-green p-8 md:p-12">
                 <h4 className="text-2xl font-black uppercase tracking-tight text-brand-green mb-8">Completed Milestones</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                   {completedModuleIds.length === 0 ? (
                     <div className="col-span-full py-10 text-center text-text-muted font-bold italic">
                       No milestones achieved yet. Keep exploring to earn badges!
                     </div>
                   ) : (
                     STAGES.flatMap(s => s.modules)
                       .filter(m => completedModuleIds.includes(m.id))
                       .map((m, i) => {
                         const Icon = ICON_MAP[m.icon] || BookOpen;
                         return (
                           <motion.div 
                             key={i} 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="flex flex-col items-center text-center p-6 bg-brand-green/5 rounded-3xl border-2 border-brand-green/10"
                           >
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-green shadow-sm mb-4">
                                <Icon className="w-8 h-8" />
                              </div>
                              <span className="font-black text-text-dark uppercase tracking-tight text-sm line-clamp-1">{m.title}</span>
                              <span className="text-[10px] font-bold text-text-muted uppercase mt-1">AWARDED</span>
                           </motion.div>
                         );
                       })
                   )}
                 </div>
              </div>
            </motion.div>
          )}

          {view === 'stage' && currentStage && (
            <motion.div 
              key="stage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
              id="stage-view"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[40px] border-4 border-[#E9ECEF]">
                <div className="max-w-2xl space-y-4">
                  <span className="px-4 py-2 bg-brand-green text-white text-xs font-black rounded-full uppercase tracking-widest border-b-4 border-[#6AA01D]">
                    {currentStage.gradeEquivalent}
                  </span>
                  <h2 className="text-5xl font-black text-text-dark uppercase tracking-tight">{currentStage.fullName}</h2>
                  <p className="text-text-muted text-lg font-medium leading-relaxed">{currentStage.description}</p>
                </div>
                
                <motion.button 
                  onClick={handleFetchStory}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-max px-8 py-5 bg-brand-yellow text-text-dark rounded-2xl font-black text-xl border-b-8 border-[#D9A500] active:border-b-0 hover:brightness-110 active:translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  id="story-gen-button"
                >
                  <Sparkles className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'WEAVING...' : 'AI STORY'}
                </motion.button>
              </div>

              {story && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-12 rounded-[50px] border-4 border-brand-blue relative overflow-hidden"
                  id="story-container"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <BookMarked className="w-48 h-48" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h3 className="text-4xl font-black text-brand-blue uppercase italic">{story.title}</h3>
                    <button 
                      onClick={() => speakText(`${story.title}. ${story.content}`)}
                      disabled={speaking}
                      className="px-6 py-3 bg-brand-green text-white rounded-2xl font-black flex items-center gap-2 hover:bg-brand-green/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      <SpeakerIcon className={`w-5 h-5 ${speaking ? 'animate-pulse' : ''}`} />
                      {speaking ? 'Speaking...' : 'Listen to Story'}
                    </button>
                  </div>
                  <div className="prose prose-xl max-w-none text-text-dark font-medium leading-relaxed space-y-6">
                    {story.content.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  {story.moral && (
                    <div className="mt-10 p-6 bg-brand-blue/5 rounded-3xl border-2 border-brand-blue/20 italic text-brand-blue font-bold text-lg">
                      <strong>✨ Gyaan:</strong> {story.moral}
                    </div>
                  )}
                  <button 
                    onClick={() => setStory(null)}
                    className="mt-10 px-6 py-3 bg-gray-100 rounded-xl font-black text-text-muted hover:bg-gray-200 transition-colors uppercase text-sm tracking-widest"
                  >
                    Close Scroll
                  </button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentStage.modules.map((module) => {
                  const Icon = ICON_MAP[module.icon] || BookOpen;
                  const moduleColorClass = module.color === 'bg-brand-red' ? 'border-brand-red text-brand-red bg-[#FFEDEF]' :
                                        module.color === 'bg-brand-green' ? 'border-brand-green text-brand-green bg-[#F0F9E8]' :
                                        module.color === 'bg-brand-blue' ? 'border-brand-blue text-brand-blue bg-white' :
                                        module.color === 'bg-brand-yellow' ? 'border-brand-yellow text-[#B58E00] bg-[#FFFBE6]' :
                                        'border-brand-purple text-brand-purple bg-[#FDF2FF]';
                  return (
                    <motion.div
                      key={module.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer"
                      onClick={() => handleSelectModule(module)}
                      id={`module-card-${module.id}`}
                    >
                      <div className={`rounded-[32px] p-8 border-2 transition-all h-full flex flex-col items-center text-center shadow-sm ${moduleColorClass} hover:shadow-xl`}>
                        <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border-2 border-inherit`}>
                          <Icon className="w-10 h-10" />
                        </div>
                        <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">{module.title}</h4>
                        <p className="text-inherit opacity-80 text-sm font-bold uppercase tracking-widest mb-4">
                          {module.type} Focus
                        </p>
                        <p className="text-text-dark/60 text-sm font-medium">{module.description}</p>
                        
                        <div className="mt-8 pt-6 border-t border-inherit w-full flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest">
                           <Gamepad2 className="w-5 h-5" /> Mission Start
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === 'module' && activeModule && (
            <motion.div 
              key="module"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="bg-white rounded-[50px] border-4 border-brand-purple shadow-2xl p-12 md:p-20 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12 relative overflow-hidden"
              id="module-view"
            >
              <AnimatePresence>
                {showReward && (
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: -200, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-50 pointer-events-none flex flex-col items-center"
                  >
                    <div className="text-6xl mb-2">⭐</div>
                    <div className="bg-brand-yellow px-4 py-1 rounded-full text-text-dark font-black text-xl">+10 STARS!</div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className={`w-40 h-40 rounded-[40px] bg-white border-8 border-brand-purple flex items-center justify-center animate-bounce shadow-2xl transform rotate-12`}>
                {(() => {
                  const Icon = ICON_MAP[activeModule.icon] || BookOpen;
                  return <Icon className="text-brand-purple w-20 h-20" />;
                })()}
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-xs font-black uppercase tracking-[0.3em]">
                    Interactive Module
                  </span>
                  <button 
                    onClick={() => speakText(`Hello young explorer! Today we are learning about ${activeModule.title}. ${activeModule.description}`)}
                    disabled={speaking}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-full font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
                  >
                    <SpeakerIcon className={`w-4 h-4 ${speaking ? 'animate-pulse' : ''}`} />
                    {speaking ? 'AI Speaking...' : 'Hear Direction'}
                  </button>
                </div>
                <h2 className="text-6xl md:text-7xl font-black text-text-dark tracking-tighter uppercase">{activeModule.title}</h2>
                <p className="text-xl text-text-muted font-medium max-w-xl mx-auto">{activeModule.description}</p>
              </div>

              {/* Interactive Challenge Section */}
              <motion.div 
                animate={answerStatus === 'incorrect' ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                className={`w-full max-w-2xl p-10 rounded-[40px] border-4 transition-all ${
                  answerStatus === 'correct' ? 'border-brand-green bg-brand-green/5' : 
                  answerStatus === 'incorrect' ? 'border-brand-red bg-brand-red/5' : 
                  'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="space-y-8">
                  <div className="text-center">
                    <span className="text-sm font-black text-text-muted uppercase tracking-[0.2em] block mb-2">Panchakosha Challenge</span>
                    <h4 className="text-3xl font-black text-text-dark">Which one makes our body strong?</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(true)}
                      className={`p-8 rounded-3xl border-4 flex flex-col items-center gap-4 transition-all relative overflow-hidden ${
                         answerStatus === 'correct' ? 'border-brand-green bg-white' : 'border-white bg-white hover:border-brand-purple shadow-sm'
                      }`}
                    >
                      {answerStatus === 'correct' && (
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-2 right-2 text-brand-green"
                        >
                          <CheckCircle2 className="w-8 h-8" />
                        </motion.div>
                      )}
                      <div className="text-6xl">🍎</div>
                      <span className="font-black text-text-dark uppercase tracking-tight">Fresh Apple</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(false)}
                      className={`p-8 rounded-3xl border-4 flex flex-col items-center gap-4 transition-all relative overflow-hidden ${
                         answerStatus === 'incorrect' ? 'border-brand-red bg-white' : 'border-white bg-white hover:border-brand-purple shadow-sm'
                      }`}
                    >
                      {answerStatus === 'incorrect' && (
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-2 right-2 text-brand-red"
                        >
                          <AlertCircle className="w-8 h-8" />
                        </motion.div>
                      )}
                      <div className="text-6xl">🍬</div>
                      <span className="font-black text-text-dark uppercase tracking-tight">Sticky Candy</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl">
                {[1, 2, 3, 4].map(level => (
                  <motion.button 
                    key={level}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="aspect-square bg-white rounded-[32px] border-2 border-[#E9ECEF] hover:border-brand-purple hover:shadow-xl transition-all flex flex-col items-center justify-center group"
                  >
                    <span className="text-text-muted group-hover:text-brand-purple font-black text-4xl mb-1">{level}</span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50">Level</span>
                  </motion.button>
                ))}
              </div>

              <div className="pt-8">
                <motion.button 
                  className="px-16 py-6 bg-brand-purple text-white rounded-3xl font-black text-2xl shadow-xl border-b-8 border-[#5A3F7A] active:border-b-0 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompleteLevel}
                >
                  Complete Level 1 ▶️
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Progress Footer */}
      <footer className="h-16 bg-text-dark px-8 flex items-center justify-between sticky bottom-0 z-40">
        <div className="flex items-center gap-6 overflow-hidden">
          <span className="hidden sm:inline text-white text-[10px] font-black tracking-[0.3em] opacity-40">PROGRESS</span>
          <div className="w-32 md:w-64 h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="w-[42%] h-full bg-brand-green"></div>
          </div>
          <span className="text-brand-green text-xs font-black tabular-nums">42% REACHED</span>
        </div>
        <div className="flex gap-4 md:gap-8">
          <span className="text-white text-[10px] md:text-xs font-bold opacity-60">Panchakosha • <b className="text-white/100">Lv 4</b></span>
          <span className="text-white text-[10px] md:text-xs font-bold opacity-60">Sharirik • <b className="text-white/100">Lv 2</b></span>
        </div>
      </footer>
    </div>
  );
}
