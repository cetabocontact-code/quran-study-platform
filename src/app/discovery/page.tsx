"use client";

import { Compass, Lightbulb, BookOpen, PenLine, Network, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type DiscoveryAction = "browse" | "note" | "network";

type Discovery = {
  id: string;
  icon: "lightbulb" | "compass";
  active: boolean;
  title: string;
  body: string;
  root: string;
  count: number;
  actions: DiscoveryAction[];
};

const discoveries: Discovery[] = [
  {
    id: "mulk",
    icon: "lightbulb",
    active: true,
    title: "اكتشاف نمط دلالي: السلطة والمُلك",
    body: "في آيات متعددة، يظهر جذر (م ل ك) في سياقات تتحدث عن المساءلة أكثر من الحديث عن الاستحقاق. ما هو الرابط الذي تستنتجه بين المُلك والمسؤولية في الخطاب القرآني؟",
    root: "م ل ك",
    count: 12,
    actions: ["browse", "note"],
  },
  {
    id: "taqwa",
    icon: "compass",
    active: false,
    title: "تتبع مفاهيمي: تقوى",
    body: "مفهوم \"التقوى\" لا يُعرّف بآية واحدة، بل يُبنى عبر أمثلة، سلوكيات، ومآلات. استعرض الآيات المرتبطة بجذره وشاهد الخريطة الدلالية.",
    root: "وقى",
    count: 258,
    actions: ["browse", "network", "note"],
  },
  {
    id: "nafs",
    icon: "lightbulb",
    active: false,
    title: "اكتشاف نمط دلالي: النفس بين الوصف والمسؤولية",
    body: "جذر (ن ف س) يظهر في ٢٤٨٥ نتيجة مختبرة تتراوح بين وصف الإنسان كفرد، والنفس كمسؤولة عن فعلها. كيف يرسم القرآن حدود المسؤولية الذاتية؟",
    root: "ن ف س",
    count: 2485,
    actions: ["browse", "note"],
  },
  {
    id: "hukm",
    icon: "compass",
    active: false,
    title: "تتبع مفاهيمي: الحُكم والحِكمة",
    body: "جذر (ح ك م) يحمل معاني الحكم القضائي والحكمة والإحكام دفعةً واحدة. في ٢٠١٧ نتيجة مختبرة يمكن تتبع كيف يتحول المعنى بحسب السياق.",
    root: "ح ك م",
    count: 2017,
    actions: ["browse", "network"],
  },
  {
    id: "shukr",
    icon: "lightbulb",
    active: false,
    title: "اكتشاف نمط دلالي: الشكر وضده الكفر",
    body: "جذر (ش ك ر) يُذكر أحياناً مقابل الكفر كجحود لا كعقيدة. في ١١٩٦ نتيجة مختبرة يمكن رصد هذا التعارض. ما الذي يكشفه هذا التقابل؟",
    root: "ش ك ر",
    count: 1196,
    actions: ["browse", "note", "network"],
  },
];

export default function Discovery() {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("basira-notes");
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, []);

  const saveNote = (id: string, text: string) => {
    const updated = { ...notes, [id]: text };
    setNotes(updated);
    try {
      localStorage.setItem("basira-notes", JSON.stringify(updated));
    } catch {}
  };

  const toggleNote = (id: string) => {
    setOpenNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBrowse = (root: string) => {
    router.push(`/root-explorer?q=${encodeURIComponent(root)}`);
  };

  const handleNetwork = (root: string) => {
    router.push(`/self-reference?q=${encodeURIComponent(root)}`);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">وضع الاكتشاف</h1>
        <p className="text-zinc-400">
          بيئة استقرائية تعرض الأنماط والأدلة دون تقديم استنتاجات جاهزة.
        </p>
      </header>

      {/* How to use */}
      <div className="p-5 rounded-xl border border-teal-900/30 bg-teal-900/5">
        <h3 className="text-sm font-bold text-teal-400 mb-3">كيفية الاستخدام</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <span>
              <span className="text-zinc-200">استعرض الآيات:</span> يفتح محرك
              الجذور ويعرض جميع الآيات المرتبطة بهذا الجذر
            </span>
          </div>
          <div className="flex items-start gap-2">
            <PenLine className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <span>
              <span className="text-zinc-200">سجل ملاحظتك:</span> اكتب ما
              استنتجته — تُحفظ تلقائياً في متصفحك
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Network className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <span>
              <span className="text-zinc-200">ابحث في الشبكة:</span> يعرض
              خريطة الإحالات الدلالية لهذا المفهوم
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {discoveries.map((d) => (
          <div
            key={d.id}
            className={`p-6 rounded-2xl border ${
              d.active
                ? "border-teal-900/50 bg-teal-900/10"
                : "border-zinc-800 bg-zinc-900/30"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  d.active ? "bg-teal-500/20" : "bg-zinc-800"
                }`}
              >
                {d.icon === "lightbulb" ? (
                  <Lightbulb
                    className={`w-6 h-6 ${
                      d.active ? "text-teal-400" : "text-zinc-400"
                    }`}
                  />
                ) : (
                  <Compass
                    className={`w-6 h-6 ${
                      d.active ? "text-teal-400" : "text-zinc-400"
                    }`}
                  />
                )}
              </div>

              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-zinc-100">{d.title}</h3>
                  <span className="shrink-0 text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full font-amiri">
                    {d.root}
                  </span>
                </div>

                <p
                  className={`leading-relaxed ${
                    d.active ? "text-zinc-300" : "text-zinc-400"
                  }`}
                >
                  {d.body}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  {d.actions.includes("browse") && (
                    <button
                      onClick={() => handleBrowse(d.root)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      استعرض الآيات
                    </button>
                  )}
                  {d.actions.includes("note") && (
                    <button
                      onClick={() => toggleNote(d.id)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <PenLine className="w-4 h-4" />
                      سجل ملاحظتك
                      {openNotes.has(d.id) ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                  {d.actions.includes("network") && (
                    <button
                      onClick={() => handleNetwork(d.root)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Network className="w-4 h-4" />
                      ابحث في الشبكة
                    </button>
                  )}
                </div>

                {openNotes.has(d.id) && (
                  <div className="pt-2">
                    <textarea
                      value={notes[d.id] || ""}
                      onChange={(e) => saveNote(d.id, e.target.value)}
                      placeholder="اكتب ملاحظتك الاستقرائية هنا..."
                      rows={4}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-sm resize-none transition-all"
                    />
                    {notes[d.id] && (
                      <p className="text-xs text-teal-600 mt-1">
                        ✓ تم الحفظ تلقائياً
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
