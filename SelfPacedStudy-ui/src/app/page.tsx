'use client';

import {useRouter} from 'next/navigation';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {themeOptions} from '@/theme/theme';
import Upload from '@/components/upload/Upload';
import TumBar from '@/components/tum-bar/TumBar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import React, {useEffect, useRef, useState} from "react";
import AlertDialog from "@/components/generic/AlertDialog";
import {List, ListItem, ListItemText} from '@mui/material';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowNextIcon from '@mui/icons-material/ArrowForward';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { WELCOME_MESSAGE, READY_TO_LEARN_MESSAGE, INSTRUCTION_1, INSTRUCTION_2, INSTRUCTION_3 } from '@/utils/constants';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Tooltip from '@mui/material/Tooltip';
import {GlobalStyles} from '@mui/material';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button'; // Import the Button component


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

/**
 * Page serves as the starting point for users to interact with the AI-powered support tool.
 * It allows users to upload lecture videos and slides, and provides instructions on how to use the tool.
 */
const Page = () => {
    const router = useRouter();
    const [lectureSlidesFiles, setLectureSlidesFiles] = useState<File[]>([]); // State to hold uploaded slides.
    const [videoUrl, setVideoUrl] = useState<string>(''); // State to hold entered video URL
    const [lectureVideoFile, setLectureVideoFile] = useState<File[]>([]); // State to hold the lecture video file.
    const buttonRef = useRef<HTMLButtonElement | null>(null); // Reference to the arrow buttons between the tutorial and the upload components.
    const [dialogOpen, setDialogOpen] = useState(false); // State to hold if the alert is open.
    const [isStarted, setIsStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state between this page and the classroom component.
    const [isVideoUrlValid, setIsVideoUrlValid] = useState(true); //State to hold the validity of the URL.
    const [fromExperiment, setfromExperiment] = useState(false); // Loading state between this page and the classroom component.



    useEffect(() => {
        router.push('/mlexperiment?isTest=yes&prolificID=yourProlificIDValue');
    }, [router]);

    return null; // No need to render anything as it's only for redirection

    /*
    On a possible return to this page, we don't want the user to be able to go back with the same data.
     */
    useEffect(() => {
        // Reset the state variables when the component mounts
        setLectureSlidesFiles([]);
        setVideoUrl('');
        setLectureVideoFile([]);
                

    }, []);

    

    /**
     * Handles the submission of lecture slides and video URL.
     * Validates the input, displays a dialog if the video URL is missing,
     * and sends the data to the server for processing.
     */
    const handleSubmit = async () => {
        if (!isStarted) {
            setIsStarted(true);
            return;
        }

        if (!videoUrl) {
            // Show the popup
            setDialogOpen(true);
            return;
        }

        setIsLoading(true);

        try {

            /*
            const formData2 = new FormData();
            formData2.append('test', 'value');

            const response2 = await fetch('https://tum-hctl-vr-hub.link/app2/transcript', {
                method: 'POST',
                body: formData2,
            });

            //console.log(await response2.json());
            */

            const formData = new FormData();

            // Check for existing user ID in cookies or generate a new one
            let userId = Cookies.get('userId');
            if (!userId) {
                userId = uuidv4();
                Cookies.set('userId', userId!, { expires: 365 }); // Store user ID in cookies with 1 year expiration
            }

            lectureSlidesFiles.forEach(file => {
                formData.append('pdfs', file);
            });
            //console.log(videoUrl)
            formData.append('url', videoUrl);
            //formData.append('url', 'fdsaf');

            formData.append('userId', userId); // Adding user ID to the form data
            //console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
            const temp = false;
            formData.append('fromExperiment', fromExperiment.toString()); // Adding user ID to the form data

            // Assuming formData is already populated with files and fields
            for (var pair of formData.entries()) {
                //console.log(pair[0]+ ', ' + pair[1]);
            }
            //console.log("we sent response")
            console.log("Page Main App" + formData)

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transcript`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            //console.log(result);
            //console.log("we got response")

            const url = `/classroom?videoUrl=${encodeURIComponent(videoUrl)}`;
            if (url) {
                router.push(url);
            }
            setIsLoading(false);
        } catch (error) {
            //console.log("Error uploading data!");
            setIsLoading(false);
        }
    };

    /**
     * Resets the 'isStarted' state to allow the user to go back to the initial view.
     */
    const handleBack = () => {
        setIsStarted(false);
    }


    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <>
            <GlobalStyles styles={globalScrollbarStyles} />
            <ThemeProvider theme={theme}>
                <div style={containerStyle}>
                    <TumBar/>
                    <Grid style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '60%', overflowY: 'scroll'}}>
                        {isStarted && (
                            <>
                                <Grid item ml={5}>
                                    <IconButton style={{color: "#919191", marginLeft: '0px'}} edge="start"
                                                onClick={handleBack}>
                                        <ArrowBackIcon fontSize='large'/>
                                    </IconButton>
                                </Grid>

                                <Slide direction="left" in={isStarted} mountOnEnter unmountOnExit>
                                    <Grid className="hideScrollbar" item style={rightContainerStyle}>
                                        <Upload
                                            title="Lecture Video"
                                            urlFlag={true}
                                            dragzoneFlag={false}
                                            allowedFileTypes=".*/mp4"
                                            maxFileSize={50}
                                            url={videoUrl}
                                            setUrl={setVideoUrl}
                                            files={lectureVideoFile}
                                            setFiles={setLectureVideoFile}
                                            setIsVideoUrlValid={setIsVideoUrlValid}
                                        />
                                        <Upload
                                            title="Lecture Slides (Optional)"
                                            urlFlag={false}
                                            dragzoneFlag={true}
                                            allowedFileTypes=".pdf, .pptx, .ppt"
                                            maxFileSize={50}
                                            files={lectureSlidesFiles}
                                            setFiles={setLectureSlidesFiles}
                                            description="You can also upload previous slides of the lecture."
                                        />
                                    </Grid>
                                </Slide>
                            </>
                        )}
                        {!isStarted && (
                            <Slide direction="left" in={!isStarted} mountOnEnter unmountOnExit>
                                <Grid className="hideScrollbar" item style={rightContainerStyle}>
                                    <Typography variant="h2" color={'secondary'}>{WELCOME_MESSAGE}</Typography>
                                    <Typography variant="h6" style={{marginTop: '5%', color: 'rgba(0, 0, 0, 0.7)'}}>
                                        {READY_TO_LEARN_MESSAGE}
                                    </Typography>
                                    <List>
                                        <ListItem key="item2">
                                            <ListItemText
                                                primary={INSTRUCTION_1}/>
                                        </ListItem>
                                        <ListItem key="item3">
                                            <ListItemText
                                                primary={INSTRUCTION_2}/>
                                        </ListItem>
                                        <ListItem key="item4">
                                            <ListItemText
                                                primary={INSTRUCTION_3}/>
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Slide>
                        )}
                        <Grid item mr={5}>
                            {isLoading ? (
                                <Box sx={{display: 'flex'}}>
                                    <CircularProgress/>
                                </Box>
                            ) : (
                                <IconButton ref={buttonRef} size="large" onClick={handleSubmit} edge='end'
                                            disabled={!isVideoUrlValid}>
                                    <ArrowNextIcon fontSize='large' color='secondary'/>
                                </IconButton>
                            )}
                        </Grid>
                    </Grid>
                </div>
                <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
                    <Button variant="contained" color="primary" style={{position: 'fixed', bottom: 80, right: 20}}>
                        Privacy Policy
                    </Button>
                </a>
            </ThemeProvider>
            <Tooltip title={<React.Fragment>Email: <b>sam.ai.mentor@sot.tum.de</b><br/>Contact us for more info!</React.Fragment>}
                     placement="top" arrow>
                <ContactSupportIcon style={contactIconStyle} color="primary" fontSize="large"/>
            </Tooltip>
            <AlertDialog
                open={dialogOpen}
                handleClose={handleDialogClose}
                title="Missing Video URL"
                description="Please provide a video URL to continue."
            />
        </>);
};

export default Page;
