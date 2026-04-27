import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [message, setMessage] = useState('');
  const [scannerInstance, setScannerInstance] = useState(null);
  const [permissionError, setPermissionError] = useState('');
  
  const scannerRef = useRef(null);

  // Initialize scanner with proper mobile support
  const initializeScanner = () => {
    if (scannerInstance) {
      try {
        scannerInstance.clear();
      } catch (error) {
      
      }
    }

    setPermissionError('');
    setMessage('Initializing camera...');
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      supportedScanTypes: [],
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2,
      videoConstraints: {
        facingMode: { ideal: "environment" }
      }
    };

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      );

      scanner.render(
        (decodedText) => {
          setScannedData(decodedText);
          setIsScanning(false);
          try {
            scanner.clear();
          } catch (error) {
            // Ignore cleanup errors
          }
          handleScanSuccess(decodedText);
        },
        (error) => {
          const errorString = String(error);
          
          if (errorString.includes('NotAllowedError') || errorString.includes('Permission')) {
            setPermissionError('Camera permission denied. Please allow camera access and try again.');
            setIsScanning(false);
            setMessage('');
            try {
              scanner.clear();
            } catch (e) {
              // Ignore cleanup errors
            }
          } else if (errorString.includes('NotFoundError')) {
            setPermissionError('No camera found on this device.');
            setIsScanning(false);
            setMessage('');
          } else if (errorString.includes('NotReadableError')) {
            setPermissionError('Camera is being used by another application.');
            setIsScanning(false);
            setMessage('');
          }
          // Ignore frequent scanning errors
        }
      );

      setScannerInstance(scanner);
      setMessage('');
    } catch (error) {
      console.error('Error initializing scanner:', error);
      setPermissionError('Failed to initialize camera. Please refresh and try again.');
      setIsScanning(false);
      setMessage('');
    }
  };

  // Handle successful QR scan
  const handleScanSuccess = async (qrData) => {
    try {
      setMessage('Processing QR code...');
      
      if (onSuccess) {
        // Call the parent component's success handler
        await onSuccess(qrData);
        setMessage('QR code scanned successfully!');
      } else {
        setMessage('QR code scanned: ' + qrData.substring(0, 50) + '...');
      }
    } catch (error) {
      setMessage('Failed to process QR code. Please try again.');}
  };

  // Start scanning
  const startScanning = () => {
    setIsScanning(true);
    setMessage('');
    setScannedData('');
    setPermissionError('');
    setTimeout(() => {
      initializeScanner();
    }, 100);
  };

  // Stop scanning
  const stopScanning = () => {
    if (scannerInstance) {
      try {
        scannerInstance.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      setScannerInstance(null);
    }
    setIsScanning(false);
    setPermissionError('');
  };

  // Reset scanner
  const resetScanner = () => {
    stopScanning();
    setMessage('');
    setScannedData('');
    setPermissionError('');
  };

  useEffect(() => {
    return () => {
      if (scannerInstance) {
        try {
          scannerInstance.clear();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [scannerInstance]);

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-lg font-bold text-center mb-4">Scan QR Code</h3>
      
      {/* Scanner Container */}
      <div className="mb-6">
        {!isScanning ? (
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600">Ready to scan QR code</p>
              {permissionError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{permissionError}</p>
                </div>
              )}
            </div>
            <button
              onClick={startScanning}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
            >
              {permissionError ? 'Try Again' : 'Start Scanning'}
            </button>
          </div>
        ) : (
          <div>
            <div id="qr-reader" ref={scannerRef} className="mb-4"></div>
            {permissionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{permissionError}</p>
              </div>
            )}
            <button
              onClick={stopScanning}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
            >
              Stop Scanning
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.includes('') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : message.includes('')
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <p className="font-medium">{message}</p>
        </div>
      )}

      {/* Scanned Data (for debugging) */}
      {scannedData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600 font-mono break-all">
            Scanned: {scannedData.substring(0, 50)}...
          </p>
        </div>
      )}

      {/* Reset Button */}
      {(message || scannedData) && (
        <button
          onClick={resetScanner}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
        >
          Scan Another Code
        </button>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Allow camera access when prompted by your browser</li>
          <li>• Point your camera at the QR code displayed by your teacher</li>
          <li>• Make sure you're in the correct classroom</li>
          <li>• QR codes are only valid during class time</li>
          <li>• You can only mark attendance once per subject per day</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;