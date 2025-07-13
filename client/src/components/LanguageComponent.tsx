// LanguageComponent.tsx
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

const LanguageComponent: React.FC = () => {
  const language = useSelector((state: RootState) => state.settings.language);

  return (
    <div>
      <h1>השפה הנוכחית: {language}</h1>
    </div>
  );
};

export default LanguageComponent;
