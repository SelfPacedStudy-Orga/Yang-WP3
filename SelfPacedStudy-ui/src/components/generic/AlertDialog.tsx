import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Define the props interface
interface AlertDialogProps {
    open: boolean; // If alertBox is open or not.
    handleClose: () => void; //Call when alertDialog is closed.
    title: string;
    description: React.ReactNode; // Change this line
}

/**
 * Used in the main "Page" component to warn users if they did not enter a URL.
 * @param open
 * @param handleClose
 * @param title
 * @param description
 * @constructor
 */
const AlertDialog: React.FC<AlertDialogProps> = ({open, handleClose, title, description}) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Understood</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AlertDialog;
