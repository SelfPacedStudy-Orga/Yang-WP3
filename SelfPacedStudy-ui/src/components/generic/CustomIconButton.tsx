import React, {forwardRef} from 'react';
import IconButton, {IconButtonProps} from '@mui/material/IconButton';

type Ref = HTMLButtonElement;

/**
 * A wrapper created to be able to pass references to MUI IconButtons.
 */
const CustomIconButton = forwardRef<Ref, IconButtonProps>((props, ref) => (
    // Use ref directly instead of innerRef
    <IconButton {...props} ref={ref}/>
));

CustomIconButton.displayName = 'CustomIconButton'; // Set the displayName

export default CustomIconButton;
