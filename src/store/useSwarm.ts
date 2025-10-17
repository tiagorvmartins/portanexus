import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';

import {
  fetchSwarmStatus,
} from '../features/swarm/swarmSlice';

import {
  GetSwarmPayload,
} from '../features/swarm/GetSwarmPayload';

export const useSwarm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { healthy, status } = useSelector((state: RootState) => state.swarm);

  return {
    healthy,
    status,
    fetchSwarmStatus: (payload: GetSwarmPayload) => dispatch(fetchSwarmStatus(payload)),
  };
};