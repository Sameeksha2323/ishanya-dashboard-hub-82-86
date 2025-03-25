
import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileIcon, UploadCloud, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onFileUpload: (url: string) => void;
  label?: string;
  value?: string;
  bucket?: string;
  folder?: string;
  accept?: string; // file types to accept
  maxSize?: number; // in MB
  fileType?: 'image' | 'document' | 'any';
  entityType?: 'student' | 'employee' | 'educator';
  entityId?: string | number;
  existingUrl?: string;
  bucketName?: string;
}

const FileUpload = ({
  onFileUpload,
  label = 'Upload File',
  value,
  bucket = 'documents',
  folder = '',
  accept = '*',
  maxSize = 5, // 5MB default
  fileType = 'any',
  entityType,
  entityId,
  existingUrl,
  bucketName
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>(existingUrl || value || '');
  const [displayFileName, setDisplayFileName] = useState<string>(
    (existingUrl || value) ? (existingUrl || value || '').split('/').pop() || '' : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the bucketName prop if provided, otherwise use the bucket prop
  const effectiveBucket = bucketName || bucket;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFile = e.target.files[0];
    
    // Check file type if needed
    if (fileType === 'image' && !selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (fileType === 'document' && !selectedFile.type.includes('pdf') && 
        !selectedFile.type.includes('doc') && !selectedFile.type.includes('sheet') && 
        !selectedFile.type.includes('presentation')) {
      toast.error('Please upload a document file (PDF, Word, Excel, etc.)');
      return;
    }
    
    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    setFile(selectedFile);
    setDisplayFileName(selectedFile.name);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      
      // Create a more descriptive file path based on entity type and ID if available
      let filePath = '';
      if (entityType && entityId) {
        // Convert entityId to string to ensure compatibility
        const entityIdStr = String(entityId);
        filePath = `${entityType}-${entityIdStr}/${timestamp}-${file.name}`;
      } else if (folder) {
        filePath = `${folder}/${timestamp}-${file.name}`;
      } else {
        filePath = `${timestamp}-${file.name}`;
      }
      
      // Check if bucket exists, if not try to create it
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === effectiveBucket)) {
        const { error: bucketError } = await supabase.storage.createBucket(effectiveBucket, {
          public: true
        });
        
        if (bucketError) {
          console.error('Error creating bucket:', bucketError);
          toast.error('Error creating storage bucket');
          setUploading(false);
          return;
        }
      }
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(effectiveBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Error uploading file');
        setUploading(false);
        return;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(effectiveBucket)
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      setUploadedUrl(publicUrl);
      onFileUpload(publicUrl);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error in upload process:', error);
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadedUrl('');
    setDisplayFileName('');
    onFileUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (file || uploadedUrl) {
      if (fileType === 'image' || (file && file.type.startsWith('image/'))) {
        return uploadedUrl ? (
          <img 
            src={uploadedUrl} 
            alt="Preview" 
            className="w-12 h-12 object-cover rounded"
          />
        ) : null;
      } else {
        return <FileIcon className="h-8 w-8 text-blue-500" />;
      }
    }
    return null;
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {(file || uploadedUrl) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleClearFile}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
        {(file || uploadedUrl) ? (
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayFileName}
              </p>
              {file && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              )}
            </div>
            {!uploadedUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-3 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Click to select a file
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {fileType === 'image' 
                ? 'JPG, PNG, GIF up to ' 
                : fileType === 'document' 
                  ? 'PDF, DOCX, XLSX up to '
                  : 'Any file up to '}
              {maxSize}MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
        />
      </div>
      
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full w-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
