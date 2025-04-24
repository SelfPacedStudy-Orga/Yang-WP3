"use client";

import React, {RefObject, useRef} from 'react';
import {Box, IconButton, InputBase} from "@mui/material";
import {alpha, experimentalStyled} from '@mui/material/styles';
import ImageIcon from '@mui/icons-material/Image';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import SendIcon from '@mui/icons-material/Send';
import CustomIconButton from '@/components/generic/CustomIconButton';

const Search = experimentalStyled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: 45,
    backgroundColor: alpha(theme.palette.common.white, 1),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.8),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const StyledInputBase = experimentalStyled(InputBase)(({theme}) => ({
    color: '#000000',
    '& .MuiInputBase-input': {
        paddingLeft: `calc(1em + ${theme.spacing(0.5)})`,
        transition: theme.transitions.create('width'),
    },
}));

interface ChatToolbarProps {
    onOpenChatBox: () => void;
    onCloseChatBox: () => void;
    isChatBoxOpen: boolean;
    inputRef: RefObject<HTMLInputElement>;
    imageButtonRef: RefObject<HTMLButtonElement>;
    sendButtonRef: RefObject<HTMLButtonElement>;
    onSendMessage: (message: string, file?: File) => void;
    onImageUpload: (file: File) => void;
}

const ChatToolbar: React.FC<ChatToolbarProps> = ({
    onOpenChatBox,
    onCloseChatBox,
    isChatBoxOpen,
    inputRef,
    imageButtonRef,
    sendButtonRef,
    onSendMessage,
    onImageUpload
}) => {
    const toggleIcon = isChatBoxOpen ? <KeyboardDoubleArrowDownIcon/> : <KeyboardDoubleArrowUpIcon/>;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSendMessage = () => {
        if (inputRef.current && inputRef.current.value) {
            onSendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            onImageUpload(file);
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: '#0065bd',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                height: 'auto',
                padding: '10px',
                WebkitOverflowScrolling: 'touch',
            }}>
            <IconButton style={{color: "white", marginLeft: '5px'}} edge="start"
                        onClick={isChatBoxOpen ? onCloseChatBox : onOpenChatBox}
                        aria-label="toggle chat box">
                {toggleIcon}
            </IconButton>
            <input
                type="file"
                style={{display: 'none'}}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
            />
            <CustomIconButton ref={imageButtonRef} style={{color: "white"}} edge="end" onClick={handleImageUpload}>
                <ImageIcon/>
            </CustomIconButton>
            <Search sx={{flexGrow: 1}}>
                <StyledInputBase sx={{width: '100%'}}
                                 placeholder="Type a message"
                                 inputProps={{'aria-label': 'search'}}
                                 onFocus={onOpenChatBox}
                                 inputRef={inputRef}
                                 onKeyDown={(e) => {
                                     if (e.key === 'Enter') {
                                         e.preventDefault();
                                         handleSendMessage();
                                     }
                                 }}
                />
            </Search>
            <CustomIconButton ref={sendButtonRef} style={{color: "white", marginRight: '10px'}} edge="start"
                              onClick={handleSendMessage}>
                <SendIcon/>
            </CustomIconButton>
        </Box>
    );
};

export default ChatToolbar;
