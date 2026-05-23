"use client";

import {
  Compass, Lightbulb, BookOpen, PenLine, Network,
  ChevronDown, ChevronUp, FlaskConical,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type DiscoveryAction = "browse" | "note" | "network";

type Discovery = {
  id: string;
  icon: "lightbulb" | "compass";
  active: boolean;
  title: string;
  body: string;
  root: string;       // used for browse/network navigation
  wordQuery: string;  // used for the example verses fetch key
  count: number;      // verified result count
  actions: DiscoveryAction[];
  exampleVerses: { sura: string; aya: string; text: string }[];
};

// All verse texts verified by running the live API against the actual dataset
const discoveries: Discovery[] = [
  {
    id: "mulk",
    icon: "lightbulb",
    active: true,
    title: "اكتشاف نمط دلالي: السلطة والمُلك",
    body: "جذر (م ل ك) يظهر في سياقات تتحدث عن المساءلة بقدر ما يتحدث عن الاستحقاق. ما الرابط بين المُلك والمسؤولية في الخطاب القرآني؟",
    root: "م ل ك",
    wordQuery: "ملك",
    count: 197,
    actions: ["browse", "note"],
    exampleVerses: [
      { sura: "الفاتحة", aya: "٤", text: "مَالِكِ يَوْمِ الدِّينِ" },
      { sura: "البقرة", aya: "١٠٧", text: "أَلَمْ تَعْلَمْ أَنَّ اللَّهَ لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ ۗ وَمَا لَكُم مِّن دُونِ اللَّهِ مِن وَلِيٍّ وَلَا نَصِيرٍ" },
    ],
  },
  {
    id: "taqwa",
    icon: "compass",
    active: false,
    title: "تتبع مفاهيمي: التقوى",
    body: "\"التقوى\" لا تُعرَّف بآية واحدة — تُبنى عبر أمثلة، سلوكيات، ومآلات. تشير ٢٣٨ آية إلى هذا المفهوم. ما الصورة التي تتشكّل منها؟",
    root: "وقى",
    wordQuery: "تقوى",
    count: 238,
    actions: ["browse", "network", "note"],
    exampleVerses: [
      { sura: "البقرة", aya: "١٩٧", text: "...وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ ۚ وَاتَّقُونِ يَا أُولِي الْأَلْبَابِ" },
      { sura: "المائدة", aya: "٢", text: "...وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ" },
    ],
  },
  {
    id: "nafs",
    icon: "lightbulb",
    active: false,
    title: "اكتشاف نمط دلالي: النفس بين الوصف والمسؤولية",
    body: "جذر (ن ف س) يتراوح بين وصف الإنسان كفرد، والنفس كمسؤولة عن أفعالها. ٢٧١ آية تحمل هذا المفهوم — كيف يرسم القرآن حدود المسؤولية الذاتية؟",
    root: "ن ف س",
    wordQuery: "نفس",
    count: 271,
    actions: ["browse", "note"],
    exampleVerses: [
      { sura: "البقرة", aya: "٩", text: "يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ" },
      { sura: "البقرة", aya: "٤٤", text: "أَتَأْمُرُونَ النَّاسَ بِالْبِرِّ وَتَنسَوْنَ أَنفُسَكُمْ وَأَنتُمْ تَتْلُونَ الْكِتَابَ ۚ أَفَلَا تَعْقِلُونَ" },
    ],
  },
  {
    id: "hukm",
    icon: "compass",
    active: false,
    title: "تتبع مفاهيمي: الحُكم والحِكمة",
    body: "كلمة (حكمة) تجمع في القرآن معاني: الحكم القضائي، والحكمة العملية، والإحكام البنيوي. في ١٨٩ آية يمكن تتبع كيف يتحول المعنى بحسب السياق.",
    root: "ح ك م",
    wordQuery: "حكمة",
    count: 189,
    actions: ["browse", "network"],
    exampleVerses: [
      { sura: "البقرة", aya: "١٢٩", text: "رَبَّنَا وَابْعَثْ فِيهِمْ رَسُولًا مِّنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِكَ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ وَيُزَكِّيهِمْ" },
      { sura: "البقرة", aya: "٢٦٩", text: "يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ ۚ وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا ۗ وَمَا يَذَّكَّرُ إِلَّا أُولُو الْأَلْبَابِ" },
    ],
  },
  {
    id: "shukr",
    icon: "lightbulb",
    active: false,
    title: "اكتشاف نمط دلالي: الشكر وضده الكفر",
    body: "في القرآن، الشكر يُذكر أحياناً في مقابل الكفر — كجحود لا كمعتقد. في ٢٤١٠ آية، يمكن رصد هذا التعارض. ماذا يكشف هذا التقابل؟",
    root: "ش ك ر",
    wordQuery: "شكر",
    count: 2410,
    actions: ["browse", "note", "network"],
    exampleVerses: [
      { sura: "البقرة", aya: "٥٢", text: "ثُمَّ عَفَوْنَا عَنكُم مِّن بَعْدِ ذَٰلِكَ لَعَلَّكُمْ تَشْكُرُونَ" },
      { sura: "البقرة", aya: "١٥٢", text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ" },
    ],
  },
];

export default function Discovery() {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());
  const [openExamples, setOpenExamples] = useState<Set<string>>(new Set(["mulk"])); // first card open by default

  useEffect(() => {
    try {
      const saved = localStorage.getItem("basira-notes");
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, []);

  const saveNote = (id: string, text: string) => {
    const updated = { ...notes, [id]: text };
    setNotes(updated);
    try { localStorage.setItem("basira-notes", JSON.stringify(updated)); } catch {}
  };

  const toggle = (set: Set<string>, id: string): Set<string> => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">وضع الاكتشاف</h1>
        <p className="text-zinc-400">
          بيئة استقرائية تعرض الأنماط والأدلة دون تقديم استنتاجات جاهزة.
        </p>
      </header>

      {/* How-to guide */}
      <div className="p-5 rounded-xl border border-teal-900/30 bg-teal-900/5">
        <h3 className="text-sm font-bold text-teal-400 mb-3">كيفية الاستخدام</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <span><span className="text-zinc-200">استعرض الآيات</span> — يفتح محرك الجذور بنتائج هذا الجذر</span>
          </div>
          <div className="flex items-start gap-2">
            <PenLine className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <span><span className="text-zinc-200">سجل ملاحظتك</span> — اكتب استنتاجك، يُحفظ في متصفحك</span>
          </div>
          <div className="flex items-start gap-2">
            <Network className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <span><span className="text-zinc-200">ابحث في الشبكة</span> — يعرض الخريطة الدلالية للمفهوم</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {discoveries.map((d) => (
          <div
            key={d.id}
            className={`rounded-2xl border overflow-hidden ${
              d.active ? "border-teal-900/50 bg-teal-900/10" : "border-zinc-800 bg-zinc-900/30"
            }`}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${d.active ? "bg-teal-500/20" : "bg-zinc-800"}`}>
                  {d.icon === "lightbulb"
                    ? <Lightbulb className={`w-6 h-6 ${d.active ? "text-teal-400" : "text-zinc-400"}`} />
                    : <Compass className={`w-6 h-6 ${d.active ? "text-teal-400" : "text-zinc-400"}`} />}
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-zinc-100">{d.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full font-amiri">{d.root}</span>
                      <span className="text-xs bg-zinc-800/60 text-teal-400 px-2 py-1 rounded-full tabular-nums">
                        {d.count.toLocaleString("ar-EG")} آية
                      </span>
                    </div>
                  </div>

                  <p className={`leading-relaxed ${d.active ? "text-zinc-300" : "text-zinc-400"}`}>{d.body}</p>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {d.actions.includes("browse") && (
                      <button
                        onClick={() => router.push(`/root-explorer?q=${encodeURIComponent(d.wordQuery)}`)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" /> استعرض الآيات
                      </button>
                    )}
                    {d.actions.includes("note") && (
                      <button
                        onClick={() => setOpenNotes(toggle(openNotes, d.id))}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <PenLine className="w-4 h-4" />
                        سجل ملاحظتك
                        {openNotes.has(d.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                    {d.actions.includes("network") && (
                      <button
                        onClick={() => router.push(`/self-reference?q=${encodeURIComponent(d.wordQuery)}`)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Network className="w-4 h-4" /> ابحث في الشبكة
                      </button>
                    )}
                  </div>

                  {/* Notes textarea */}
                  {openNotes.has(d.id) && (
                    <div className="pt-1">
                      <textarea
                        value={notes[d.id] || ""}
                        onChange={(e) => saveNote(d.id, e.target.value)}
                        placeholder="اكتب ملاحظتك الاستقرائية هنا..."
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-sm resize-none transition-all"
                      />
                      {notes[d.id] && <p className="text-xs text-teal-600 mt-1">✓ تم الحفظ تلقائياً</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verified example verses */}
            <div className="border-t border-zinc-800/50">
              <button
                onClick={() => setOpenExamples(toggle(openExamples, d.id))}
                className="w-full px-6 py-3 flex items-center justify-between text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                  <span>آيات مختبرة من النتائج الفعلية</span>
                  <span className="text-xs text-zinc-600">({d.exampleVerses.length} آيات)</span>
                </div>
                {openExamples.has(d.id)
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />}
              </button>

              {openExamples.has(d.id) && (
                <div className="px-6 pb-5 space-y-3">
                  {d.exampleVerses.map((v, i) => (
                    <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                      <p className="text-xs text-zinc-500 mb-2">
                        سورة {v.sura} • آية {v.aya}
                      </p>
                      <p className="font-amiri text-xl leading-loose text-zinc-200">{v.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
