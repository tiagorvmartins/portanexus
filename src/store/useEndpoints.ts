import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';

import {
  fetchEndpoints,
  getSelectedEndpoint,
  setSelectedEndpoint,
  setSelectedSwarmId
} from '../features/endpoints/endpointsSlice';


export const useEndpoints = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { endpoints, selectedEndpointId, selectedSwarmId } = useSelector((state: RootState) => state.endpoints);
  
  return {
    endpoints,
    selectedEndpointId,
    selectedSwarmId,
    setSelectedEndpoint: (arg: string) => dispatch(setSelectedEndpoint(arg)),
    setSelectedSwarmId: (arg: string) => dispatch(setSelectedSwarmId(arg)),
    getSelectedEndpoint: () => dispatch(getSelectedEndpoint()),
    fetchEndpoints: () => dispatch(fetchEndpoints()),
  };
};