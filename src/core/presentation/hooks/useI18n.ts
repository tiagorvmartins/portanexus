import { useMemo } from "react";
import { coreModuleContainer } from "../../CoreModule";
import I18n from "src/core/presentation/i18n";

export const useI18n = () => {
  const i18n = useMemo(() => {
    return coreModuleContainer.getProvided(I18n);
  }, []);

  return i18n;
};
