import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const [scanning, setScanning] = useState(false);
  const [currentData, setCurrentData] = useState<string>("No result");
  const [error, setError] = useState<string | null>(null);

  const beepSound = useRef(
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
  );

  useEffect(() => {
    if (scanning && videoRef.current) {
      setError(null);
      setCurrentData("No result");

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result: string) => {
          setCurrentData(result);
          beepSound.current.play();
          toast.success(`QR scanned: ${result}`);
          stopScanning();
        }
      );

      qrScannerRef.current.start().catch(() => {
        setError("Camera permission denied or not available.");
        setScanning(false);
      });
    }

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  function stopScanning() {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
  }

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <Toaster position="top-right" reverseOrder={false} />
      <h1>QR Scanner with qr-scanner</h1>
      <button
        onClick={() => setScanning((prev) => !prev)}
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
