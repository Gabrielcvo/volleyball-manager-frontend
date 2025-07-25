import { useEffect } from "react";
import { useAlert } from "../app/context/alertContext";
import { setToastFunction } from "../services/config/api";
import { setToastFunctionPublic } from "../services/config/apiPublic";

export const useApiToast = () => {
  const { showAlert } = useAlert();

  useEffect(() => {
    setToastFunction(showAlert);
    setToastFunctionPublic(showAlert);
  }, [showAlert]);
};
