/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um número para string com casas decimais
 * Trata valores null/undefined/string convertendo para número
 */
export const formatNumber = (
  value: any,
  decimals = 1,
  defaultValue = 0
): string => {
  if (value === null || value === undefined || value === "") {
    return defaultValue.toFixed(decimals);
  }

  const num = typeof value === "number" ? value : parseFloat(value);
  return isNaN(num) ? defaultValue.toFixed(decimals) : num.toFixed(decimals);
};

/**
 * Formata um número inteiro para string
 * Trata valores null/undefined/string convertendo para número
 */
export const formatInteger = (value: any, defaultValue = 0): string => {
  if (value === null || value === undefined || value === "") {
    return defaultValue.toString();
  }

  const num = typeof value === "number" ? value : parseInt(value);
  return isNaN(num) ? defaultValue.toString() : num.toString();
};

/**
 * Formata um valor percentual
 */
export const formatPercentage = (value: any, defaultValue = 0): string => {
  return `${formatNumber(value, 1, defaultValue)}%`;
};

/**
 * Formata um valor monetário em R$
 */
export const formatCurrency = (value: any, defaultValue = 0): string => {
  const num =
    typeof value === "number" ? value : parseFloat(value) || defaultValue;
  return `R$ ${num.toFixed(2).replace(".", ",")}`;
};

/**
 * Formata data para exibição em português
 */
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
) => {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleDateString("pt-BR", options || defaultOptions);
};

/**
 * Formata apenas a data (sem hora)
 */
export const formatDateOnly = (dateString: string) => {
  return formatDate(dateString, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Formata apenas a hora
 */
export const formatTimeOnly = (dateString: string) => {
  return formatDate(dateString, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formata duração em minutos para formato HH:mm
 * Ex: 90 minutos -> "01:30"
 * Ex: 45 minutos -> "00:45"
 */
export const formatDuration = (minutes: any, defaultValue = 0): string => {
  if (minutes === null || minutes === undefined || minutes === "") {
    minutes = defaultValue;
  }

  const num = typeof minutes === "number" ? minutes : parseInt(minutes);
  const totalMinutes = isNaN(num) ? defaultValue : num;

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
};
