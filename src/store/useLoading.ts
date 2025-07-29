import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { addLoadingComponent, removeLoadingComponent } from '../features/loading/loadingSlice';

export const useLoading = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingComponentsAmount } = useSelector((state: RootState) => state.loading);
  
  return {
    loadingComponentsAmount,
    addLoadingComponent: () => dispatch(addLoadingComponent()),
    removeLoadingComponent: () => dispatch(removeLoadingComponent())
  };
};