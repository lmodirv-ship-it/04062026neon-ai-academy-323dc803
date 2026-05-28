// Mock data — replace with HN-DB client later via src/lib/services/hnClient.ts

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // token name: neon-blue | neon-purple | neon-cyan | neon-orange | neon-pink
  lessons: number;
  difficulty: Difficulty;
  tagline: string;
}

export interface Lesson {
  id: string;
  pathSlug: string;
  title: string;
  description: string;
  duration: number; // minutes
  xpReward: number;
  difficulty: Difficulty;
  content: string; // markdown-ish
  example: string;
  promptExamples: string[];
  challenge: string;
}

export interface Mission {
  id: string;
  day: number;
  title: string;
  description: string;
  category: string;
  reward: number;
  lessonId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number; // index
  explanation: string;
  category: string;
}

export interface MiniProject {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  tags: string[];
  emoji: string;
}

export interface AITool {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  emoji: string;
}

export interface LeaderUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  country: string;
}

export const learningPaths: LearningPath[] = [
  { id: "p1", slug: "ai-beginner", title: "AI Beginner", description: "Start your AI journey from zero.", icon: "Sparkles", color: "neon-purple", lessons: 18, difficulty: "Beginner", tagline: "Start your AI journey" },
  { id: "p2", slug: "prompt-engineering", title: "Prompt Engineering", description: "Master the art of prompting.", icon: "MessageSquareCode", color: "neon-cyan", lessons: 24, difficulty: "Beginner", tagline: "Master the art of prompting" },
  { id: "p3", slug: "ai-coding", title: "AI Coding with Python", description: "Code smarter with AI copilots.", icon: "Code2", color: "neon-blue", lessons: 20, difficulty: "Intermediate", tagline: "Code smarter with AI" },
  { id: "p4", slug: "ai-business", title: "AI for Business", description: "Use AI to grow your business.", icon: "TrendingUp", color: "neon-orange", lessons: 16, difficulty: "Beginner", tagline: "Grow your business with AI" },
  { id: "p5", slug: "ai-agents", title: "AI Agents & Automation", description: "Build smart agents that work for you.", icon: "Bot", color: "neon-purple", lessons: 22, difficulty: "Advanced", tagline: "Build smart agents" },
  { id: "p6", slug: "ai-design", title: "AI Design", description: "Generate stunning visuals with AI.", icon: "Palette", color: "neon-pink", lessons: 14, difficulty: "Beginner", tagline: "Design with generative AI" },
  { id: "p7", slug: "ai-content", title: "AI Content Creation", description: "Write, film, and publish with AI.", icon: "PenTool", color: "neon-cyan", lessons: 18, difficulty: "Beginner", tagline: "Content at the speed of thought" },
  { id: "p8", slug: "ai-automation", title: "AI Automation", description: "Automate workflows with n8n, Zapier & AI.", icon: "Workflow", color: "neon-orange", lessons: 15, difficulty: "Intermediate", tagline: "Automate the boring stuff" },
  { id: "p9", slug: "ai-tools", title: "AI Tools Mastery", description: "Become a power user of every AI tool.", icon: "Wrench", color: "neon-blue", lessons: 26, difficulty: "Beginner", tagline: "Tool up like a pro" },
  { id: "p10", slug: "web-dev-ai", title: "Web Dev with AI", description: "Ship full-stack apps with AI pair programming.", icon: "Globe", color: "neon-purple", lessons: 28, difficulty: "Intermediate", tagline: "Ship apps faster than ever" },
  { id: "p11", slug: "ollama-local-ai", title: "Ollama & Local AI", description: "Run powerful LLMs on your own machine — private & offline.", icon: "Cpu", color: "neon-cyan", lessons: 12, difficulty: "Intermediate", tagline: "Your AI, your hardware" },
];

