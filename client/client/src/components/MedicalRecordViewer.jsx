import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MedicalRecordViewer = ({ open, onClose, record }) => {
  if (!record) return null;

  const isImage = record.fileType.startsWith("image/");
  const isPDF = record.fileType === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{record.fileName}</DialogTitle>
        </DialogHeader>

        {isImage && (
          <img
            src={record.url}
            alt={record.fileName}
            className="w-full h-full object-contain"
          />
        )}

        {isPDF && (
          <iframe
            src={record.url}
            title={record.fileName}
            className="w-full h-full"
          />
        )}

        {!isImage && !isPDF && (
          <p className="text-center text-muted-foreground">
            Preview not supported. Please download the file.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MedicalRecordViewer;
