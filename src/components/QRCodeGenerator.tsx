// components/QRCodeGenerator.tsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 128 
}) => {
  return (
    <div className="flex flex-col items-center p-4">
      <QRCodeSVG 
        value={value} 
        size={size} 
        level="H" 
        includeMargin={true} 
      />
      <p className="mt-2 text-sm text-gray-600">Scan this QR code</p>
    </div>
  );
};