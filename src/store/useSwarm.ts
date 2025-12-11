import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';

import {
  fetchSwarmStatus,
  fetchSwarmEvents,
  swarmSlice,
} from '../features/swarm/swarmSlice';

import GetSwarmPayload from '../features/swarm/GetSwarmPayload';

export const useSwarm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { healthy, status, recentEvents } = useSelector((state: RootState) => state.swarm);

  return {
    healthy,
    status,
    recentEvents,
    fetchSwarmStatus: (payload: GetSwarmPayload) => dispatch(fetchSwarmStatus(payload)),
    fetchSwarmEvents: (payload: GetSwarmPayload) => dispatch(fetchSwarmEvents(payload)),
    clearSwarmState: () => dispatch(swarmSlice.actions.clearSwarmState()),
  };
};