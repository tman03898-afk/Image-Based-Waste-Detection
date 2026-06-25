import React, { useState, useRef } from 'react';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  // Global Stats
  const [stats, setStats] = useState({
    accuracy: 0,
    processed: 0,
    scanTime: 0
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target.result);
    reader.readAsDataURL(file);

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://thanhman1234-ecovision-api.hf.space/predict', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (data.success) {
        setResults({
          detections: data.detections
        });
        
        setSelectedImage(`data:image/jpeg;base64,${data.image_base64}`);

        const avgAcc = data.detections.length > 0 
          ? data.detections.reduce((acc, curr) => acc + curr.confidence, 0) / data.detections.length 
          : 0;

        setStats({
          accuracy: avgAcc > 0 ? (avgAcc * 100).toFixed(1) : 0,
          processed: data.detections.length,
          scanTime: data.process_time
        });
      } else {
        alert("Có lỗi xảy ra từ máy chủ!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối đến Backend!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setResults(null);
    setStats({ accuracy: 0, processed: 0, scanTime: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper for translating classes
  const getIconAndName = (className) => {
    const cls = className.toLowerCase();
    if (cls.includes('paper')) return { icon: '📄', vi: 'Giấy' };
    if (cls.includes('plastic')) return { icon: '🥤', vi: 'Nhựa' };
    if (cls.includes('cap')) return { icon: '🍾', vi: 'Nắp chai' };
    if (cls.includes('shell')) return { icon: '🐚', vi: 'Vỏ' };
    return { icon: '📦', vi: className };
  };

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-300 font-sans overflow-hidden">
      
      {/* Sidebar - Robot Dashboard Style */}
      <aside className="w-72 border-r border-indigo-900/30 bg-[#0a0f1c]/80 backdrop-blur-xl flex flex-col hidden md:flex z-20">
        <div className="h-24 flex items-center px-8 border-b border-indigo-900/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <div>
              <span className="block text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent tracking-widest uppercase">EcoVision AI</span>
              <span className="block text-[10px] text-cyan-400/70 uppercase tracking-widest mt-1">Indoor Waste Detection</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold text-indigo-400/70 uppercase tracking-widest mb-4">Thông tin Model</h4>
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 text-sm leading-relaxed text-slate-400">
                <p>Được tinh chỉnh (Fine-tuned) từ mô hình <span className="text-blue-400 font-semibold">YOLO26</span> mới nhất của Ultralytics. Dataset phân giải 1280x720 được tối ưu cho <span className="text-white font-medium">hệ thống nhận diện rác thải</span> trong không gian công cộng.</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-indigo-400/70 uppercase tracking-widest mb-4">Phân Loại Hỗ Trợ (4)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-xl">📄</span><span className="text-sm font-medium text-slate-300">Giấy</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-xl">🥤</span><span className="text-sm font-medium text-slate-300">Nhựa</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-xl">🍾</span><span className="text-sm font-medium text-slate-300">Nắp chai</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-xl">🐚</span><span className="text-sm font-medium text-slate-300">Vỏ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-indigo-900/30">
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            System Online (best.pt)
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden">
        {/* Futuristic Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

        {/* Dashboard Content */}
        <div className="p-8 max-w-[1400px] mx-auto w-full space-y-8 z-10">
          
          {/* Header & Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 flex flex-col justify-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Bảng Điều Khiển</h2>
              <p className="text-blue-400/80 text-sm">Phân loại rác thải tự động qua hình ảnh</p>
            </div>

            <div className="lg:col-span-3 grid grid-cols-3 gap-4">
              <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-blue-500/20 shadow-[0_4px_20px_rgba(59,130,246,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Độ Chính Xác</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-black text-white">{stats.accuracy}</h3>
                  <span className="text-blue-400 font-bold">%</span>
                </div>
              </div>
              
              <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Đã Phát Hiện</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-black text-white">{stats.processed}</h3>
                  <span className="text-indigo-400 font-bold">mục</span>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-violet-500/20 shadow-[0_4px_20px_rgba(139,92,246,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Độ Trễ Phân Tích</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-black text-white">{stats.scanTime}</h3>
                  <span className="text-violet-400 font-bold">giây</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Camera View */}
            <div className="xl:col-span-2">
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative flex flex-col h-[650px]">
                
                {/* Panel Header */}
                <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <h3 className="font-semibold text-white tracking-wide text-sm">CAMERA INPUT</h3>
                  </div>
                  {selectedImage && (
                    <button onClick={resetAll} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-all font-bold tracking-wider uppercase">
                      Xóa Dữ Liệu
                    </button>
                  )}
                </div>

                {/* Dropzone */}
                <div className="flex-1 relative flex items-center justify-center p-6 bg-black/40">
                  {!selectedImage ? (
                    <div 
                      className={`w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-blue-400 hover:bg-slate-800/30'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileInput} accept="image/*" className="hidden" />
                      
                      <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Tải Ảnh Môi Trường Lên</h3>
                      <p className="text-slate-500 text-sm">Hệ thống AI sẽ phân tích rác thải trong ảnh</p>
                    </div>
                  ) : (
                    <div className="w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center group">
                      {/* Grid Overlay for Robotic feel */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10"></div>
                      
                      <img src={selectedImage} alt="Uploaded" className="max-w-full max-h-full object-contain relative z-0" />
                      
                      {/* Scanning Animation */}
                      {isLoading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                          <div className="relative w-40 h-40 flex items-center justify-center">
                            <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-4 border-r-4 border-indigo-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                            <div className="absolute inset-8 border-b-4 border-violet-400 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                          </div>
                          <h3 className="text-xl font-bold text-white mt-6 tracking-[0.2em] uppercase">Đang quét môi trường...</h3>
                        </div>
                      )}

                      {/* Laser scan line effect */}
                      {isLoading && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite] z-30"></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Diagnostics Panel */}
            <div className="space-y-6">
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col h-[650px]">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-black/20">
                  <h3 className="font-semibold text-white tracking-wide text-sm uppercase flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                    Báo Cáo Phân Tích
                  </h3>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  {!selectedImage ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                      <p className="text-sm">Chờ dữ liệu hình ảnh đầu vào...</p>
                    </div>
                  ) : isLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-24 bg-slate-800/30 rounded-2xl border border-slate-700/30 animate-pulse"></div>
                      ))}
                    </div>
                  ) : results ? (
                    <div className="space-y-4">
                      {results.detections.length === 0 && (
                        <div className="p-6 text-center border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
                          <h4 className="text-emerald-400 font-bold text-lg mb-1">Môi trường an toàn</h4>
                          <p className="text-sm text-slate-400">Không phát hiện rác thải trên đường đi.</p>
                        </div>
                      )}
                      
                      {results.detections.map((det, idx) => {
                        const { icon, vi } = getIconAndName(det.class);
                        return (
                          <div key={idx} className="relative overflow-hidden p-4 rounded-2xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition-colors">
                            <div className={`absolute top-0 left-0 w-1 h-full ${det.bg.replace('bg-', 'bg-').replace('/10', '')} opacity-80`}></div>
                            <div className="flex items-center justify-between pl-3">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl shadow-inner border border-slate-700">
                                  {icon}
                                </div>
                                <div>
                                  <h4 className="font-bold text-white uppercase tracking-wide text-sm">{vi}</h4>
                                  <p className="text-xs text-slate-400 mt-1 font-mono">Raw: {det.class}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Độ Tin Cậy</span>
                                <div className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-sm font-black text-white">
                                  {Math.round(det.confidence * 100)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}

export default App;
