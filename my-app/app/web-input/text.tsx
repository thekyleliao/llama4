"use client"

import React, { useState } from "react";

// typescript interface for the props
interface TextInputProps {
  placeholder?: string;
  label?: string;
  onSubmit?: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({
  placeholder = "Enter Text",
  label = "Text Input",
  onSubmit
}) => {
    // State to manage the input text
    const [text, setText] = useState("");

    // Function to handle the submit action
    const handleSubmit = () => {
        if (text.trim()) {
        onSubmit?.(text);
        setText("");
        }
    };

    // Function to handle the Enter Key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
        handleSubmit();
        }
    };

    // Render the text input component with a label, input field, and submit button
    return (
        <div className="flex flex-col gap-2 p-4">
        <label className="text-sm font-medium text-gray-700">
            {label}
        </label>
        
        <div className="flex gap-2">
            <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
            Submit
            </button>
        </div>
        
        {text && (
            <p className="text-sm text-gray-600">
            Current text: {text}
            </p>
        )}
        </div>
    );
};

export default TextInput;