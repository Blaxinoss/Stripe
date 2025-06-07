import { createContext, ReactNode, useContext, useState } from 'react';

// النوع اللي هيتم تمريره داخل الـ context
type CoinsContextType = {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
};

// أنشئ context بنوع مبدئي
const ContextCoins = createContext < CoinsContextType | undefined > (undefined);

// نوع الـ props للكومبوننت
type Props = {
  children: ReactNode;
};

const CoinsContextProvider = ({ children }: Props) => {
  const [coins, setCoins] = useState(0);

  return (
    <ContextCoins.Provider value={{ coins, setCoins }}>
      {children}
    </ContextCoins.Provider>
  );
};

// كاستم هوك عشان تستخدم الـ context بسهولة وتتحقق إنه موجود
export const useCoins = () => {
  const context = useContext(ContextCoins);
  if (!context) throw new Error("useCoins must be used within CoinsContextProvider");
  return context;
};

export default CoinsContextProvider;