export const lessons: Lesson[] = [
  {
    id: "l1", pathSlug: "prompt-engineering",
    title: "What is a Prompt?", description: "The single most important skill in the AI era.",
    duration: 8, xpReward: 10, difficulty: "Beginner",
    content: "A prompt is a clear instruction you give to an AI model. The clearer your prompt, the better the answer. Great prompts include three things: role, task, and format.",
    example: "Bad: 'write something about cats'. Good: 'Act as a wildlife biologist. Write a 100-word fun fact about domestic cats for kids aged 8.'",
    promptExamples: [
      "Act as a senior software engineer. Review this code and suggest 3 improvements.",
      "You are a YouTube scriptwriter. Write a 60-second hook about AI agents.",
    ],
    challenge: "Write 3 prompts that include role, task, and output format.",
  },
  {
    id: "l2", pathSlug: "prompt-engineering",
    title: "The CRISP Framework", description: "Context, Role, Instruction, Specifics, Polish.",
    duration: 10, xpReward: 15, difficulty: "Beginner",
    content: "CRISP gives you a repeatable recipe for prompts that work. Context sets the scene, Role gives the AI a personality, Instruction tells it what to do, Specifics anchor the output, Polish defines tone and format.",
    example: "[Context] I'm launching an AI course. [Role] Act as a marketing strategist. [Instruction] Suggest 5 landing-page headlines. [Specifics] Each under 8 words. [Polish] Punchy and energetic.",
    promptExamples: ["Apply CRISP to: 'help me write a cover letter for a junior data role'."],
    challenge: "Rewrite one of your old prompts using the CRISP framework.",
  },
  {
    id: "l3", pathSlug: "ai-beginner",
    title: "What is Generative AI?", description: "The technology behind ChatGPT, Midjourney, and more.",
    duration: 7, xpReward: 10, difficulty: "Beginner",
    content: "Generative AI creates new content — text, images, audio, code — by predicting what comes next based on patterns it learned from enormous amounts of data.",
    example: "When you type 'a cat astronaut on Mars' into Midjourney, the model imagines pixels that match that description.",
    promptExamples: ["Explain generative AI to a 10-year-old in 3 sentences."],
    challenge: "Use any AI to generate 3 things: a poem, an image idea, and a code snippet.",
  },
  {
    id: "l4", pathSlug: "ai-coding",
    title: "Your First AI-Paired Function", description: "Let Cursor or Copilot write code with you.",
    duration: 12, xpReward: 20, difficulty: "Beginner",
    content: "AI pair programming works best when you describe intent, not syntax. Write a clear comment, then let the AI suggest the code. Always read and test what it gives you.",
    example: "// Function that takes a list of prices and returns the total with 15% tax\nThe AI will draft it; you verify it works.",
    promptExamples: ["Refactor this function to be more readable.", "Add error handling for empty input."],
    challenge: "Write a Python function (with AI's help) that returns the longest word in a sentence.",
  },
  {
    id: "l5", pathSlug: "ai-agents",
    title: "What is an AI Agent?", description: "From chatbot to autonomous assistant.",
    duration: 9, xpReward: 15, difficulty: "Intermediate",
    content: "An AI agent is a system that can plan, take actions, and use tools to achieve a goal — not just answer one question. Think of it as ChatGPT with hands.",
    example: "An agent that reads your inbox, drafts replies, schedules meetings, and asks you to confirm.",
    promptExamples: ["Design an agent that researches competitors and emails me a daily summary."],
    challenge: "Sketch a 3-step agent workflow for a task you do weekly.",
  },
  {
    id: "l6", pathSlug: "ai-design",
    title: "Prompting for Images", description: "Subject, style, lighting, camera.",
    duration: 8, xpReward: 10, difficulty: "Beginner",
    content: "Image prompts work best with four blocks: subject (what), style (how), lighting (mood), camera (composition).",
    example: "'A neon throne in a cyberpunk arena, glowing blue rings, dramatic side light, 35mm cinematic shot'",
    promptExamples: ["A futuristic city skyline at sunrise, watercolor, soft golden light, wide angle."],
    challenge: "Generate 3 image prompts for a fictional AI academy.",
  },
];

export const missions: Mission[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const presets = [
    { title: "Prompt Engineering Basics", category: "Prompt", reward: 50, lessonId: "l1" },
    { title: "Build Your First Prompt", category: "Prompt", reward: 60, lessonId: "l2" },
    { title: "Meet Generative AI", category: "Foundations", reward: 50, lessonId: "l3" },
    { title: "AI-Paired Coding", category: "Coding", reward: 70, lessonId: "l4" },
    { title: "Design an AI Agent", category: "Agents", reward: 80, lessonId: "l5" },
    { title: "Prompt for Images", category: "Design", reward: 60, lessonId: "l6" },
  ];
  const p = presets[i % presets.length];
  return {
    id: `m${day}`, day, title: p.title,
    description: `Day ${day} • A focused 10-minute mission to keep your streak alive.`,
    category: p.category, reward: p.reward, lessonId: p.lessonId,
  };
});

