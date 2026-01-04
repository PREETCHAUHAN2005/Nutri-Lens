import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, startConversation, clearConversation } from '../redux/slices/chatSlice';

const useConversation = () => {
  const dispatch = useDispatch();
  const { currentConversation, messages, loading, sending } = useSelector((state) => state.chat);

  const initChat = async (analysisId) => {
    return dispatch(startConversation(analysisId));
  };

  const sendMsg = async (conversationId, text) => {
    return dispatch(sendMessage({ conversationId, message: text }));
  };

  const resetChat = () => {
    dispatch(clearConversation());
  };

  return {
    conversationId: currentConversation?.conversationId,
    messages,
    isLoading: loading,
    isSending: sending,
    initChat,
    sendMsg,
    resetChat
  };
};

export default useConversation;