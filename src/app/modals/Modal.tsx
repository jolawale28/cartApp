import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

/**
 * A custom hook that provides modal state management
 * 
 * @returns {Object} Modal controls and state
 */
export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    const toggleModal = () => setIsOpen(prev => !prev);

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal,
        Modal: ({ children, ...props }: ModalProps) => (
            <Modal isOpen={isOpen} onClose={closeModal} {...props}>
                {children}
            </Modal>
        )
    };
};

interface ModalProps {
    children: React.ReactNode;
    title: string;
    overlayClassName?: string;
    modalClassName?: string;
    closeButtonClassName?: string;
    disableClickOutsideToClose?: boolean;
    overlayAnimation?: object;
    modalAnimation?: object;
}

/**
 * The Modal component (used internally by the hook)
 */
const Modal = ({
    isOpen,
    onClose,
    children,
    title,
    overlayClassName = '',
    modalClassName = '',
    closeButtonClassName = '',
    disableClickOutsideToClose = false,
    overlayAnimation = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    modalAnimation = {
        initial: { translateY: -100, opacity: 0 },
        animate: { translateY: 0, opacity: 1 },
        exit: { translateY: -100, opacity: 0 }
    }
}: ModalProps & { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {
                isOpen && (
                    <motion.div
                        className={`fixed inset-0 bg-gray-100/10 backdrop-blur-xs z-50 flex items-center justify-center ${overlayClassName}`}
                        onClick={disableClickOutsideToClose ? undefined : onClose}
                        role="dialog"
                        aria-modal="true"

                        {...overlayAnimation}
                    >
                        <div
                            className={`bg-white p-6 rounded-lg shadow-lg relative max-w-[90vw] max-h-[90vh] overflow-y-scroll ${modalClassName}`}
                            onClick={(e) => e.stopPropagation()}
                            {...modalAnimation}
                        >
                            <div className='flex justify-between item-center mb-5 border-b pb-3 border-b-gray-100'>
                                <div className='font-bold text-lg'>{title}</div>
                                <button type="button"
                                    onClick={onClose}
                                    className={`text-gray-500 hover:text-gray-700 text-2xl ${closeButtonClassName}`}
                                    aria-label="Close modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {children}
                        </div>
                    </motion.div>
                )
            }
        </AnimatePresence>,
        document.body
    );
};

// Usage Example:
// const { Modal, isOpen, openModal, closeModal } = useModal();
// <button onClick={openModal}>Open</button>
// <Modal>Your content here</Modal>