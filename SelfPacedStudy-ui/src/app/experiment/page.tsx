'use client';

import { useRouter } from 'next/navigation';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { themeOptions } from '@/theme/theme';
import TumBar from '@/components/tum-bar/TumBar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from "react";
import AlertDialog from "@/components/generic/AlertDialog";
import { List, ListItem, ListItemText, Button } from '@mui/material';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowNextIcon from '@mui/icons-material/ArrowForward';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { WELCOME_MESSAGE, READY_TO_LEARN_MESSAGE, INSTRUCTION_1, INSTRUCTION_2, INSTRUCTION_3 } from '@/utils/constants';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Tooltip from '@mui/material/Tooltip';
import { GlobalStyles } from '@mui/material';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import { TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import SampleQuestionnaire from '@/components/SampleQuestionnaire';  // 引入

const theme = createTheme(themeOptions);



const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100vh',
}

const rightContainerStyle: React.CSSProperties = {
    width: "100%",
    marginLeft: '10%',
    overflowY: 'scroll',
};

const globalScrollbarStyles = {
    '& .hideScrollbar::-webkit-scrollbar': {
        display: 'none'
    },
    '& .hideScrollbar': {
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // Internet Explorer 10+
    }
};

const contactIconStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    cursor: 'pointer' // Optional, to indicate that it’s interactive
};

const Page = () => {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false); // State to hold if the alert is open.
    const [isStarted, setIsStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state between this page and the classroom component.
    const [fromExperiment, setfromExperiment] = useState(true); // Loading state between this page and the classroom component.
    const userId = Cookies.get('userId') || uuidv4();
    

    useEffect(() => {
        if (!Cookies.get('userId')) {
          Cookies.set('userId', userId, { expires: 365 });
        }
      }, [userId]);

    const handleSubmit = async (lectureNumber: string) => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            

            formData.append('userId', userId);
            formData.append('fromExperiment', fromExperiment.toString()); // Adding user ID to the form data

            formData.append('lectureNumber', lectureNumber);
            
            console.log(lectureNumber)

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transcriptExperiment`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            const videoUrl = result.videoUrl;
            const url = `/classroom?videoUrl=${encodeURIComponent(videoUrl)}&fromExperiment=true`;
            if (url) {
                router.push(url);
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const handleStart = () => {
        setIsStarted(true);
    };

    const handleBack = () => {
        setIsStarted(false);
    }

    const handleDialogClose = () => {
        setDialogOpen(false);
    };
    

    const handleRedirect = () => {
        let userId = Cookies.get('userId');
        if (!userId) {
            userId = uuidv4();
            Cookies.set('userId', userId!, { expires: 365 });
        }
        window.open(`https://qualtricsxmfhtr3d79f.qualtrics.com/jfe/form/SV_4Ufzk9YbwRUy7gq?PROLIFIC_PID=${userId}`, '_blank');
    };
    

    return (
        <>
            <GlobalStyles styles={globalScrollbarStyles} />
            <ThemeProvider theme={theme}>
                <div style={containerStyle}>
                    <TumBar />
                    <Grid style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '60%', overflowY: 'scroll' }}>
                        {isStarted && (
                            <>
                                <Grid item ml={5}>
                                    <IconButton style={{ color: "#919191", marginLeft: '0px' }} edge="start"
                                                onClick={handleBack}>
                                        <ArrowBackIcon fontSize='large' />
                                    </IconButton>
                                </Grid>

                                <Slide direction="left" in={isStarted} mountOnEnter unmountOnExit>
                                    <Grid className="hideScrollbar" item style={rightContainerStyle}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleRedirect}
                                            style={{ margin: '10px' }}
                                        >
                                            Fill out the pre-questionnaire. Your ID: {userId}
                                        </Button>
                                        <Typography variant="h5" style={{ marginTop: '20px', marginBottom: '10px' }}>
                                            Available Lectures
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSubmit('10')}
                                            style={{ margin: '10px' }}
                                        >
                                            Lecture 10
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSubmit('11')}
                                            style={{ margin: '10px' }}
                                        >
                                            Lecture 11
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSubmit('12')}
                                            style={{ margin: '10px' }}
                                        >
                                            Lecture 12
                                        </Button>
                                    </Grid>
                                </Slide>
                            </>
                        )}
                        {!isStarted && (
                            <Slide direction="left" in={!isStarted} mountOnEnter unmountOnExit>
                                <Grid className="hideScrollbar" item style={rightContainerStyle}>
                                    <Typography variant="h2" color={'secondary'}>{WELCOME_MESSAGE}</Typography>
                                    <Typography variant="h6" style={{ marginTop: '5%', color: 'rgba(0, 0, 0, 0.7)' }}>
                                        {READY_TO_LEARN_MESSAGE}
                                    </Typography>
                                    <List>
                                        <ListItem key="item2">
                                            <ListItemText
                                                primary={INSTRUCTION_1} />
                                        </ListItem>
                                        <ListItem key="item3">
                                            <ListItemText
                                                primary={INSTRUCTION_2} />
                                        </ListItem>
                                        <ListItem key="item4">
                                            <ListItemText
                                                primary={INSTRUCTION_3} />
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Slide>
                        )}
                        <Grid item mr={5}>
                            {!isStarted ? (
                                <IconButton size="large" onClick={handleStart} edge='end'>
                                    <ArrowNextIcon fontSize='large' color='secondary' />
                                </IconButton>
                            ) : (
                                <Box sx={{ display: 'flex' }}>
                                    {isLoading && <CircularProgress />}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </div>
            </ThemeProvider>
            <Tooltip title={<React.Fragment>Email: <b>sam.ai.mentor@sot.tum.de</b><br />Contact us for more info!</React.Fragment>}
                     placement="top" arrow>
                <ContactSupportIcon style={contactIconStyle} color="primary" fontSize="large" />
            </Tooltip>
            <AlertDialog
                open={dialogOpen}
                handleClose={handleDialogClose}
                title="Missing Video URL"
                description="Please provide a video URL to continue."
            />
        </>
    );
};

export default Page;
