// src/hooks/useContainer.ts
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from './store';
import GetStacksPayload from 'src/types/GetStacksPayload';
import { fetchStacks, fetchStack, selectStacks, startStack, stopStack, restartStack } from 'src/features/stacks/stacksSlice';

export const useStacks = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stacks, stacksRunning, stacksStopped } = useSelector(selectStacks);

    return {
        stacks,
        stacksRunning,
        stacksStopped,

        // Async dispatchers
        fetchStacks: (payload: GetStacksPayload) =>
            dispatch(fetchStacks(payload)),

        fetchStack: (payload: GetStacksPayload) =>
            dispatch(fetchStack(payload)),

        startStack: (payload: GetStacksPayload) =>
            dispatch(startStack(payload)),

        stopStack: (payload: GetStacksPayload) =>
            dispatch(stopStack(payload)),

        restartStack: (payload: GetStacksPayload) =>
            dispatch(restartStack(payload)),
    };
};
