import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchPersonnel } from '../services/personnelService';
import { Personnel } from '../types/personnel';

export const usePersonnel = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPersonnel = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPersonnel();
      setPersonnel(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load personnel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPersonnel();
  }, [loadPersonnel]);

  const counters = useMemo(() => {
    const inField = personnel.filter((item) => item.status === 'IN_FIELD').length;
    const atBase = personnel.filter((item) => item.status === 'AT_BASE').length;
    const offDuty = personnel.filter((item) => item.status === 'OFF_DUTY').length;

    return {
      total: personnel.length,
      inField,
      atBase,
      offDuty,
    };
  }, [personnel]);

  return {
    personnel,
    loading,
    error,
    counters,
    reload: loadPersonnel,
  };
};