export const quizQuestions: QuizQuestion[] = [
  { id: "q1", category: "Prompt", question: "Which prompt is most likely to give a useful answer?",
    answers: ["Tell me about cats", "Write a 100-word fun fact about cats for kids age 8, friendly tone", "Cats?", "info cats"],
    correctAnswer: 1, explanation: "Clear role, task, audience, length, and tone always wins." },
  { id: "q2", category: "Foundations", question: "What does an LLM primarily predict?",
    answers: ["The user's emotion", "The next token", "The exact answer in a database", "The internet's top result"],
    correctAnswer: 1, explanation: "LLMs predict the most likely next token given the previous context." },
  { id: "q3", category: "Agents", question: "What separates an AI agent from a chatbot?",
    answers: ["Bigger model", "Ability to plan and use tools", "Voice support", "Memory only"],
    correctAnswer: 1, explanation: "Agents can plan multi-step actions and call tools to achieve goals." },
  { id: "q4", category: "Coding", question: "Best practice when AI suggests code?",
    answers: ["Ship it immediately", "Read and test it", "Trust it blindly", "Hide it in main"],
    correctAnswer: 1, explanation: "Always read, understand, and test AI-generated code." },
  { id: "q5", category: "Design", question: "A strong image prompt usually includes…",
    answers: ["Only the subject", "Subject, style, lighting, camera", "Color and price", "Random emojis"],
    correctAnswer: 1, explanation: "Subject + style + lighting + camera = repeatable, art-directed results." },
  { id: "q6", category: "Prompt", question: "CRISP stands for…",
    answers: ["Code, Role, Image, Style, Prompt", "Context, Role, Instruction, Specifics, Polish", "Cool, Real, Indie, Smart, People", "None"],
    correctAnswer: 1, explanation: "CRISP = Context · Role · Instruction · Specifics · Polish." },
];

export const miniProjects: MiniProject[] = [
  { id: "mp1", title: "AI Landing Page", description: "Build a futuristic landing page with AI-generated copy and visuals.", difficulty: "Beginner", xpReward: 80, tags: ["Web", "Design"], emoji: "🚀" },
  { id: "mp2", title: "Custom Chatbot", description: "Create a chatbot persona using prompt engineering and roles.", difficulty: "Beginner", xpReward: 100, tags: ["Prompt", "Chat"], emoji: "🤖" },
  { id: "mp3", title: "AI Portfolio", description: "Ship a 1-page portfolio that showcases your AI projects.", difficulty: "Beginner", xpReward: 90, tags: ["Web"], emoji: "🧑‍💻" },
  { id: "mp4", title: "AI Email Assistant", description: "Draft, summarize, and reply to emails with smart prompts.", difficulty: "Intermediate", xpReward: 120, tags: ["Automation"], emoji: "📧" },
  { id: "mp5", title: "Automation Workflow", description: "Trigger → fetch → transform → send. A real workflow in minutes.", difficulty: "Intermediate", xpReward: 130, tags: ["Automation", "Agents"], emoji: "⚙️" },
  { id: "mp6", title: "Image Generator Studio", description: "A mini studio that crafts and refines image prompts.", difficulty: "Beginner", xpReward: 100, tags: ["Design"], emoji: "🎨" },
  { id: "mp7", title: "Personal AI Tutor", description: "An agent that quizzes you on any topic with spaced repetition.", difficulty: "Advanced", xpReward: 160, tags: ["Agents", "Education"], emoji: "📚" },
  { id: "mp8", title: "AI Notion Workspace", description: "A productivity OS templated by AI for your daily work.", difficulty: "Beginner", xpReward: 90, tags: ["Productivity"], emoji: "🗂️" },
];

