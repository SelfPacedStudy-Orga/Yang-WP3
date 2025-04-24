// CustomAlertModal.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { handleRedirect } from './ClassroomToolbar'; // Adjust the path as necessary

interface CustomAlertModalProps {
    open: boolean;
    onClose: () => void;
    userId: string;
    fromExperiment: boolean;
    isControlGroup: boolean;
    shouldHideChatbox: boolean;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ open, onClose, userId, fromExperiment, isControlGroup,shouldHideChatbox }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="modal-title" variant="h6" component="h2">
                    Did you fill in the questionnaire?
                </Typography>
                <Typography id="modal-description" sx={{ mt: 2 }}>
                    Please fill in the post questionnaire.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        console.log(userId,fromExperiment,isControlGroup)
                        handleRedirect(userId, fromExperiment, shouldHideChatbox,isControlGroup);
                        onClose();
                    }}
                    sx={{ mt: 2 }}
                >
                    Go to Questionnaire
                </Button>
            </Box>
        </Modal>
    );
};

export default CustomAlertModal;
