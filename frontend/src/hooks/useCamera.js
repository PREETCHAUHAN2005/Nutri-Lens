import { useState} from 'react';
import imageProcessor from '../utils/imageProcessor';

const useCamera = ({ onImageCapture}) => {
  const [processing, setProcessing] = useState(false);

  const processFile = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      const base64 = await imageProcessor.fileToBase64(file);
      const compressed = await imageProcessor.compressImage(base64);
      onImageCapture(compressed);
    } catch (err) {
      console.error("Image processing error", err);
      alert("Failed to process image");
    } finally {
      setProcessing(false);
    }
  };

  return { processing, processFile };
};

export default useCamera;