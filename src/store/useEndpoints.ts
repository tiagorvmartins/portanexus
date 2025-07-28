import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';

import {
  fetchEndpoints,
  getSelectedEndpoint,
  setSelectedEndpoint
} from '../features/endpoints/endpointsSlice';


export const useEndpoints = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { endpoints, selectedEndpointId } = useSelector((state: RootState) => state.endpoints);
  
  return {
    endpoints,
    selectedEndpointId,
    setSelectedEndpoint: (arg: string) => dispatch(setSelectedEndpoint(arg)),
    getSelectedEndpoint: () => dispatch(getSelectedEndpoint()),
    fetchEndpoints: () => dispatch(fetchEndpoints()),
  };
};