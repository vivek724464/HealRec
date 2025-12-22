import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Share2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MedicalRecordCard = ({
  fileName,
  fileType,
  uploadDate,
  fileSize = "—",
  sharedWith = [],
  onView,
  onDownload,
  onShare,
  onDelete,
}) => {
  const getFileIcon = () => {
    switch ((fileType || "").toLowerCase()) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "png":
      case "jpg":
      case "jpeg":
        return "🖼️";
      default:
        return "📁";
    }
  };

  return (
    <Card className="hover:shadow-elevated transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl">
            {getFileIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{fileName}</h4>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {fileType?.toUpperCase()}
                  </Badge>
                  <span>•</span>
                  <span>{fileSize}</span>
                  <span>•</span>
                  <span>{uploadDate}</span>
                </div>
              </div>
            </div>

            {sharedWith.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Share2 className="h-3 w-3" />
                <span>Shared with {sharedWith.length} doctor(s)</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalRecordCard;
