import { useState, useCallback, useRef, useEffect } from 'react';
import { useInvis } from '../context/InvisContext';

export const usePipSync = () => {
    const { isMediaPipMode, setIsMediaPipMode, showPipModal, setShowPipModal } = useInvis();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const togglePipMode = useCallback((forceState?: boolean) => {
        setIsTransitioning(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const newState = forceState !== undefined ? forceState : !isMediaPipMode;
        
        // Mark state transition
        setIsMediaPipMode(newState);
        if (!newState) setShowPipModal(false);
        
        timeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
    }, [isMediaPipMode, setIsMediaPipMode, setShowPipModal]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return {
        isMediaPipMode,
        togglePipMode,
        isTransitioning,
        showPipModal,
        setShowPipModal
    };
};
