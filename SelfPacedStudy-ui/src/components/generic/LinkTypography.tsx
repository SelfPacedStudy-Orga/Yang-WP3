import {Typography, TypographyProps} from '@mui/material';
import {useTheme} from '@mui/material/styles';

interface LinkTypographyProps extends TypographyProps {
    onClick: () => void;
    text: string;
    disabled?: boolean;
}

const linkTyphographyStyles: React.CSSProperties = {
    textDecoration: 'underline',
    cursor: 'pointer',
};

const LinkTypography: React.FC<LinkTypographyProps> = ({onClick, text, ...props}) => {
    const theme = useTheme();

    return (
        <Typography
            variant="body1"
            display="inline"
            component="span"
            onClick={onClick}
            style={linkTyphographyStyles}
            color={props.disabled ? 'lightgrey' : 'primary'}
            {...props}
        >
            {text}
        </Typography>
    );
}

export default LinkTypography;