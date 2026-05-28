import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Sparkles, Trophy, RotateCcw } from "lucide-react";
import { completeQuiz } from "@/lib/services/userService";
import { useContent } from "@/hooks/use-content";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Quiz & Challenges — HN-AI" }, { name: "description", content: "Test your AI knowledge and earn XP." }] }),
  component: Quiz,
});

function Quiz() {
  const { quiz: quizQuestions } = useContent();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = quizQuestions[i];
  const isLast = i === quizQuestions.length - 1;

  const submit = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.correctAnswer) setScore((s) => s + 1);
  };
  const next = () => {
    if (isLast) {
      const final = score + (picked === q.correctAnswer ? 0 : 0); // already added
      completeQuiz(`quiz-${Date.now()}`, final, quizQuestions.length);
      setDone(true);
    } else {
      setI((x) => x + 1);
      setPicked(null);
    }
  };
  const reset = () => { setI(0); setPicked(null); setScore(0); setDone(false); };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-10">
        <div className="size-24 mx-auto rounded-3xl bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple">
          <Trophy className="size-12 text-white" />
        </div>
        <h1 className="font-display font-extrabold text-4xl">Quiz Complete!</h1>
        <p className="text-muted-foreground">You scored <span className="text-neon-cyan font-bold">{score}</span> / {quizQuestions.length} and earned <span className="text-neon-orange font-bold">+{score * 5} XP</span>.</p>
        <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold glow-purple">
          <RotateCcw className="size-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="glass-strong rounded-3xl p-6 border-neon-blue/30">
        <div className="text-xs text-muted-foreground mb-2">Question {i + 1} of {quizQuestions.length} · {q.category}</div>
        <div className="h-2 rounded-full bg-background/50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all" style={{ width: `${((i + 1) / quizQuestions.length) * 100}%` }} />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl mt-4 leading-snug">{q.question}</h1>
      </header>

      <div className="space-y-3">
        {q.answers.map((a, idx) => {
          const isCorrect = idx === q.correctAnswer;
          const isPicked = picked === idx;
          const reveal = picked !== null;
          return (
            <button
              key={idx}
              onClick={() => submit(idx)}
              disabled={reveal}
              className={`w-full text-left glass rounded-2xl p-4 border transition flex items-center gap-3 ${
                reveal && isCorrect ? "border-neon-cyan/60 glow-cyan bg-neon-cyan/10" :
                reveal && isPicked && !isCorrect ? "border-destructive/60 bg-destructive/10" :
                "border-border/40 hover:border-neon-purple/50"
              }`}
            >
              <div className="size-8 rounded-lg grid place-items-center border border-border/40 font-display font-bold">
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1">{a}</span>
              {reveal && isCorrect && <Check className="size-5 text-neon-cyan" />}
              {reveal && isPicked && !isCorrect && <X className="size-5 text-destructive" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="glass rounded-2xl p-5 border-neon-purple/30">
          <div className="text-xs uppercase tracking-wider text-neon-purple font-semibold mb-1">Explanation</div>
          <p className="text-sm">{q.explanation}</p>
          <button onClick={next} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold glow-purple hover:scale-105 transition">
            <Sparkles className="size-4" /> {isLast ? "Finish Quiz" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
