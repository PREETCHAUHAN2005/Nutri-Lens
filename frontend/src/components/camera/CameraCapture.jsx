import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import useCamera from '../../hooks/useCamera';

const CameraCapture = ({ onImageCapture, onCancel }) => {
  const fileInputRef = useRef(null);
  const { processing, processFile } = useCamera({ onImageCapture, onCancel });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800">Scan Ingredients</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {processing ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Processing image...</p>
            </div>
          ) : (
            <>
              {/* Camera Input (Hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => processFile(e.target.files[0])}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-primary-200"
              >
                <Camera size={24} />
                Take Photo
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or upload</span></div>
              </div>

              <div className="grid grid-cols-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload from gallery</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => processFile(e.target.files[0])}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;