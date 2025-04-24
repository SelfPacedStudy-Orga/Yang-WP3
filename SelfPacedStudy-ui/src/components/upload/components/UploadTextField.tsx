import React, {useState} from 'react';
import {TextField} from '@mui/material';
import {useTheme} from '@mui/material/styles';

interface UploadTextFieldProps {
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
    setIsVideoUrlValid?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UploadTextField: React.FC<UploadTextFieldProps> = (props) => {
    const theme = useTheme();
    const [isValid, setIsValid] = useState(true);

    /**
     * For now, only allow valid youtube links.
     * @param event
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        const isValid = youtubeUrlRegex.test(value);
        setIsValid(isValid);

        if (props.setIsVideoUrlValid) {
            props.setIsVideoUrlValid(isValid);
        }

        props.onChange(value);
    }

    const textFieldStyles: React.CSSProperties = {
        width: '80%',
        borderRadius: '5px',
        borderColor: isValid ? theme.palette.primary.main : 'red',
    };

    return (
        <TextField
            variant="outlined"
            label="Upload via link (Only YouTube videos are supported)"
            style={textFieldStyles}
            color='primary'
            value={props.value}
            onChange={handleChange}
            disabled={props.disabled}
            error={!isValid}
        />
    );
};

export default UploadTextField;
