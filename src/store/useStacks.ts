// src/hooks/useContainer.ts
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from './store';
import GetStacksPayload from 'src/types/GetStacksPayload';
import CreateStackPayload from 'src/types/CreateStackPayload';
import UpdateStackPayload from 'src/types/UpdateStackPayload';
import { fetchStacks, fetchStack, selectStacks, startStack, stopStack, restartStack, deleteStack, getStackFile, updateStack, createStack, stackSlice } from 'src/features/stacks/stacksSlice';

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

        deleteStack: (payload: { stackId: number; endpointId: number }) =>
            dispatch(deleteStack(payload)),

        getStackFile: (stackId: number) =>
            dispatch(getStackFile(stackId)),

        updateStack: (payload: UpdateStackPayload) =>
            dispatch(updateStack(payload)),

        createStack: (payload: CreateStackPayload) =>
            dispatch(createStack(payload)),

        clearStacksState: () => dispatch(stackSlice.actions.clearStacksState()),
    };
};
