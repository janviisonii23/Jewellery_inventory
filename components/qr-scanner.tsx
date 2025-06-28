"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface QrScannerProps {
  onScan: (qrData: string) => void
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    const initializeScanner = async () => {
      try {
        if (!containerRef.current) {
          throw new Error("Container not found");
        }

        // Create instance of scanner
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        console.log("Checking for cameras...");
        const cameras = await Html5Qrcode.getCameras();
        console.log("Available cameras:", cameras);
        
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id;
          console.log("Using camera:", cameraId);
          
          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              videoConstraints: {
                facingMode: { ideal: "environment" }
              }
            },
        (decodedText) => {
              if (decodedText) {
                html5QrCode?.pause();
                onScan(decodedText);
                toast({
                  title: "QR Code Scanned",
                  description: "Successfully scanned QR code",
                });
                // Don't stop the camera, just pause it
                setTimeout(() => {
                  html5QrCode?.resume();
                }, 1000);
              }
        },
        (errorMessage) => {
              // Ignore not found errors as they're normal during scanning
              if (!errorMessage.includes("QR code not found")) {
                console.error("QR Scan error:", errorMessage);
              }
            }
          );
          
          setIsLoading(false);
          console.log("Scanner started successfully");
        } else {
          throw new Error("No cameras found on this device");
        }
      } catch (error) {
        console.error("Scanner initialization error:", error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : "Failed to access camera");
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      console.log("Starting scanner initialization...");
      initializeScanner();
    }, 1000);

      return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        try {
          console.log("Stopping scanner...");
          scannerRef.current.stop().catch(error => {
            console.error("Error stopping scanner:", error);
          });
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      }
    };
  }, [onScan]);

  const retryScanner = () => {
    console.log("Retrying scanner initialization...");
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    
    // Force cleanup of previous scanner instance
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    
    // Clear the container
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div id="qr-reader"></div>';
    }
    
    // Reinitialize with a delay
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id;
          
          html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              videoConstraints: {
                facingMode: { ideal: "environment" }
              }
            },
            (decodedText) => {
              if (decodedText) {
                html5QrCode.pause();
                onScan(decodedText);
                toast({
                  title: "QR Code Scanned",
                  description: "Successfully scanned QR code",
                });
                setTimeout(() => {
                  html5QrCode.resume();
                }, 1000);
              }
            },
            (errorMessage) => {
              if (!errorMessage.includes("QR code not found")) {
                console.error("QR Scan error:", errorMessage);
              }
            }
          ).then(() => {
            setIsLoading(false);
            console.log("Scanner restarted successfully");
          }).catch(err => {
            console.error("Error starting camera:", err);
            setHasError(true);
            setErrorMessage(err.toString());
            setIsLoading(false);
          });
        } else {
          setHasError(true);
          setErrorMessage("No cameras found on this device");
          setIsLoading(false);
        }
      }).catch(err => {
        console.error("Error getting cameras:", err);
        setHasError(true);
        setErrorMessage("Failed to access cameras");
        setIsLoading(false);
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>Initializing camera...</p>
        <p className="text-sm text-muted-foreground">This may take a few seconds</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-destructive">
        <p>Failed to access camera</p>
        <p className="text-sm">{errorMessage || "Please check your camera permissions and try again"}</p>
        <Button onClick={retryScanner} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div id="qr-reader" className="w-full max-w-[500px] mx-auto overflow-hidden rounded-md" />
      <p className="text-sm text-center mt-4 text-muted-foreground">
        Center the QR code in the frame to scan automatically
      </p>
      <style jsx global>{`
        #qr-reader {
          width: 100% !important;
          border: none !important;
          min-height: 300px;
        }
        #qr-reader video {
          width: 100% !important;
          height: auto !important;
          object-fit: cover;
          border-radius: 0.5rem;
        }
        #qr-reader__dashboard_section_csr button {
          display: none !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
        #qr-reader__dashboard_section_fsr {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
