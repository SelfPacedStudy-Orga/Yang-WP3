import React from 'react';
import {DropzoneArea} from '@/components/upload/components/DropzoneArea';
import {UploadTextField} from '@/components/upload/components/UploadTextField';
import TitleTypography from '@/components/generic/TitleTypography';

interface UploadProps {
    urlFlag: boolean; // Display the URL input field or not.
    dragzoneFlag: boolean; //Display the drag zone field or not.
    allowedFileTypes: string; // Allowed file extensions for upload.
    maxFileSize: number;
    title: string; //Title of the panel
    description?: string;
    url?: string; // URL that is entered in the input field.
    setUrl?: React.Dispatch<React.SetStateAction<string>>; // Called whenever user enters a URL.
    files: File[]; // Represents the lecture PDF's user can upload.
    setFiles: React.Dispatch<React.SetStateAction<File[]>>; // Called when user uploads files.
    setIsVideoUrlValid?: React.Dispatch<React.SetStateAction<boolean>>; // Video URL valid or not.
}

const containerStyle: React.CSSProperties = {
    margin: '0 0 5rem 0',
    width: '100%',
};

/**
 * Component to handle uploads. With parameters, it can handle both URL input and PDF input.
 * @param props
 * @constructor
 */
const Upload: React.FC<UploadProps> = (props) => {

    /**
     * Handles the event when the value inside the text field changes.
     * @param value - Current value of the text field.
     */
    const handleTextFieldChange = (value: string) => {
        if (props.urlFlag && props.setUrl) {
            props.setUrl(value); // Call setUrl only if it's provided
            props.setFiles([]); // Clear files when URL is set
        }
    };

    /**
     * Handles the event when the user uploads a file using drag and drop.
     * @param uploadedFiles - Files user uploded.
     */
    const handleDropzoneChange = (uploadedFiles: File[]) => {
        if (props.dragzoneFlag && props.setUrl) {
            props.setUrl(''); // Clear URL when files are uploaded, only if setUrl is provided
        }
        props.setFiles(uploadedFiles);
        props.setFiles(uploadedFiles);
    };

    return (
        <div style={containerStyle}>
            <TitleTypography text={props.title}/>
            <div>
                {props.urlFlag && (
                    <UploadTextField
                        value={props.url || ''}
                        onChange={handleTextFieldChange}
                        disabled={props.files.length > 0}
                        setIsVideoUrlValid={props.setIsVideoUrlValid}
                    />
                )}
                {props.dragzoneFlag && (
                    <div style={{marginTop: '1%'}}>
                        <DropzoneArea
                            allowedFileTypes={props.allowedFileTypes}
                            maxFileSize={props.maxFileSize}
                            files={props.files}
                            onChange={handleDropzoneChange}
                            disabled={!!(props.urlFlag && props.url && props.url.length > 0)}
                            description={props.description}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
