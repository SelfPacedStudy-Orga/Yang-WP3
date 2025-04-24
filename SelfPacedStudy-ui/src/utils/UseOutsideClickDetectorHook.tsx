import {RefObject, useEffect} from 'react';

/**
 * A hook to detect if the user is clicking outside of the ChatBox so we can close it.
 * @param ref - ChatBox reference.
 * @param onOutsideClick - Called when user clicked outside.
 * @param excludedRefs - References to some components that are outside of the ChatBox but should not close the ChatBox when clicked.
 */
const useOutsideClickDetector = (
    ref: RefObject<HTMLElement>,
    onOutsideClick: () => void,
    excludedRefs?: RefObject<HTMLElement>[] // Array of refs to be excluded
) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node;

            // Check if the click is outside ref and all excludedRefs
            const isOutside = ref.current && !ref.current.contains(targetNode) &&
                (!excludedRefs || excludedRefs.every(excludedRef =>
                    !excludedRef.current || !excludedRef.current.contains(targetNode)));

            if (isOutside) {
                onOutsideClick();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, onOutsideClick, excludedRefs]);
};

export default useOutsideClickDetector;
