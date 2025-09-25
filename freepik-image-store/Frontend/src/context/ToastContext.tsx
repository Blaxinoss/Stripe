import { createContext, ReactNode, useContext } from 'react';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ToastMessage = {
  message: string;
  delay?: number;
  type?: 'info' | 'success' | 'warn' | 'error';
};

type ToastContextType = {
  showToast: (msg: ToastMessage) => void;
};

const ContexToast = createContext<ToastContextType | undefined>(undefined);

type Props = { children: ReactNode };

const ToastProvider = ({ children }: Props) => {

  const showToast = ({ message, type = 'info', delay = 3000 }: ToastMessage) => {
    switch(type){
      case 'success': toast.success(message, { autoClose: delay }); break;
      case 'error': toast.error(message, { autoClose: delay }); break;
      case 'warn': toast.warn(message, { autoClose: delay }); break;
      default: toast.info(message, { autoClose: delay });
    }
  };

  return (
    <ContexToast.Provider value={{ showToast }}>
      {children}
    </ContexToast.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ContexToast);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export default ToastProvider;
