"use client";
import React from 'react';
import {Avatar, Box, Paper, Typography} from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import parseLatex from "@/utils/ParseLatex";
import 'katex/dist/katex.min.css';
import '../../app/globals.css';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export interface IMessage {
    id: number; // Unique identifier for the message
    text: string; // The text content of the message
    sender: string; // Identifier for the sender ('bot' or 'user')
    isImage: boolean; // Flag indicating if the message is an image
    image: File | null ;
}

const Message = ({message, isLoading}: { message: IMessage, isLoading: boolean }) => {
    const isBot = message.sender === "bot";

    const containerStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        marginBottom: '1rem',

    };

    const innerContainerStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: isBot ? 'row' : 'row-reverse',
        alignItems: 'center',
    };

    const avatarStyles: React.CSSProperties = {
        backgroundColor: isBot ? 'orange' : 'gray',
    };

    const paperStyles: React.CSSProperties = {
        padding: '1rem',
        margin: isBot ? '0 3rem 1rem 0.5rem' : '0 0.5rem 1rem 0',
        backgroundColor: isBot ? 'white' : 'white',
        borderRadius: isBot ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
    };

    /**
     * If the content of the message is text, parse the text so that katex can display equations.
     */
    const content = message.isImage && message.image ? (
        <img src={URL.createObjectURL(message.image)} alt="Message Image" style={{ width: 'auto', height: '100%' }} />
    ) : parseLatex(message.text);



    return (
        <Box style={containerStyles}>
            <Box style={innerContainerStyles}>
                <Avatar style={avatarStyles}>
                    {isBot ? <SmartToyOutlinedIcon/> : <PersonOutlineOutlinedIcon/>}
                </Avatar>
                <Paper style={paperStyles}>
                    {
                        isLoading ?
                            (
                                <div className="loader"></div>
                            )
                            :
                            (
                                message.isImage && message.image ?
                                    (
                                        <img src={URL.createObjectURL(message.image)} alt="Message Image"
                                             style={{width: 'auto', height: '100px'}}/>)
                                    :
                                    (
                                        <Typography variant="body1">{content}</Typography> //Otherwise, render the Latex + text content
                                    )
                            )
                    }
                </Paper>
            </Box>
        </Box>
    );
};

export default Message;

