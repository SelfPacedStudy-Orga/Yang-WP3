"use client";
import React, {useEffect, useRef, useState} from 'react';
import {Box} from "@mui/material";
import Message, {IMessage} from './Message';


const chatBoxStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgb(247, 247, 247)',
    resize: 'none',
}

const messageListStyles: (height: string) => React.CSSProperties = (height) => ({
    height,
    overflow: "auto",
    paddingTop: "1rem",
});

const resizeHandleStyles: React.CSSProperties = {
    cursor: 'ns-resize',
    height: '0.5rem',
    backgroundColor: '#0065bd',
};

interface ChatBoxProps {
    messages: IMessage[]; // Array of chat messages to be displayed
    isLoading: boolean; // Indicates whether the chat box is in a loading state
}

const ChatBox: React.FC<ChatBoxProps> = ({messages, isLoading}) => {
    const [chatBoxHeight, setChatBoxHeight] = useState('300px'); // State for managing the height of the chat box
    const chatBoxRef = useRef<HTMLDivElement>(null); // Ref to the chat box container for resizing
    const resizeHandleRef = useRef<HTMLDivElement>(null); // Ref to the resize handle of the chat box
    const scrollRef = useRef<HTMLDivElement>(null);


    /*
    This acts as an auto-scroller for the ChatBox. It scrolls to an invisible div at the bottom of the ChatBox.
     */
    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollHeight = scrollRef.current.scrollHeight;
            const height = scrollRef.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            scrollRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    /**
     * Provides functionality to resize the ChatBox via dragging its upper edge.
     * @param mouseDownEvent - To be able to understand if user is dragging.
     */
    const startResizing = (mouseDownEvent: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        mouseDownEvent.preventDefault();

        const startY = mouseDownEvent.clientY;
        const startHeight = chatBoxRef.current?.clientHeight || 0;

        const doResize = (mouseMoveEvent: MouseEvent) => {
            if (chatBoxRef.current) {
                const newHeight = startHeight - (mouseMoveEvent.clientY - startY);
                setChatBoxHeight(`${newHeight}px`);
            }
        };

        const stopResizing = () => {
            window.removeEventListener('mousemove', doResize);
            window.removeEventListener('mouseup', stopResizing);
            scrollToBottom();
        };

        window.addEventListener('mousemove', doResize);
        window.addEventListener('mouseup', stopResizing);
    };

    return (
        <Box
            style={{...chatBoxStyles, height: chatBoxHeight}}
            ref={chatBoxRef}>
            <div style={resizeHandleStyles} onMouseDown={startResizing} ref={resizeHandleRef}></div>
            <Box style={messageListStyles(chatBoxHeight)} ref={scrollRef}>
                {messages.map((message) => (
                    <Message key={message.id} message={message} isLoading={false}/>
                ))}
                {isLoading &&
                    <Message key={messages.length + 1}
                             message={{id: messages.length + 1, text: "", sender: "bot", isImage: false, image: null}}
                             isLoading={true}/>
                }
            </Box>
        </Box>
    );
};

export default ChatBox;
