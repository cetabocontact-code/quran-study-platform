import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
          نظام استكشاف دلالي مبني بالكامل على مرجعية القرآن لنفسه، لاكتشاف الأنماط، الجذور، والسياقات بدون مرجعيات خارجية.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/root-explorer" className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-teal-500/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 flex items-center justify-between">
            محرك الجذور
            <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-teal-400 group-hover:-translate-x-1 transition-all" />
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            استكشف الجذور اللغوية الثلاثية وكيف تتطور دلالاتها بناءً على السياق والكلمات المجاورة في القرآن.
          </p>
        </Link>
        
        <Link href="/self-reference" className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-teal-500/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 flex items-center justify-between">
            الإحالة الذاتية
            <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-teal-400 group-hover:-translate-x-1 transition-all" />
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            شبكة من العلاقات الدلالية بين الآيات، تُظهر كيف يفسر القرآن نفسه من خلال التكرار والتباين.
          </p>
        </Link>

        <Link href="/discovery" className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-teal-500/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 flex items-center justify-between">
            وضع الاكتشاف
            <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-teal-400 group-hover:-translate-x-1 transition-all" />
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            محاور وبصائر تنبثق بشكل استقرائي من النص، تدفعك للتفكر والمقارنة بدلاً من تلقي استنتاجات جاهزة.
          </p>
        </Link>
      </div>
      
      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-teal-900/20 to-zinc-900 border border-teal-900/30">
        <h2 className="text-2xl font-amiri text-teal-400 mb-4 leading-loose">
          "أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا"
        </h2>
        <p className="text-zinc-300 leading-relaxed max-w-2xl">
          الهدف من هذه المنصة ليس تقديم أجوبة نهائية، بل توفير أدوات تمكنك من الغوص في بنية القرآن واكتشاف معماريته الداخلية عبر دراسة الجذور والأنماط المعرفية.
        </p>
      </div>
    </div>
  );
}
