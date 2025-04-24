import React from 'react';
import {useTheme} from '@mui/material/styles';
import Image from 'next/image';
import tumLogo from '../../../public/tum_logo_white.png';
import sam from '../../../public/sam.png';
import Typography from "@mui/material/Typography";
import {useMediaQuery} from "@mui/material";

const containerStyle: React.CSSProperties = {
    width: '40%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
};

const logoStyle: React.CSSProperties = {
    padding: '20%',
};

const bottomContainerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 5%',
    gap: '10px'
};

const textStyle: React.CSSProperties = {
    color: '#FFF',
    fontSize: '14px',
};

/**
 * TUM banner that is displayed in the starting screen.
 * @constructor
 */
const TumBar: React.FC = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const dynamicTextStyle: React.CSSProperties = {
        ...textStyle,
        fontSize: isSmallScreen ? '10px' : '14px', // Adjust as needed
    };

    return (
        <div style={{...containerStyle, backgroundColor: theme.palette.secondary.main}}>
            <Image src={sam}
                   alt="Logo"
                   layout="intrinsic"
                   style={logoStyle}
                   width={700}
                   height={100}
            />
            <div style={bottomContainerStyle}>
                <div style={{maxWidth: '130px', width: '100%', flexShrink: 1}}>
                    <Image src={tumLogo} alt="TUM Logo" layout="responsive" width={130} height={100}
                           objectFit="contain"/>
                </div>
                <Typography style={dynamicTextStyle} variant="body2" component="div">
                    Powered by the<br/>
                    Chair for Human-Centered Technologies for Learning<br/>
                    Contact us: sam.ai.mentor@sot.tum.de
                </Typography>
            </div>
        </div>
    );
};

export default TumBar;
