import { GitBranch, Activity } from "lucide-react";

export default function SelfReference() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الإحالة الذاتية</h1>
        <p className="text-zinc-400">استكشاف كيف يفسر القرآن نفسه بالقرآن من خلال شبكة المعاني والتباينات.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500" />
              مفهوم قيد الدراسة
            </h3>
            <div className="text-4xl font-amiri text-teal-400 mb-4 text-center">النُّور</div>
            <p className="text-sm text-zinc-400 leading-relaxed text-center">
              تم رصد 43 آية تساهم في بناء مفهوم النور، تتقاطع مع مفاهيم الهدى، الكتاب، والحياة.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-teal-500" />
              <h3 className="font-bold text-zinc-100">خريطة الإحالات الدلالية</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 font-medium">التعريف بالتباين (الظلمات)</div>
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="font-amiri text-xl text-zinc-200 leading-loose">
                    "اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ"
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 font-medium">الارتباط المعرفي (الكتاب)</div>
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <p className="font-amiri text-xl text-zinc-200 leading-loose">
                    "قَدْ جَاءَكُم مِّنَ اللَّهِ نُورٌ وَكِتَابٌ مُّبِينٌ"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
