import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// custom hooks for OCR API state
export const useOCRApiState = () => {
  const ocrApiState = useAppSelector((state) => state.ocrApiState);
  const dispatch = useAppDispatch();
  
  return {
    ...ocrApiState,
    dispatch,
  };
};