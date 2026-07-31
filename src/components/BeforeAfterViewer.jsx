import React, { useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, ArrowRightLeft, ZoomIn } from 'lucide-react';

export function BeforeAfterViewer({ beforeImageUrl, afterImageUrl }) {
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'before' | 'after'
  const [zoomImage, setZoomImage] = useState(null);

  if (!beforeImageUrl && !afterImageUrl) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
        <Camera className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
        <p className="text-xs text-slate-600 font-semibold">No repair verification photos uploaded yet.</p>
        <p className="text-[11px] text-slate-400 mt-1">Staff will attach Before & After repair inspection photos during resolution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
          Module 8: Before & After Repair Proof
        </h4>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab('before')}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'before' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Before Only
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'after' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            After Only
          </button>
        </div>
      </div>

      {/* Grid Image Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before Image Card */}
        {(activeTab === 'split' || activeTab === 'before') && (
          <div className="relative group rounded-2xl overflow-hidden border border-amber-300 bg-white shadow-sm">
            <div className="absolute top-3 left-3 z-10 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow">
              <AlertCircle className="w-3.5 h-3.5" />
              Before Repair
            </div>
            {beforeImageUrl ? (
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                  src={beforeImageUrl}
                  alt="Before Repair Inspection"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => setZoomImage(beforeImageUrl)}
                  className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-slate-900 border border-slate-200 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
                  title="Expand"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-slate-400 text-xs italic bg-slate-50">
                No Before-Repair Image Attached
              </div>
            )}
          </div>
        )}

        {/* After Image Card */}
        {(activeTab === 'split' || activeTab === 'after') && (
          <div className="relative group rounded-2xl overflow-hidden border border-emerald-300 bg-white shadow-sm">
            <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
              After Repair (Resolved)
            </div>
            {afterImageUrl ? (
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                  src={afterImageUrl}
                  alt="After Repair Resolution"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => setZoomImage(afterImageUrl)}
                  className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-slate-900 border border-slate-200 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
                  title="Expand"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-slate-400 text-xs italic bg-slate-50">
                No After-Repair Proof Uploaded Yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-4xl w-full">
            <img src={zoomImage} alt="Expanded View" className="w-full max-h-[85vh] object-contain rounded-2xl border border-slate-200 shadow-2xl bg-white" />
            <button className="absolute -top-10 right-0 text-white font-bold text-sm">
              Click anywhere to close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
