// ClassroomToolbar.tsx
import React from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';
import tum_logo from '../../../public/tum_logo.png';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useRouter } from 'next/navigation';

interface SimpleToolbarProps {
    onBack: () => void;
    onDownload: () => void;
    userId: string;
    fromExperiment: boolean;
    isControlGroup: boolean;
    isInLastTwentyMinutes: boolean;
    shouldHideChatBox: boolean;
}

export const handleRedirect = (userId: string, fromExperiment: boolean, shouldHideChatBox: boolean, isControlGroup: boolean) => {

    const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/chats/onlysave";
    console.log("ONLY SAVE")
    const formData = new FormData();
    formData.append('userId', userId!);
    console.log("Save")
    console.log(shouldHideChatBox)
    console.log(shouldHideChatBox.toString())
    formData.append('shouldHideChatBox', shouldHideChatBox.toString());
    formData.append('fromExperiment', fromExperiment.toString());
    if (!navigator.sendBeacon(url, formData)) {
        fetch(url, {
            method: 'POST',
            body: formData,
            keepalive: true,
        });
    }
    if (fromExperiment) {
        console.log("ControlGroup" + isControlGroup)
        if (isControlGroup) {
            window.open(`https://qualtricsxmfhtr3d79f.qualtrics.com/jfe/form/SV_0Nkh74oYWMscIfQ?PROLIFIC_PID=${userId}`, '_blank');
        } else {
            window.open(`https://qualtricsxmfhtr3d79f.qualtrics.com/jfe/form/SV_54rCTamNPVK5Fc2?PROLIFIC_PID=${userId}`, '_blank');
        } 
    } else {
        window.open(`https://qualtricsxmfhtr3d79f.qualtrics.com/jfe/form/SV_ex3hIADNmA5exqS?PROLIFIC_PID=${userId}`, '_blank');
    }
};







const ClassroomToolbar: React.FC<SimpleToolbarProps> = ({ onBack, onDownload, userId, fromExperiment, isControlGroup, isInLastTwentyMinutes,shouldHideChatBox }) => {
    const router = useRouter();

    return (
        <AppBar position="sticky" color="default" elevation={1} sx={{ width: '100%', margin: 0 }}>
            <Toolbar sx={{ minHeight: '0px !important', padding: '0px' }}>
                <IconButton size='small' edge="start" color="inherit" aria-label="back" onClick={onBack}>
                    <ArrowBackIcon fontSize='small' />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                {isInLastTwentyMinutes && fromExperiment && (
                    <Typography variant="h6" color="error" sx={{ mr: 4 }}>
                        Please fill out the questionnaire.
                    </Typography>
                )}
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleRedirect(userId, fromExperiment,shouldHideChatBox, isControlGroup)} 
                    sx={{ mr: 2, backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
                >
                    {fromExperiment ? "Fill out the questionnaire" : "Usability Test"}
                </Button>
                <Typography variant="h6" color="inherit" component="div" sx={{ lineHeight: '1', mr: 2 }}>
                    <Image src={tum_logo} alt="TUM Logo" width={40} height={22} />
                </Typography>
                <IconButton size='small' edge="start" color="inherit" aria-label="download" onClick={onDownload}>
                    <FileDownloadIcon fontSize='small' />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default ClassroomToolbar;
