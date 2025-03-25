
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackDatabaseChange } from '@/utils/dbTracking';

type FileUploadProps = {
  bucketName: string;
  onFileUpload: (url: string) => void;
  existingUrl?: string;
  entityType: 'student' | 'employee' | 'educator';
  entityId?: string | number;
};

const FileUpload = ({ bucketName, onFileUpload, existingUrl, entityType, entityId }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 5MB.");
        return;
      }
      
      // Check file type for images
      if (bucketName.includes('photo') && !selectedFile.type.startsWith('image/')) {
        toast.error("Only image files are allowed for photos.");
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview (for images only)
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // For non-image files, just show the filename
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    
    try {
      setUploading(true);
      
      // Create a unique file name based on entity type and ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${entityType}-${entityId || Date.now()}.${fileExt}`;
      
      // Determine the correct bucket based on entityType and bucket name
      let targetBucket = bucketName;
      
      // For photos
      if (entityType === 'student') {
        targetBucket = 'student-photos';
      } else if (entityType === 'employee' && bucketName.includes('photo')) {
        targetBucket = 'employee-photos';
      } else if (entityType === 'educator' && bucketName.includes('photo')) {
        targetBucket = 'employee-photos'; // Use employee-photos for educators too
      }
      
      // For LOR documents
      if (bucketName.includes('lor')) {
        targetBucket = 'employee-lor'; // Use employee-lor for all LOR documents
      }
      
      console.log(`Uploading to bucket: ${targetBucket}, filename: ${fileName}`);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(data.path);
      
      onFileUpload(publicUrl);
      toast.success("File uploaded successfully!");
      
      // If this is an educator, also add to educator LOR bucket if it's a LOR doc
      if (entityType === 'employee' && bucketName.includes('lor') && 
          formData && formData.designation === 'Educator') {
        await supabase.storage
          .from('educator-lor')
          .copy(`${targetBucket}/${fileName}`, fileName);
      }
      
      // Track the file upload
      await trackDatabaseChange(`${targetBucket} (file upload)`, 'insert');
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPreviewUrl(existingUrl || null);
  };

  // Function to correctly handle the entityType with proper typing
  const getEntityTypeName = (type: 'student' | 'employee' | 'educator'): string => {
    switch (type) {
      case 'student': return 'Student';
      case 'employee': return 'Employee';
      case 'educator': return 'Employee'; // Changed to Employee
    }
  };

  // Determine if this is a document upload (for LOR) rather than an image
  const isDocumentUpload = bucketName.includes('lor');
  const fileTypeText = isDocumentUpload ? 'Document' : 'Photo';
  const acceptTypes = isDocumentUpload ? 
    ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,.rtf,.zip,.rar,.xlsx,.xls,.ppt,.pptx" : 
    "image/*";

  return (
    <div className="space-y-4">
      <Label htmlFor="file-upload">Upload {getEntityTypeName(entityType)} {fileTypeText}</Label>
      
      <div className="flex items-center gap-4">
        <Input
          id="file-upload"
          type="file"
          accept={acceptTypes}
          onChange={handleFileChange}
          className="max-w-sm"
        />
        
        {file && (
          <Button 
            type="button" 
            onClick={handleClearFile}
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {previewUrl && !isDocumentUpload && (
        <div className="relative w-32 h-32 border rounded overflow-hidden bg-gray-50">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {previewUrl && isDocumentUpload && (
        <div className="text-sm text-blue-600">
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            View uploaded document
          </a>
        </div>
      )}
      
      {file && !previewUrl && (
        <div className="text-sm text-gray-500">
          Selected file: {file.name}
        </div>
      )}
      
      {file && (
        <Button 
          type="button" 
          onClick={handleUpload}
          disabled={uploading}
          className="mt-2"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
