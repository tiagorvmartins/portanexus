// src/hooks/useContainer.ts
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchContainers,
  fetchContainerLogs,
  fetchContainerStats,
  startContainer,
  stopContainer,
  selectContainers,
  fetchSingleContainer,
  setSelectedContainer,
  countContainersRunning,
} from '../features/container/containerSlice';
import { AppDispatch } from './store';
import GetContainersPayload from 'src/types/GetContainersPayload';
import ControlContainerPayload from 'src/types/ControlContainerPayload';
import GetContainerStatsPayload from 'src/types/GetStatsPayload';
import GetContainerLogsPayload from 'src/types/GetContainerLogsPayload';
import ContainerEntity from 'src/types/ContainerEntity';

export const useContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedContainer, containers, containerLogsMap, count, countRunning } = useSelector(selectContainers);

  const getLogsById = useCallback(
    (containerId: string) => containerLogsMap[containerId] || [],
    [containerLogsMap]
  );

  return {
    selectedContainer,
    containers,
    count,
    countRunning,
    getLogsById,
    setSelectedContainer: (arg: ContainerEntity) => dispatch(setSelectedContainer(arg)),

    // Async dispatchers
    fetchContainers: (payload: GetContainersPayload) =>
      dispatch(fetchContainers(payload)),

    countContainersRunning: (payload: GetContainersPayload) => 
      dispatch(countContainersRunning(payload)),

    fetchSingleContainer: (payload: GetContainersPayload) =>
      dispatch(fetchSingleContainer(payload)),

    fetchContainerLogs: (payload: GetContainerLogsPayload) =>
      dispatch(fetchContainerLogs(payload)),

    fetchContainerStats: (payload: GetContainerStatsPayload) =>
      dispatch(fetchContainerStats(payload)),

    startContainer: (payload: ControlContainerPayload) =>
      dispatch(startContainer(payload)),

    stopContainer: (payload: ControlContainerPayload) =>
      dispatch(stopContainer(payload)),
  };
};
