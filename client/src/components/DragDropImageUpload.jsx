import React, { useRef, useState } from 'react'
import { AiOutlineClose, AiOutlineUpload } from 'react-icons/ai';

function DragDropImageUpload({ onImageSelect }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    onImageSelect?.(file);
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    inputRef.current.value = null;
    onImageSelect?.(null);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      className={`
        w-full p-8 rounded-xl cursor-pointer
        border-2 border-dashed transition
        ${
          isDragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-blue-500/50 hover:border-purple-500"
        }
        bg-black/40
        flex items-center justify-center
      `}
    >
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-h-56 rounded-lg border border-white/10"
          />

          <button
            type="button"
            onClick={removeImage}
            className="
              absolute -top-3 -right-3
              w-8 h-8 rounded-full
              bg-black/80 text-white
              flex items-center justify-center
              hover:bg-red-600
              transition
            "
          >
            <AiOutlineClose size={18} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
            <AiOutlineUpload size={26} />
          </div>

          <p className="text-white font-semibold text-2xl sujoy1">
            Click to upload image
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

export default DragDropImageUpload