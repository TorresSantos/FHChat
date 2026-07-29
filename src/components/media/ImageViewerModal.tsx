import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCw, X, Download, Image as ImageIcon } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt?: string;
  onRotationChange?: (url: string, newRotation: number) => void;
  initialRotation?: number;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt = 'Foto enviada',
  onRotationChange,
  initialRotation = 0
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(initialRotation);

  useEffect(() => {
    setRotation(initialRotation);
    setZoom(1);
  }, [imageUrl, initialRotation]);

  if (!isOpen || !imageUrl) return null;

  const handleRotateLeft = () => {
    const nextRot = (rotation - 90) % 360;
    setRotation(nextRot);
    if (onRotationChange) {
      onRotationChange(imageUrl, nextRot);
    }
  };

  const handleRotateRight = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    if (onRotationChange) {
      onRotationChange(imageUrl, nextRot);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    if (onRotationChange) {
      onRotationChange(imageUrl, 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none">
      {/* Top Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between text-gray-200 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <ImageIcon className="w-4 h-4" />
          <span>Visualizador de Imagem</span>
          <span className="text-gray-500 font-mono text-[11px]">({Math.round(zoom * 100)}% | {rotation}°)</span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all cursor-pointer"
            title="Reduzir Zoom (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all cursor-pointer"
            title="Aumentar Zoom (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-gray-700 mx-1" />
          <button
            onClick={handleRotateLeft}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs"
            title="Girar para Esquerda (-90°)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">-90°</span>
          </button>
          <button
            onClick={handleRotateRight}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs"
            title="Girar para Direita (+90°)"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">+90°</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1"
            title="Resetar Ângulo e Zoom"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Resetar</span>
          </button>
          <div className="h-4 w-px bg-gray-700 mx-1" />
          <a
            href={imageUrl}
            download="imagem_whatsapp"
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer"
            title="Baixar Foto"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-rose-600 text-gray-200 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-4 relative">
        <div
          className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-h-[75vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-gray-800"
          />
        </div>
      </div>

      {/* Persistent Angle Notice */}
      <div className="text-[11px] text-gray-400 bg-gray-900 border border-gray-800 px-4 py-1.5 rounded-full mb-2">
        A rotação final (<strong className="text-emerald-400">{rotation}°</strong>) é salva e mantida permanentemente no chat do atendimento.
      </div>
    </div>
  );
};
