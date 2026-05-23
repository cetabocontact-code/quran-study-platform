import { Compass, Lightbulb } from "lucide-react";

export default function Discovery() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">وضع الاكتشاف</h1>
        <p className="text-zinc-400">بيئة استقرائية تعرض الأنماط والأدلة دون تقديم استنتاجات جاهزة.</p>
      </header>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl border border-teal-900/50 bg-teal-900/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Lightbulb className="w-6 h-6 text-teal-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-zinc-100">اكتشاف نمط دلالي: السلطة والمُلك</h3>
              <p className="text-zinc-300 leading-relaxed">
                في 12 آية مختلفة، يظهر جذر (م ل ك) في سياقات تتحدث عن المساءلة أكثر من الحديث عن الاستحقاق. ما هو الرابط الذي تستنتجه بين المُلك والمسؤولية في الخطاب القرآني؟
              </p>
              <div className="flex gap-3 pt-2">
                <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors">
                  استعرض الآيات
                </button>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition-colors">
                  سجل ملاحظتك
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 rounded-xl">
              <Compass className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-zinc-100">تتبع مفاهيمي: تقوى</h3>
              <p className="text-zinc-400 leading-relaxed">
                مفهوم "التقوى" لا يُعرّف بآية واحدة، بل يُبنى عبر أمثلة، سلوكيات، ومآلات. النظام قام بتجميع 258 آية تشكل خريطة هذا المفهوم.
              </p>
              <div className="flex gap-3 pt-2">
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition-colors">
                  ابحث في الشبكة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
