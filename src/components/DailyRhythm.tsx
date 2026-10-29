import React, { useState } from 'react';
import { Sunrise, Sun, Sunset, Moon, Briefcase, BookOpen, Users, Coffee, Plus, Trash2, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { RhythmTask } from '../types';

interface DailyRhythmProps {
  language: 'ar' | 'en';
}

export const DailyRhythm: React.FC<DailyRhythmProps> = ({ language }) => {
  const isAr = language === 'ar';

  const [tasks, setTasks] = useState<RhythmTask[]>(() => {
    const saved = localStorage.getItem('sakina_rhythm_tasks');
    return saved
      ? JSON.parse(saved)
      : [
          { id: '1', title: isAr ? 'أذكار الصباح وقراءة حزب من القرآن' : 'Morning Adhkar & Quran recitation', periodKey: 'dawn', completed: false },
          { id: '2', title: isAr ? 'جلسة العمل المركز الأول (Deep Work)' : 'First deep focus work block', periodKey: 'morning', completed: false },
          { id: '3', title: isAr ? 'استراحة وتجديد الوضوء وصلاة الظهر' : 'Break, renewal of Wudu & Dhuhr', periodKey: 'afternoon', completed: false },
          { id: '4', title: isAr ? 'مراجعة أذكار المساء والمشي' : 'Evening Adhkar & light walk', periodKey: 'evening', completed: false },
          { id: '5', title: isAr ? 'جلسة الأسرة وتناول العشاء' : 'Family dinner & bonding', periodKey: 'nightfall', completed: false },
          { id: '6', title: isAr ? 'ركعات الوتر والنوم المبكر' : 'Witr prayer & early sleep', periodKey: 'latenight', completed: false },
        ];
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<RhythmTask['periodKey']>('morning');
  const [showAddForm, setShowAddForm] = useState(false);

  const saveTasks = (newTasks: RhythmTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('sakina_rhythm_tasks', JSON.stringify(newTasks));
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: RhythmTask = {
      id: Date.now().toString(),
      title: newTaskText.trim(),
      periodKey: selectedPeriod,
      completed: false,
    };
    saveTasks([...tasks, newTask]);
    setNewTaskText('');
    setShowAddForm(false);
  };

  const periods = [
    {
      key: 'dawn',
      titleAr: 'ما بين الفجر والشروق',
      titleEn: 'Dawn (Fajr to Sunrise)',
      idealAr: 'البكور، القرآن، أذكار الصباح، وتثبيت النية',
      idealEn: 'Barakah hours: Quran, Adhkar, spiritual foundation',
      icon: Sunrise,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      tipAr: '«اللَّهُمَّ بَارِكْ لِأُمَّتِي فِي بُكُورِهَا» (حديث شريف)',
      tipEn: '"O Allah, bless my nation in its early hours."',
    },
    {
      key: 'morning',
      titleAr: 'ما بين الشروق والظهر',
      titleEn: 'Morning (Sunrise to Dhuhr)',
      idealAr: 'ذروة الإنتاج، العمل المركز، الدراسة، والإنجاز المهني',
      idealEn: 'Peak productivity, deep work, study, and execution',
      icon: Sun,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tipAr: 'فترة الطاقة الذهنية العليا لإنجاز أصعب المهام',
      tipEn: 'Highest cognitive energy for high-priority tasks',
    },
    {
      key: 'afternoon',
      titleAr: 'ما بين الظهر والعصر',
      titleEn: 'Afternoon (Dhuhr to Asr)',
      idealAr: 'المهام الخفيفة، مراجعة البريد، وقيلولة قصيرة مسنونة',
      idealEn: 'Administrative tasks, light work, sunnah power nap',
      icon: Coffee,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tipAr: '«قِيلُوا فَإِنَّ الشَّيَاطِينَ لاَ تَقِيلُ» (قيلولة 20 دقيقة تجدد النشاط)',
      tipEn: 'A 20-minute power nap restores focus for the rest of the day',
    },
    {
      key: 'evening',
      titleAr: 'ما بين العصر والمغرب',
      titleEn: 'Late Afternoon (Asr to Maghrib)',
      idealAr: 'ختام الأعمال، أذكار المساء، تدبر اليوم، والنشاط البدني',
      idealEn: 'Wrapping up work, evening remembrance, physical health',
      icon: Sunset,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      tipAr: 'وقت مبارك لتهدئة إيقاع اليوم واستحضار نعم الله',
      tipEn: 'Reflective transition toward sunset and prayer',
    },
    {
      key: 'nightfall',
      titleAr: 'ما بين المغرب والعشاء',
      titleEn: 'Nightfall (Maghrib to Isha)',
      idealAr: 'جلسة الأهل، صلة الرحم، تناول العشاء، وقراءة هادئة',
      idealEn: 'Family connection, dinner, peaceful reading',
      icon: Users,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      tipAr: 'فرصة عظيمة لتعزيز دفء البيت وبر الوالدين والأبناء',
      tipEn: 'Fostering warmth at home and honoring family ties',
    },
    {
      key: 'latenight',
      titleAr: 'بعد صلاة العشاء',
      titleEn: 'Night (After Isha)',
      idealAr: 'سكون الروح، ركعات الوتر، النوم المبكر، وقيام الليل',
      idealEn: 'Soul serenity, Witr prayer, early sleep, Qiyam',
      icon: Moon,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      tipAr: 'كان رسول الله ﷺ يكره النوم قبل العشاء والحديث بعدها',
      tipEn: 'Sleeping early ensures ease in rising for Tahajjud and Fajr',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#e6c387] mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">{isAr ? 'تنظيم الحياة المباركة' : 'Holistic Daily Flow'}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-thmanyah">
              {isAr ? 'يومك على إيقاع الصلاة' : 'Prayer-Aware Daily Rhythm'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
              {isAr
                ? 'حوّل مواقيت الصلاة من مجرد أرقام على الشاشة إلى إطار حي لتنظيم أعمالك وعباداتك براحة واطمئنان.'
                : 'Structure your work, study, rest, and spiritual routine anchored around prayer windows.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مهمة' : 'Add Activity'}</span>
          </button>
        </div>
      </div>

      {/* Add Task Modal / Collapse */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3">
          <h4 className="text-xs font-bold text-white font-thmanyah">
            {isAr ? 'إضافة نشاط لإحدى فترات اليوم:' : 'Add activity to prayer window:'}
          </h4>

          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder={isAr ? 'مثال: قراءة 15 دقيقة في التفسير، أو إنهاء التقرير...' : 'e.g. 20 min Quran study, or finalize report...'}
            className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            autoFocus
          />

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">{isAr ? 'الفترة الزمنية:' : 'Window:'}</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {periods.map((p) => (
                <option key={p.key} value={p.key}>
                  {isAr ? p.titleAr : p.titleEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs"
            >
              {isAr ? 'حفظ النشاط' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* The 6 Prayer Windows Timeline */}
      <div className="space-y-3">
        {periods.map((period) => {
          const Icon = period.icon;
          const periodTasks = tasks.filter((t) => t.periodKey === period.key);

          return (
            <div
              key={period.key}
              className="p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3 hover:border-white/10 transition-all"
            >
              {/* Window Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${period.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-thmanyah">
                      {isAr ? period.titleAr : period.titleEn}
                    </h3>
                    <p className="text-xs text-[#fae3b3] mt-0.5 font-medium">
                      {isAr ? period.idealAr : period.idealEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gentle transition tip */}
              <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#e6c387] shrink-0" />
                <span>{isAr ? period.tipAr : period.tipEn}</span>
              </div>

              {/* User Activities inside this period */}
              {periodTasks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {periodTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs group"
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="flex items-center gap-2.5 text-right flex-1"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-slate-300" />
                        )}
                        <span className={task.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {task.title}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
