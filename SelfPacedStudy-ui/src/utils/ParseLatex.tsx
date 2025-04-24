import React from 'react';
import {BlockMath, InlineMath} from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Function to separate the Latex components and the text.
 * @param text - The input text that we want to parse. Can contain mathematical formulas in Tex notation.
 */
const parseLatex = (text: string) => {
    //console.log("TEXT ", text);
    const elements = [];
    let lastIndex = 0;

    // Regex to match inline (\(...\)) and block (\[...\] or $$...$$) LaTeX
    const latexRegex = /\\\((.*?)\\\)|(?:\$\$(.*?)\$\$)|(?:\\\[([\s\S]*?)\\\])/gs;
    let match;

    while ((match = latexRegex.exec(text)) !== null) {
        // Add the text before the LaTeX part
        if (match.index > lastIndex) {
            elements.push(text.slice(lastIndex, match.index));
        }

        // Extract the actual content depending on the type of LaTeX block
        let latexContent = '';
        let isBlock = false;

        if (match[1]) { // Inline math \(...\)
            //console.log("Match2: ", match[1]);
            latexContent = match[1];
        } else if (match[2]) { // Block math $$...$$
            latexContent = match[2];
            isBlock = true;
        } else if (match[3]) { // Block math \[...\]
            latexContent = match[3];
            //console.log("latex content 4");
            isBlock = true;
        }

        // Add LaTeX component
        elements.push(
            isBlock ? <BlockMath key={match.index} math={latexContent}/> :
                <InlineMath key={match.index} math={latexContent}/>
        );

        // Update lastIndex to the end of the current match
        lastIndex = match.index + match[0].length;
    }


    // Add any remaining text after the last LaTeX part
    if (lastIndex < text.length) {
        elements.push(text.slice(lastIndex));
    }
    //console.log(elements);
    return elements;
};

export default parseLatex;