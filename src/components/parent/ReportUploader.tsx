
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface ReportUploaderProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ReportUploader = ({ onSuccess, onCancel }: ReportUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }
    
    const user = getCurrentUser();
    if (!user) {
      setError("You must be logged in to upload reports");
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(10);
      
      // Get parent's student_id
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('student_id')
        .eq('email', user.email)
        .single();
        
      if (parentError || !parentData || !parentData.student_id) {
        throw new Error("Could not determine student ID");
      }
      
      setUploadProgress(30);
      
      // Prepare file path and ensure unique filename
      const timestamp = new Date().getTime();
      const fileExtension = selectedFile.name.split('.').pop();
      const fileName = `${timestamp}-${selectedFile.name}`;
      const filePath = `student-reports/${parentData.student_id}/${fileName}`;
      
      setUploadProgress(50);
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('ishanya')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      setUploadProgress(100);
      setSuccess(true);
      
      // Give a moment for the user to see the success state
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err) {
      console.error('Error uploading report:', err);
      setError(err instanceof Error ? err.message : "Failed to upload report");
      setUploading(false);
    }
  };
  
  const handleCancel = () => {
    if (uploading) return;
    onCancel();
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success ? (
        <div className="text-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Upload Complete!</h3>
          <p className="text-gray-500">Your report has been uploaded successfully.</p>
        </div>
      ) : (
        <>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedFile(null);
                    if (inputRef.current) {
                      inputRef.current.value = '';
                    }
                  }}
                  className="mt-2"
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-300 mx-auto" />
                <div>
                  <p className="font-medium">Drag and drop your file here</p>
                  <p className="text-sm text-gray-500">
                    or click to browse your files
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => inputRef.current?.click()}
                >
                  Select File
                </Button>
              </div>
            )}
            
            <Input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-gray-500 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Report
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportUploader;
