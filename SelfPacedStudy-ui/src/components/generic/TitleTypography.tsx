import React from 'react';
import {Typography, TypographyProps} from '@mui/material';

interface TitleTypographyProps extends TypographyProps {
    text: string;
}

const TitleTypography: React.FC<TitleTypographyProps> = (props) => {
    return (
        <Typography variant="h5" style={{color: 'rgba(0, 0, 0, 0.7)', marginBottom: '2%'}}>
            {props.text}
        </Typography>
    );
};


export default TitleTypography;
