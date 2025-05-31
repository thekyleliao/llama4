"use client"

import React, {useRef, useState} from "react";

const CameraInput: React.FC = () => {
    // Reference to the video element and state for the media stream
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);

    // Function to start the camera
    const startCamera = async () => {
        try {
            // Request access to the user's camera
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
            })
            
            // Set the media stream to state and assign it to the video element
            setStream(mediaStream);
            setIsVideoActive(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            } 
        } catch (error) {
            // Handle any errors that occur while accessing the camera
            console.error("Error accessing camera:", error);
        }
    }

    // Function to stop the camera
    const stopCamera = () => {
        // If a stream exists, stop only video track and clear the video element
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => track.stop());
            setIsVideoActive(false);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }

    return (
    // Render the camera input component and buttons to start/stop the camera
    <div>
        <video ref={videoRef} autoPlay/>
            {!isVideoActive ? (
                <button onClick={startCamera}>Start Camera</button>
            ) : (
                <button onClick={stopCamera}>Stop Camera Only</button>
            )}
            {isVideoActive && <p>Camera is active</p>}
    </div>
    );
}

export default CameraInput;