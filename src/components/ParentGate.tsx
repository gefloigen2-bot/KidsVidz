import { useMemo, useState } from 'react';

interface Props {
  onPass: () => void;
  onCancel: () => void;
}

const newQuestion = () => {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  return { a, b };
};

export default function ParentGate({ onPass, onCancel }: Props) {
  const [seed, setSeed] = useState(0);
  const { a, b } = useMemo(newQuestion, [seed]);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(answer) === a * b) return onPass();
    setWrong(true);
    setAnswer('');
    setSeed((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Grown-ups only</p>
        <p className="mt-3 text-4xl font-black text-slate-800">
          {a} × {b} = ?
        </p>
        <input
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))}
          className="mt-4 w-full rounded-2xl border-4 border-slate-200 p-3 text-center text-3xl font-bold outline-none focus:border-blue-500"
          aria-label="Answer"
        />
        {wrong && <p className="mt-2 text-red-600">Not quite — try this one.</p>}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="h-14 flex-1 rounded-2xl bg-slate-200 text-lg font-bold">
            Cancel
          </button>
          <button type="submit" className="h-14 flex-1 rounded-2xl bg-blue-600 text-lg font-bold text-white">
            Enter
          </button>
        </div>
      </form>
    </div>
  );
}
