import { useDispatch, useSelector } from 'react-redux';
import { RootState, selectSettings } from './store';

import {
  toggleTheme,
  setLogsSince,
  setLogsInterval,
  setLogsMaxLines,
  setContainerOrderBy,
  setStackOrderBy,
  setTheme
} from '../features/settings/settingsSlice';
import { PayloadAction } from '@reduxjs/toolkit';


export const useSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  
  return {
    ...settings,
    toggleTheme: () => { dispatch(toggleTheme()); },
    setTheme: (value: string) => { dispatch(setTheme(value))},
    setLogsSince: (value: number) => { dispatch(setLogsSince(value)); },
    setLogsInterval: (value: number) => { dispatch(setLogsInterval(value)); },
    setLogsMaxLines: (value: number) => { dispatch(setLogsMaxLines(value)); },
    setContainerOrderBy: (value: string | null) => { dispatch(setContainerOrderBy(value)); },
    setStackOrderBy: (value: string | null) => {  dispatch(setStackOrderBy(value)); },
  };
};