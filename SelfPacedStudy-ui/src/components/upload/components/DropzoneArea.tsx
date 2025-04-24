import React, {DragEvent, useRef, useState} from 'react';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkTypography from '@/components/generic/LinkTypography';
import UploadedFile from '@/components/upload/components/UploadedFile';

interface DropzoneAreaProps {
    allowedFileTypes: string; // Allowed file extension for uploads.
    maxFileSize: number;
    files: File[]; // Represents the PDF files.
    onChange: (files: File[]) => void; // Called when something is uploaded.
    disabled: boolean; // Check if DropZoneArea is disabled or not.
    description?: string;
}

interface FileWithProgress {
    file: File;
    progress: number;
}

const dropzoneStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    borderRadius: '5px',
    padding: '4% 7%',
    border: '1.5px dashed var(--divider, rgba(0, 0, 0, 0.07))',
    gap: '22.293px',
};

export const DropzoneArea: React.FC<DropzoneAreaProps> = (props) => {
    const [dragIsOver, setDragIsOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileWithProgress[]>([]);

    const theme = useTheme();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files ?? [])
            .filter(file => ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type))
            .map(file => ({ file, progress: 0 }));

        setFiles(prevFiles => {
            const combinedFiles = [...prevFiles, ...newFiles];
            props.onChange(combinedFiles.map(f => f.file));
            return combinedFiles;
        });
    };

    // Define the event handlers
    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragIsOver(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragIsOver(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        if (props.disabled) {
            return;
        }

        event.preventDefault();
        setDragIsOver(false);

        // Fetch the files
        const droppedFiles = Array.from(event.dataTransfer.files)
            .filter(file => ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type))
            .map(file => ({file, progress: 0}));

        setFiles(prevFiles => {
            const combinedFiles = [...prevFiles, ...droppedFiles];
            props.onChange(combinedFiles.map(f => f.file));
            return combinedFiles;
        });
    };

    const handleClick = () => {
        if (!props.disabled) {
            //console.log("Inside not disabled!!");
            fileInputRef.current?.click();
        }
    };

    const handleDelete = (index: number) => {
        setFiles(files => {
            const newFiles = files.filter((_, i) => i !== index);
            props.onChange(newFiles.map(f => f.file)); // Notify the parent component
            return newFiles;
        });
    };

    return (
        <>
            <div
                onDragOver={props.disabled ? undefined : handleDragOver}
                onDragLeave={props.disabled ? undefined : handleDragLeave}
                onDrop={props.disabled ? undefined : handleDrop}
                style={{
                    ...dropzoneStyles,
                    backgroundColor: dragIsOver ? 'rgba(0, 0, 0, 0.03)' : 'white',
                }}
            >
                <input
                    type="file"
                    style={{display: 'none'}}
                    ref={fileInputRef}
                    accept={props.allowedFileTypes}
                    disabled={props.disabled}
                    onChange={handleFileChange}
                    multiple
                />
                <UploadFileIcon fontSize="large" color={props.disabled ? 'disabled' : 'primary'}/>
                <Typography>
                    <LinkTypography onClick={handleClick} text="Click to upload" disabled={props.disabled}/>
                    {' or drag and drop'}
                </Typography>
                <Typography variant='body2'
                                color="GrayText"> {`Allowed file types: pdf, (max. 50MB)`} </Typography>            
                {props.description && <Typography color="darkred"> {props.description}</Typography>}
            </div>
            {files.map((fileWithProgress, index) => (
                <UploadedFile
                    key={index}
                    fileName={fileWithProgress.file.name}
                    uploadProgress={fileWithProgress.progress}
                    onDelete={() => handleDelete(index)}
                />
            ))}
        </>
    );
}


// color="GrayText"> {`Allowed file types: ${props.allowedFileTypes}, (max. ${props.maxFileSize}MB)`} </Typography>
