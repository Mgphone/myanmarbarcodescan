import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const [scanning, setScanning] = useState(false);
  const [currentData, setCurrentData] = useState<string>("No result");
  const [error, setError] = useState<string | null>(null);

  const beepSound = useRef(
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
  );

  // Function to stop scanner and clear timeout
  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (scanning && videoRef.current) {
      setError(null);
      setCurrentData("No result");

      // Initialize scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result: string) => {
          setCurrentData(result);
          beepSound.current.play();
          toast.success(`QR scanned: ${result}`);
          // **Do not stop scanning here to allow full 1-minute scanning**
        }
      );

      // Start scanning
      qrScannerRef.current.start().catch(() => {
        setError("Camera permission denied or not available.");
        setScanning(false);
      });

      // Setup 1-minute timer to stop scanning
      timeoutRef.current = window.setTimeout(() => {
        stopScanning();
        setError("Stopped scanning after 1 minute.");
      }, 60 * 1000); // 60 seconds

      // Cleanup function on unmount or scanning change
      return () => {
        stopScanning();
      };
    }
  }, [scanning]);

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <Toaster position="top-right" reverseOrder={false} />
      <h1>QR Scanner (1 minute max)</h1>
      <button
        onClick={() => {
          if (scanning) {
            stopScanning();
          } else {
            setScanning(true);
          }
        }}
        style={{
          marginBottom: 20,
          padding: "10px 20px",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        {scanning ? "Stop Scanner" : "Start Scanner"}
      </button>

      <div
        style={{
          margin: "auto",
          maxWidth: 500,
          border: scanning ? "3px solid green" : "3px solid transparent",
          borderRadius: 8,
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", borderRadius: 8 }}
          muted
          playsInline
        />
      </div>

      <p>Scanned Data: {currentData}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
