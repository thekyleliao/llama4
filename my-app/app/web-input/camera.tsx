"use client"

import React, {useRef, useState} from "react";
import { uploadToSupabaseClient } from '../db/utils'

const CameraInput: React.FC = () => {
    // Reference to the video element and state for the media stream
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false); // Add success state
    const [isUploading, setIsUploading] = useState(false); // Add uploading state

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
            setUploadSuccess(false);
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

        setIsUploading(true);
        setUploadSuccess(false);

        try {
            // Convert base64 to blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();

            // Upload to Supabase
            const fileName = `assignment-${new Date().toISOString().replace(/[:.T]/g, '-').slice(0, -5)}.jpg`;
            const { data, error } = await uploadToSupabaseClient(blob, fileName);

            if (error) {
                console.warn('Supabase upload failed:', error.message);
                throw new Error(error.message);
            } else {
                console.log('Photo also saved to Supabase:', data);
                setUploadSuccess(true);
                // Add a small delay to show the success animation before refreshing
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            // You can add error handling UI feedback here
        } finally {
            setIsUploading(false);
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
                    <div className="relative w-full h-full">
                        <img 
                            src={capturedImage} 
                            alt="Captured" 
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Upload Success Overlay */}
                        {uploadSuccess && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-green-500 rounded-full p-6 animate-pulse">
                                    <svg 
                                        className="w-16 h-16 text-white" 
                                        fill="currentColor" 
                                        viewBox="0 0 20 20"
                                    >
                                        <path 
                                            fillRule="evenodd" 
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                            clipRule="evenodd" 
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                        
                        {/* Upload Loading Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-blue-500 rounded-full p-6">
                                    <svg 
                                        className="w-16 h-16 text-white animate-spin" 
                                        fill="none" 
                                        viewBox="0 0 24 24"
                                    >
                                        <circle 
                                            className="opacity-25" 
                                            cx="12" 
                                            cy="12" 
                                            r="10" 
                                            stroke="currentColor" 
                                            strokeWidth="4"
                                        />
                                        <path 
                                            className="opacity-75" 
                                            fill="currentColor" 
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
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