import React from 'react';

function TextInput({placeholder, onChange, value, onEnter}) {
    return (
        <input type="text" placeholder={placeholder} value={value} onChange={onChange} 
        onKeyDown={(e)=>e.keyCode == 13 ? onEnter() : ''}/>
    );
}

export { TextInput };