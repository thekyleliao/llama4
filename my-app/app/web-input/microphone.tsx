"use client"

import React, {useRef, useState} from "react";

const AudioInput: React.FC = () => {
    // Reference to the audio element and state for the media stream
    const audioRef = useRef<HTMLAudioElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isAudioActive, setIsAudioActive] = useState(false);

    // Function to start the microphone
    const startMicrophone = async () => {
        try {
            // Request access to the user's audio input
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            })
            
            // Set the media stream and set is audio active to true
            setStream(mediaStream);
            setIsAudioActive(true);
            if (audioRef.current) {
                audioRef.current.srcObject = mediaStream;
            } 
        } catch (error) {
            // Handle any errors that occur while accessing the microphone
            console.error("Error accessing camera:", error);
        }
    }

    // Function to stop the microphone
    const stopMicrophone = () => {
        // If a stream exists, stop only audio track and clear the audio element
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => track.stop());
            setIsAudioActive(false);
            if (audioRef.current) {
                audioRef.current.srcObject = null;
            }
        }
    }

    return (
    // Render the audio input component and buttons to start/stop the microphone
    <div>
        <audio ref={audioRef} autoPlay/>
            {!isAudioActive ? (
                <button onClick={startMicrophone}>Start Audio</button>
            ) : (
                <button onClick={stopMicrophone}>Stop Audio Only</button>
            )}
            {isAudioActive && <p>Audio is active</p>}
    </div>
    );
}

export default AudioInput;