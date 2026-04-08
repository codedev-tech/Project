import { MOCK_PERSONNEL } from '../data/mockPersonnel';
import { Personnel } from '../types/personnel';

const simulateDelay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const fetchPersonnel = async (): Promise<Personnel[]> => {
  await simulateDelay(500);
  return MOCK_PERSONNEL;
};
