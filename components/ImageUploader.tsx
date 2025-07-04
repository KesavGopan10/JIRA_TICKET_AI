
import React, { useRef } from 'react';
import { AttachmentIcon } from './icons/AttachmentIcon';

interface ImageUploaderProps {
    imageBase64: string | null;
    onImageSelect: (base64: string, mimeType: string) => void;
    onImageRemove: () => void;
    disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageBase64, onImageSelect, onImageRemove, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64String = loadEvent.target?.result as string;
                onImageSelect(base64String, file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-3 animate-fade-in">
            <label className="block text-sm font-medium text-gray-300">Attach Screenshot (Optional):</label>
            {imageBase64 ? (
                <div className="relative group">
                    <img src={imageBase64} alt="Screenshot preview" className="rounded-lg w-full max-w-xs border-2 border-gray-600" />
                    <button
                        onClick={onImageRemove}
                        disabled={disabled}
                        className="absolute top-2 right-2 p-1.5 bg-gray-900/70 text-white rounded-full hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        aria-label="Remove image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={disabled}
                    />
                    <button
                        onClick={handleButtonClick}
                        disabled={disabled}
                        className="w-full max-w-xs flex items-center justify-center gap-2 px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900/50"
                    >
                        <AttachmentIcon />
                        <span>Attach Screenshot</span>
                    </button>
                </>
            )}
        </div>
    );
};

export default ImageUploader;
