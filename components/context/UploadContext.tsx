// UploadContext.tsx
import React, { createContext, useContext, useState } from "react";

type UploadContextType = {
  uploadCompleted: boolean;
  setUploadCompleted: React.Dispatch<React.SetStateAction<boolean>>;
};

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [uploadCompleted, setUploadCompleted] = useState(false);

  return (
    <UploadContext.Provider value={{ uploadCompleted, setUploadCompleted }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) throw new Error("useUpload must be used within UploadProvider");
  return context;
};
