import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createDevelopmentMapPersonnel,
  isMapPreviewAvailable,
  MOCK_MAP_UPDATE_INTERVAL_MS,
} from '../../utils/mockMapPersonnel';

export function useDevelopmentMapPersonnel(isFocused: boolean) {
  const available = isMapPreviewAvailable();
  const [requested, setRequested] = useState(false);
  const [update, setUpdate] = useState(() => ({ tick: 0, recordedAt: new Date().toISOString() }));
  const enabled = available && requested;
  const toggle = useCallback(() => {
    if (!available) return;
    setUpdate({ tick: 0, recordedAt: new Date().toISOString() });
    setRequested((current) => !current);
  }, [available]);

  useEffect(() => {
    if (!enabled || !isFocused) return;
    const timer = setInterval(() => {
      setUpdate((current) => ({ tick: current.tick + 1, recordedAt: new Date().toISOString() }));
    }, MOCK_MAP_UPDATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, isFocused]);

  const personnel = useMemo(() => enabled ? createDevelopmentMapPersonnel(update) : [], [enabled, update]);
  return { available, enabled, toggle, personnel };
}
