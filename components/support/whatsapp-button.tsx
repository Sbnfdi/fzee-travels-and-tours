'use client';

import React from 'react';
import { getWhatsAppUrl, getTopicWhatsAppUrl, WHATSAPP_CONFIG, WhatsAppTopic } from '@/lib/whatsapp';

// Authentic WhatsApp Brand Icon SVG component
export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.854 0-3.674-.497-5.267-1.439l-.377-.224-3.914 1.026 1.044-3.813-.247-.393c-1.036-1.648-1.583-3.557-1.583-5.517 0-5.74 4.67-10.41 10.412-10.41 2.782 0 5.399 1.084 7.366 3.053 1.968 1.969 3.05 4.587 3.049 7.37 0 5.742-4.67 10.413-10.41 10.413m0-22.623c-6.733 0-12.213 5.48-12.213 12.213 0 2.152.562 4.254 1.63 6.107l-1.733 6.331 6.478-1.699c1.782.971 3.791 1.483 5.834 1.484 6.733 0 12.214-5.48 12.214-12.214 0-3.264-1.271-6.333-3.58-8.641-2.308-2.308-5.377-3.581-8.63-3.581" />
    </svg>
  );
}

interface WhatsAppButtonProps {
  topic?: WhatsAppTopic;
  message?: string;
  numberKey?: 'primary' | 'secondary';
  variant?: 'solid' | 'outline' | 'minimal' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  showNumber?: boolean;
}

export function WhatsAppButton({
  topic,
  message,
  numberKey = 'primary',
  variant = 'solid',
  size = 'md',
  children,
  className = '',
  showNumber = false,
}: WhatsAppButtonProps) {
  const url = topic
    ? getTopicWhatsAppUrl(topic)
    : getWhatsAppUrl(message, numberKey);

  const config = WHATSAPP_CONFIG[numberKey];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-xl font-semibold',
    lg: 'px-6 py-3.5 text-base gap-2.5 rounded-xl font-bold',
  };

  const variantClasses = {
    solid:
      'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98]',
    outline:
      'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all',
    minimal:
      'text-[#25D366] hover:text-[#1da851] hover:bg-[#25D366]/10 transition-colors',
    floating:
      'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl shadow-[#25D366]/30 hover:scale-105 active:scale-95 rounded-full p-3.5',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center cursor-pointer select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <WhatsAppIcon className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
      <span>
        {children || (
          <>
            Chat on WhatsApp
            {showNumber && ` (${config.displayNumber})`}
          </>
        )}
      </span>
    </a>
  );
}
