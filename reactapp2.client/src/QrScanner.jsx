import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

const QrScanner = ({ onScan, onError }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef();
    const [isVideoReady, setIsVideoReady] = useState(false);

    const captureAndScan = () => {
        if (!webcamRef.current || !canvasRef.current || !isVideoReady) return;

        try {
            const video = webcamRef.current.video;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d', { willReadFrequently: true });

            // Add safety checks for video dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                requestAnimationFrame(captureAndScan);
                return;
            }

            // Set canvas dimensions only once when video is ready
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code) {
                onScan(code.data);
                cancelAnimationFrame(animationFrameRef.current);
            } else {
                animationFrameRef.current = requestAnimationFrame(captureAndScan);
            }
        } catch (error) {
            onError(error);
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    useEffect(() => {
        if (isVideoReady) {
            animationFrameRef.current = requestAnimationFrame(captureAndScan);
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isVideoReady]);

    return (
        <div className="scanner-container">
            <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={{
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }}
                style={{ width: '100%', borderRadius: '8px' }}
                onUserMedia={() => {
                    // Wait 500ms to ensure video dimensions are available
                    setTimeout(() => setIsVideoReady(true), 500);
                }}
                onUserMediaError={(error) => {
                    onError(new Error(`Camera access denied: ${error.message}`));
                }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default QrScanner;