export const aiTools: AITool[] = [
  { id: "t1", name: "ChatGPT", category: "Chat", description: "OpenAI's flagship chat model.", url: "https://chat.openai.com", emoji: "💬" },
  { id: "t2", name: "Claude", category: "Chat", description: "Anthropic's helpful, harmless, honest assistant.", url: "https://claude.ai", emoji: "🧠" },
  { id: "t3", name: "Cursor", category: "Coding", description: "AI-first code editor based on VSCode.", url: "https://cursor.sh", emoji: "🖱️" },
  { id: "t4", name: "Replit", category: "Coding", description: "Build and ship apps in your browser with AI.", url: "https://replit.com", emoji: "🛠️" },
  { id: "t5", name: "Ollama", category: "Local LLMs", description: "Run LLMs locally on your machine.", url: "https://ollama.com", emoji: "🦙" },
  { id: "t6", name: "Midjourney", category: "Image", description: "Artistic AI image generation.", url: "https://midjourney.com", emoji: "🎨" },
  { id: "t7", name: "Runway", category: "Video", description: "Generative video and editing.", url: "https://runwayml.com", emoji: "🎬" },
  { id: "t8", name: "n8n", category: "Automation", description: "Source-available workflow automation.", url: "https://n8n.io", emoji: "🔁" },
  { id: "t9", name: "Perplexity", category: "Search", description: "AI-powered answer engine.", url: "https://perplexity.ai", emoji: "🔎" },
  { id: "t10", name: "Suno", category: "Audio", description: "Generate music from text prompts.", url: "https://suno.com", emoji: "🎵" },
  { id: "t11", name: "ElevenLabs", category: "Audio", description: "Hyper-realistic AI voice generation.", url: "https://elevenlabs.io", emoji: "🎙️" },
  { id: "t12", name: "Notion AI", category: "Productivity", description: "AI built into your docs.", url: "https://notion.so", emoji: "📝" },
];

export const leaderboard: LeaderUser[] = [
  { id: "u1", name: "Nora Hassan", avatar: "🦊", xp: 18420, level: 31, streak: 64, country: "🇸🇦" },
  { id: "u2", name: "Kenji Watanabe", avatar: "🦅", xp: 17110, level: 29, streak: 42, country: "🇯🇵" },
  { id: "u3", name: "Maya Okafor", avatar: "🐉", xp: 15890, level: 27, streak: 31, country: "🇳🇬" },
  { id: "u4", name: "Lucas Pereira", avatar: "🐺", xp: 14420, level: 25, streak: 25, country: "🇧🇷" },
  { id: "u5", name: "Aisha Karim", avatar: "🦁", xp: 13200, level: 24, streak: 28, country: "🇦🇪" },
  { id: "u6", name: "Elena Rossi", avatar: "🦋", xp: 12100, level: 22, streak: 19, country: "🇮🇹" },
  { id: "u7", name: "Tom Becker", avatar: "🐧", xp: 11050, level: 21, streak: 12, country: "🇩🇪" },
  { id: "u8", name: "Sara Lee", avatar: "🐝", xp: 9870, level: 19, streak: 8, country: "🇰🇷" },
];

export const aiQuotes = [
  { quote: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { quote: "Artificial intelligence is the new electricity.", author: "Andrew Ng" },
  { quote: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: "Bill Gates" },
  { quote: "Software is eating the world, and AI is eating software.", author: "Jensen Huang" },
  { quote: "Curiosity is the engine of intelligence.", author: "Yann LeCun" },
];

export const trendingTools = ["Cursor", "Claude 3.5", "Midjourney v7", "n8n", "Suno", "Perplexity"];

export const levels = [
  { lvl: 1, name: "AI Explorer", xp: 0 },
  { lvl: 2, name: "Prompt Learner", xp: 500 },
  { lvl: 3, name: "AI Builder", xp: 1500 },
  { lvl: 4, name: "AI Creator", xp: 3500 },
  { lvl: 5, name: "AI Engineer", xp: 7000 },
];

export function levelForXp(xp: number) {
  const all = [...levels];
  let cur = all[0];
  for (const l of all) if (xp >= l.xp) cur = l;
  // beyond level 5: +3000 xp per level, dynamic name
  if (xp >= 7000) {
    const extra = Math.floor((xp - 7000) / 3000);
    return { lvl: 5 + extra, name: extra === 0 ? "AI Engineer" : `AI Master ${extra + 1}`, xp: 7000 + extra * 3000 };
  }
  return cur;
}

export function nextLevelXp(xp: number) {
  if (xp < 500) return 500;
  if (xp < 1500) return 1500;
  if (xp < 3500) return 3500;
  if (xp < 7000) return 7000;
  return 7000 + (Math.floor((xp - 7000) / 3000) + 1) * 3000;
}
