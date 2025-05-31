"use client"

import React, {useRef, useState} from "react";

const CameraInput: React.FC = () => {
    // Reference to the video element and state for the media stream
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Function to start the camera
    const startCamera = async () => {
        try {
            // Request access to the user's camera
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
            })
            
            // Set the media stream and set is video active to true
            setStream(mediaStream);
            setIsVideoActive(true);
            setCapturedImage(null); // Reset captured image when starting camera
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
            setCapturedImage(null); // Reset captured image when stopping camera
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }

    const takePicture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageData);
                // Stop the video stream after capturing
                if (stream) {
                    const videoTracks = stream.getVideoTracks();
                    videoTracks.forEach(track => track.stop());
                }
            }
        }
    }

    const handleUpload = async () => {
        if (!capturedImage) return;

        try {
            // Convert base64 to blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            
            // Create form data
            const formData = new FormData();
            formData.append('photo', blob, 'captured-photo.jpg');

            // Send to your API endpoint
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            // Handle successful upload
            console.log('Photo uploaded successfully');
            // You can add additional success handling here
        } catch (error) {
            console.error('Error uploading photo:', error);
            // You can add error handling UI feedback here
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {!capturedImage ? (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            
            <div className="flex space-x-4">
                {!isVideoActive && !capturedImage ? (
                    <button 
                        onClick={startCamera}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Start Camera
                    </button>
                ) : isVideoActive && !capturedImage ? (
                    <button 
                        onClick={takePicture}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Take Photo
                    </button>
                ) : (
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleUpload}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Upload Photo
                        </button>
                        <button 
                            onClick={stopCamera}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Stop Camera
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CameraInput;