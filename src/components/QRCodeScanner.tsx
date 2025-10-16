import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QrScanner from "react-qr-scanner";

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const QRCodeScanner = ({ open, onClose, onScan }: QRCodeScannerProps) => {
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      setError("");
      checkCameraPermission();
    }
  }, [open]);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (err) {
      console.error("Camera permission error:", err);
      setError("Impossible d'accéder à la caméra. Veuillez autoriser l'accès dans les paramètres de votre navigateur.");
      setHasPermission(false);
    }
  };

  const handleScan = (result: any) => {
    if (result?.text) {
      onScan(result.text);
      onClose();
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scanner error:", err);
    if (!error) {
      setError("Erreur lors du scan. Assurez-vous que la caméra fonctionne correctement.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner le QR Code
          </DialogTitle>
          <DialogDescription>
            Positionnez le QR code devant la caméra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasPermission === true && (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%" }}
                constraints={{
                  video: { facingMode: "environment" }
                }}
              />
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center p-8 space-y-4">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Autorisez l'accès à la caméra pour scanner le QR code
              </p>
              <Button onClick={checkCameraPermission} variant="outline">
                Réessayer
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
