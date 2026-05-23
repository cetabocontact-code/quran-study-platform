import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const verifiedRoots = [
  { root: "ن و ر", name: "نور", count: 4383, href: "/root-explorer?q=%D9%86%20%D9%88%20%D8%B1" },
  { root: "ع ق ل", name: "عقل", count: 2813, href: "/root-explorer?q=%D8%B9%20%D9%82%20%D9%84" },
  { root: "ك ت ب", name: "كتاب", count: 2856, href: "/root-explorer?q=%D9%83%20%D8%AA%20%D8%A8" },
  { root: "ق ل ب", name: "قلب", count: 2979, href: "/root-explorer?q=%D9%82%20%D9%84%20%D8%A8" },
  { root: "ر ح م", name: "رحمة", count: 2248, href: "/root-explorer?q=%D8%B1%20%D8%AD%20%D9%85" },
  { root: "ن ف س", name: "نفس", count: 2485, href: "/root-explorer?q=%D9%86%20%D9%81%20%D8%B3" },
  { root: "ح ك م", name: "حكمة", count: 2017, href: "/root-explorer?q=%D8%AD%20%D9%83%20%D9%85" },
  { root: "ش ك ر", name: "شكر", count: 1196, href: "/root-explorer?q=%D8%B4%20%D9%83%20%D8%B1" },
  { root: "س ل م", name: "سلام", count: 3206, href: "/root-explorer?q=%D8%B3%20%D9%84%20%D9%85" },
  { root: "حمار", name: "بحث مباشر", count: 2, href: "/root-explorer?q=%D8%AD%D9%85%D8%A7%D8%B1" },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-sm text-teal-400 font-medium">
          مرحلة تجريبية (Beta)
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 leading-tight">
          منصة دراسة القرآن الكريم ذاتياً
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed">
          نظام استكشاف دلالي مبني بالكامل على مرجعية القرآن لنفسه، لاكتشاف
          الأنماط، الجذور، والسياقات بدون مرجعيات خارجية.
        </p>
      </header>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/root-explorer"
          className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-teal-500/50 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 flex items-center justify-between">
            محرك الجذور
            <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-teal-400 group-hover:-translate-x-1 transition-all" />
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            استكشف الجذور اللغوية الثلاثية وكيف تتطور دلالاتها بناءً على
            السياق والكلمات المجاورة في القرآن.
          </p>
        </Link>

        <Link
          href="/self-reference"
          className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-teal-500/50 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 flex items-center justify-between">
            الإحالة الذاتية
            <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-teal-400 group-hover:-translate-x-1 transition-all" />
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            شبكة من العلاقات الدلالية بين الآيات، تُظهر كيف يفسر القرآن نفسه
            من خلال التكرار والتباين.
          </p>
        </Link>

        <Link
          href="/discovery"
          className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-teal-500/50 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 flex items-center justify-between">
            وضع الاكتشاف
            <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-teal-400 group-hover:-translate-x-1 transition-all" />
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            محاور وبصائر تنبثق بشكل استقرائي من النص، تدفعك للتفكر والمقارنة
            بدلاً من تلقي استنتاجات جاهزة.
          </p>
        </Link>
      </div>

      {/* Verified tested roots */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 mb-1">
            جذور مختبرة — ابدأ من هنا
          </h2>
          <p className="text-sm text-zinc-500">
            هذه الجذور تم اختبارها فعلياً على محرك البحث. انقر على أي منها
            للانتقال مباشرةً إلى نتائجه.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {verifiedRoots.map((item) => (
            <Link
              key={item.root}
              href={item.href}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-teal-500/50 hover:bg-zinc-800/50 transition-all group text-center"
            >
              <div className="text-xl font-amiri text-teal-400 group-hover:text-teal-300 mb-1">
                {item.root}
              </div>
              <div className="text-xs text-zinc-500">{item.name}</div>
              <div className="text-xs text-zinc-600 mt-1 tabular-nums">
                {item.count.toLocaleString("ar-EG")} نتيجة
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quranic verse */}
      <div className="mt-4 p-8 rounded-2xl bg-gradient-to-br from-teal-900/20 to-zinc-900 border border-teal-900/30">
        <h2 className="text-2xl font-amiri text-teal-400 mb-4 leading-loose">
          "أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا"
        </h2>
        <p className="text-zinc-300 leading-relaxed max-w-2xl">
          الهدف من هذه المنصة ليس تقديم أجوبة نهائية، بل توفير أدوات تمكنك من
          الغوص في بنية القرآن واكتشاف معماريته الداخلية عبر دراسة الجذور
          والأنماط المعرفية.
        </p>
      </div>
    </div>
  );
}
