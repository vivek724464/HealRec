import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";

import { dataService } from "@/services/dataService";

const FileUploadCard = ({ onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return ["png", "jpg", "jpeg", "pdf", "doc", "docx"].includes(
        extension || ""
      );
    });

    if (validFiles.length !== files.length) {
      toast.error(
        "Some files were rejected. Only PNG, JPG, PDF, and DOC files are allowed."
      );
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const navigate = useNavigate();

  const handleUpload = () => {
  if (selectedFiles.length === 0) {
    toast.error("Please select at least one file");
    return;
  }

  setUploading(true);

  const uploads = selectedFiles.map((file) => {
    const formData = new FormData();
    formData.append("report", file); // ✅ ONLY FILE
    return dataService.uploadReport(formData);
  });

  Promise.all(uploads)
    .then((results) => {
      const successCount = results.filter(r => r?.success).length;
      if (successCount > 0) {
        toast.success(`${successCount} file(s) uploaded successfully!`);
        onUploadSuccess?.();
      } else {
        toast.error("Failed to upload files");
      }
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    })
    .catch((err) => {
      console.error("Upload error:", err);
      toast.error("Error uploading files");
    })
    .finally(() => setUploading(false));
};

  return (
    <Card className="shadow-soft hover:shadow-elevated transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Medical Records
        </CardTitle>
        <CardDescription>
          Upload your medical documents (PNG, JPG, PDF, DOC)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to browse or drag and drop your files here
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PNG, JPG, PDF, DOC
            </p>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected files:</p>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-primary" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {/* Convert bytes to KB */}
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={handleUpload} className="w-full" disabled={uploading}>
              {uploading ? `Uploading...` : `Upload ${selectedFiles.length} file(s)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadCard;