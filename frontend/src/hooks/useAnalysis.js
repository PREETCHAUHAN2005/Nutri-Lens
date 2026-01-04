import { useSelector, useDispatch } from 'react-redux';
import { analyzeImage, clearCurrentAnalysis } from '../redux/slices/analysisSlice';

const useAnalysis = () => {
  const dispatch = useDispatch();
  const { currentAnalysis, analyzing, error } = useSelector((state) => state.analysis);

  const startAnalysis = async (imageData) => {
    return dispatch(analyzeImage(imageData));
  };

  const resetAnalysis = () => {
    dispatch(clearCurrentAnalysis());
  };

  return {
    analysis: currentAnalysis,
    isAnalyzing: analyzing,
    error,
    startAnalysis,
    resetAnalysis
  };
};

export default useAnalysis;