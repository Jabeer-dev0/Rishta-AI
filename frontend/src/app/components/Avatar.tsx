import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
};

const avatarColors = ['#D70040', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777'];

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Simple hash for consistent color per user name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
  const bgColor = avatarColors[colorIndex];

  return (
    <div 
      className={`rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-sm ${sizeClasses[size]} ${className}`}
      style={!src ? { backgroundColor: bgColor } : {}}
    >
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.style.backgroundColor = bgColor;
            // This is a bit hacky but works to show initials on error
            const span = document.createElement('span');
            span.className = 'font-bold text-white';
            span.innerText = initials;
            (e.target as HTMLImageElement).parentElement!.appendChild(span);
          }}
        />
      ) : (
        <span className="font-bold text-white uppercase">{initials}</span>
      )}
    </div>
  );
};
