import { useState, useRef, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [scanning, setScanning] = useState(false);
  const [currentData, setCurrentData] = useState<string>("No result");
  const [error, setError] = useState<string | null>(null);

  const beepSound = useRef(
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
  );

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (scanning) {
      setError(null);
      setCurrentData("No result");

      timeoutRef.current = window.setTimeout(() => {
        setScanning(false);
        setError("No QR code found after 1 minute.");
      }, 60 * 1000);
    } else {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [scanning]);

  const handleScan = (result: unknown) => {
    if (
      result &&
      typeof result === "object" &&
      result !== null &&
      "text" in result &&
      typeof result.text === "string"
    ) {
      const res = result as { text: string };

      // Optional: filter for QR-specific patterns (e.g., URL or JSON, etc.)
      if (res.text.trim() !== "") {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setCurrentData(res.text);
        beepSound.current.play();
        toast.success(`QR scanned: ${res.text}`);
        setScanning(false);
      }
    } else {
      setCurrentData("No result");
    }
  };

  return (
    <div className="box">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="title">QR Scanner</div>

      <button
        onClick={() => setScanning((prev) => !prev)}
        style={{ marginBottom: 20, padding: "10px 20px" }}
      >
        {scanning ? "Stop Scanner" : "Start Scanner"}
      </button>

      {scanning && (
        <div className="scan">
          <BarcodeScannerComponent
            width={500}
            height={500}
            onUpdate={handleScan}
            delay={1500}
          />
        </div>
      )}

      <p>Scanned Data: {currentData}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
