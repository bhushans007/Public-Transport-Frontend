import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';

const QrScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const codeReader = new BrowserQRCodeReader();

    const startScanning = async () => {
      try {
        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result: Result | undefined, error: Error | undefined) => {
            if (result) {
              setScanResult(result.getText());
              stopScanning(); // Stop after successful scan
            }
            if (error) {
              console.error(error);
              setError(error.message);
            }
          }
        );

        controlsRef.current = controls;
      } catch (err) {
        console.error(err);
        setError('Failed to access camera. Please ensure you have granted camera permissions.');
      }
    };

    const stopScanning = () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>QR Code Scanner</h2>
      
      {error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <video
            ref={videoRef}
            style={{ width: '100%', maxWidth: '500px', border: '2px solid black' }}
            playsInline
          />
          
          {scanResult && (
            <div style={{ marginTop: '20px' }}>
              <h3>Scanned Result:</h3>
              <p>{scanResult}</p>
              <button onClick={() => setScanResult(null)}>Scan Again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QrScanner;