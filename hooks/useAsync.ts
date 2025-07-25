import { useCallback, useEffect, useRef, useState } from 'react';

type TStatusPromise = 'idle' | 'loading' | 'success' | 'error';

export default function useAsync<
  T,
  E = Error,
  Args extends unknown[] = unknown[]
>(asyncFunction: (...args: Args) => Promise<T>) {
  const [status, setStatus] = useState<TStatusPromise>('idle');
  const [value, setValue] = useState<T>();
  const [error, setError] = useState<E>();
  const mounted = useRef(true);
  /*
   * A função execute contém a asyncFunction e trata os
   * Estados de status, valor e error
   * UseCallback garante que a função não dispare o useEffect
   * A cada render, apenas quando asyncFunction mudar
   */
  const execute = useCallback(
    async (...args: Args) => {
      const func = asyncFunction;

      setStatus('loading');
      setError(undefined);
      const promise = func(...args);
      // Foi divido assim para poder aplicar then() e catch direto da função principal
      promise
        .then((response) => {
          if (mounted.current) {
            setValue(response);
            setStatus('success');
          }
        })
        .catch((promiseError) => {
          if (mounted.current) {
            setError(promiseError);
            setStatus('error');
          }
        });

      return promise;
    },
    [asyncFunction]
  );

  const resetData = useCallback(() => {
    setValue(undefined);
    setStatus('idle');
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    execute,
    status,
    value,
    error,
    loading: status === 'loading',
    resetData,
  };
}
