
import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttachmentIcon } from './icons/AttachmentIcon';

interface ImageUploaderProps {
    imageBase64: string | null;
    onImageSelect: (base64: string, mimeType: string) => void;
    onImageRemove: () => void;
    disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    imageBase64, 
    onImageSelect, 
    onImageRemove, 
    disabled 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processImageFile(file);
        }
        // Reset the input value to allow selecting the same file again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processImageFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadstart = () => setIsDragging(true);
        reader.onload = (loadEvent) => {
            const base64String = loadEvent.target?.result as string;
            onImageSelect(base64String, file.type);
            setIsDragging(false);
        };
        reader.onerror = () => {
            setIsDragging(false);
            // Handle error state if needed
        };
        reader.readAsDataURL(file);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (disabled) return;
        
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processImageFile(file);
        }
    }, [disabled]);

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Screenshot (Optional)
                <span className="text-xs text-gray-400 ml-1">Click or drag & drop</span>
            </label>
            
            <AnimatePresence>
                {imageBase64 ? (
                    <motion.div 
                        className="relative group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="relative overflow-hidden rounded-xl border-2 border-gray-700/50 bg-gray-800/30 shadow-inner">
                            <img 
                                src={imageBase64} 
                                alt="Screenshot preview" 
                                className="w-full h-auto max-h-64 object-contain rounded-lg" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onImageRemove();
                                    }}
                                    disabled={disabled}
                                    className="ml-auto px-3 py-1.5 text-sm font-medium bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-1.5 shadow-lg"
                                    aria-label="Remove image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleButtonClick}
                        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                            isDragging 
                                ? 'border-blue-400 bg-blue-500/10' 
                                : 'border-gray-600/50 hover:border-blue-400/50 bg-gray-800/20 hover:bg-gray-700/30'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={disabled}
                        />
                        <div className="flex flex-col items-center justify-center text-center space-y-3">
                            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                                <AttachmentIcon className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-200">
                                    {isDragging ? 'Drop image here' : 'Upload a screenshot'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {isDragging ? '' : 'Click to browse or drag & drop'}
                                </p>
                            </div>
                            <span className="text-xs text-gray-500">
                                PNG, JPG up to 5MB
                            </span>
                        </div>
                        {isDragging && (
                            <div className="absolute inset-0 bg-blue-500/5 rounded-xl pointer-events-none"></div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageUploader;
