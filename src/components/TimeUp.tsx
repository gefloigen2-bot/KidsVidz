import type { TimerState } from '../types';

export default function TimeUp({ message, onUnlock }: { message: TimerState['message']; onUnlock: () => void }) {
  const shabbos = message === 'shabbos';
  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 p-6 text-center ${
        shabbos ? 'bg-gradient-to-b from-amber-200 to-orange-300' : 'bg-gradient-to-b from-indigo-900 to-slate-900'
      }`}
    >
      <div className="text-[9rem] leading-none sm:text-[12rem]">{shabbos ? '🕯️🕯️' : '🌙'}</div>
      <h1 className={`text-5xl font-black sm:text-7xl ${shabbos ? 'text-amber-900' : 'text-amber-200'}`}>
        {shabbos ? 'Time for Shabbos!' : 'Time for Bedtime!'}
      </h1>
      <p className={`text-2xl font-bold ${shabbos ? 'text-amber-800' : 'text-indigo-200'}`}>
        {shabbos ? 'Good Shabbos! 💛' : 'Shema & sweet dreams 💤'}
      </p>
      <button
        onClick={onUnlock}
        className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white/20 text-2xl opacity-60"
        aria-label="Parent unlock"
      >
        🔒
      </button>
    </div>
  );
}
