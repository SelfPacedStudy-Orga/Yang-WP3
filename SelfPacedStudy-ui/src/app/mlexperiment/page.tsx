'use client';

import { useRouter } from 'next/navigation';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { themeOptions } from '@/theme/theme';
import TumBar from '@/components/tum-bar/TumBar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from "react";
import AlertDialog from "@/components/generic/AlertDialog";
import { Button } from '@mui/material';
import Slide from '@mui/material/Slide';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { GlobalStyles } from '@mui/material';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Tooltip from '@mui/material/Tooltip';
import { WELCOME_MESSAGE, READY_TO_LEARN_MESSAGE, INSTRUCTION_1, INSTRUCTION_2, INSTRUCTION_3 ,  READY_TO_LEARN_INTRO, KEY_FEATURES_TITLE,
    KEY_FEATURES,
    READY_TO_LEARN_OUTRO} from '@/utils/constants'; // Adjust to your constants
import { List, ListItem, ListItemText } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ArrowNextIcon from '@mui/icons-material/ArrowForward';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import SampleQuestionnaire from '@/components/SampleQuestionnaire';  // 根据你创建文件的路径导入



const theme = createTheme(themeOptions);


const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100vh',
};

const rightContainerStyle: React.CSSProperties = {
    width: "70%",  // Slightly wider but not too much
    maxWidth: '800px', // Adjust the max width to give a more readable line length
    marginLeft: '5%',
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

const arrowStyle: React.CSSProperties = {
    position: 'fixed',  // Fix the arrow to the right side
    right: '20px',  // Right side alignment
    top: '50%',  // Vertically center the arrow
    transform: 'translateY(-50%)',  // Ensure it's centered relative to its height
    fontSize: '40px'
};

const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',  // Full height to center the button vertically
    width: '100%',
};

const Page = () => {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false); // State to hold if the alert is open.
    const [isLoading, setIsLoading] = useState(false); // Loading state for transitioning between pages.
    const [isStarted, setIsStarted] = useState(false); // State to toggle between welcome message and interaction
    const [fromExperiment, setFromExperiment] = useState(true); // Represents if user comes from experiment
    const [userId, setUserId] = useState<string | null>(null);
    const [prolificID, setProlificID] = useState<string | null>(null);
    const [isTest, setIsTest] = useState<string>('false'); // Ensure it is always a string
    const [interactionFrequency, setInteractionFrequency] = useState('medium');

    const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInteractionFrequency((event.target as HTMLInputElement).value);
    };


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const prolificIDParam = urlParams.get('prolificID') || uuidv4(); // Ensure it always gets a string
        const isTestParam = urlParams.get('isTest') || 'false'; // Ensure it always gets a string
        setProlificID(prolificIDParam);
        setIsTest(isTestParam); // Ensure the parameter is set correctly
        Cookies.set('userId', prolificIDParam, { expires: 365 });
        setUserId(prolificIDParam);
    }, []);

    const handleSubmit = async (lectureNumber: string) => {
        if (!userId) return; // Ensure userId is available before proceeding
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('fromExperiment', fromExperiment.toString()); // Adding user ID to the form data
            formData.append('lectureNumber', lectureNumber);
            formData.append('isTest', isTest); // Adding isTest to the form data
            formData.append('interactionFrequency', interactionFrequency); // Add interactionFrequency to the form data

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transcriptExperiment`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            const videoUrl = result.videoUrl;
            const url = `/classroom?videoUrl=${encodeURIComponent(videoUrl)}&fromExperiment=${fromExperiment}&isTest=${isTest}`;
            if (url) {
                router.push(url);
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleStart = () => {
        setIsStarted(true); // Start the interaction after welcome screen
    };

    return (
        <>
            <GlobalStyles styles={globalScrollbarStyles} />
            <ThemeProvider theme={theme}>
                <div style={containerStyle}>
                    <TumBar />
                    <Grid style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%', overflowY: 'scroll' }}>
                        
                        {/* If not started, show welcome instructions */}
                        {!isStarted && (
                            <Slide direction="left" in={!isStarted} mountOnEnter unmountOnExit>
  <Grid className="hideScrollbar" item style={rightContainerStyle}>
    {/* Welcome Message */}
    <Typography variant="h2" color={'secondary'}>
      {WELCOME_MESSAGE}
    </Typography>

    {/* Ready to Learn Message Intro */}
    <Typography variant="h6" style={{ marginTop: '5%', color: 'rgba(0, 0, 0, 0.7)' }}>
      {READY_TO_LEARN_INTRO}
    </Typography>

    {/* Key Features Title */}
    <Typography variant="h6" style={{ marginTop: '5%', color: 'rgba(0, 0, 0, 0.7)' }}>
      {KEY_FEATURES_TITLE}
    </Typography>

    {/* Key Features List with Smaller Font and Bold */}
    <List>
      {KEY_FEATURES.map((feature, index) => (
        <ListItem key={`feature-${index}`}>
          <Typography variant="body1" style={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.7)' }}>
            • {feature}
          </Typography>
        </ListItem>
      ))}
    </List>

    {/* Ready to Learn Outro */}
    <Typography variant="h6" style={{ marginTop: '5%', color: 'rgba(0, 0, 0, 0.7)' }}>
      {READY_TO_LEARN_OUTRO}
    </Typography>
  </Grid>
</Slide>
                        )}

                        {/* If started, show the button to proceed */}
                        {isStarted && (
                            <Slide direction="left" in={isStarted} mountOnEnter unmountOnExit>
                                <Grid className="hideScrollbar" item style={rightContainerStyle}>
                                    <div style={buttonContainerStyle}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleSubmit('15')}
                                                disabled={isLoading}  // Disable the button while loading
                                            >
                                                Watch Lecture
                                            </Button>

                                            {/* Show the loading spinner to the right of the button if loading */}
                                            {isLoading && (
                                                <Box sx={{ marginLeft: '10px' }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            )}
                                        </Box>
                                    </div>
                                </Grid>
                            </Slide>
                        )}

                        {/* Add the arrow to the right side and vertically centered */}
                        <IconButton size="large" onClick={handleStart} edge='end' style={arrowStyle}>
                            <ArrowNextIcon fontSize='large' color='secondary' />
                        </IconButton>
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