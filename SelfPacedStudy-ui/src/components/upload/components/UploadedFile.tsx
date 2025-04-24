import {IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Typhography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface UploadedFileProps {
    fileName: string;
    onDelete: () => void;
    uploadProgress: number; // Add this line
}

const UploadedFile: React.FC<UploadedFileProps> = ({fileName, onDelete}) => {
    return (
        <Box sx={{boxShadow: 1, alignItems: 'center', width: '80%', borderRadius: '5px', padding: '10px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <UploadFileIcon fontSize="medium" color='primary'/>
                    <Typhography>{fileName}</Typhography>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <IconButton onClick={onDelete}>
                        <DeleteIcon/>
                    </IconButton>
                </div>
            </div>
        </Box>
    );
}

export default UploadedFile;