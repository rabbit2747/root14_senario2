import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './AnimationPresets';

/**
 * GlossarySidebar — 택틱별 실시간 용어 사전
 * 현재 step에 따라 관련 용어가 자동 등장/퇴장
 *
 * @param {{ glossary: Object, activeTermKeys: string[], title: string }} props
 */
export default function GlossarySidebar({ glossary, activeTermKeys, title = 'Dictionary' }) {
  return (
    <aside className="w-full xl:w-[280px] bg-white border-l border-slate-200 flex flex-col z-20 shrink-0 relative overflow-hidden border-t xl:border-t-0">
      <div className="h-10 sm:h-14 lg:h-20 flex items-center px-4 sm:px-6 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-2 text-blue-600">
          <Icons.Book />
          <h2 className="text-[11px] font-black tracking-widest uppercase">{title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 z-10 bg-slate-50/30">
        <AnimatePresence>
          {activeTermKeys.map((key) => {
            const item = glossary[key];
            if (!item) return null;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-4"
              >
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="border-b border-slate-100 pb-2 mb-3">
                    <h4 className="text-[13px] font-black text-slate-800">{item.term}</h4>
                    <p className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">{item.fullName}</p>
                  </div>
                  <div className="mb-3">
                    <span className="inline-block bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded mb-2">{item.analogy}</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed text-justify">{item.easyDesc}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                      <Icons.Shield /> Tech Note
                    </span>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium text-justify">{item.techDesc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </aside>
  );
}
