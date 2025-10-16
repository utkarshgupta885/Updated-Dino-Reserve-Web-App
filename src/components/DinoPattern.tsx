import React from 'react';

export function DinoPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.02]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dino-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Cute little dino 1 */}
            <g transform="translate(30, 50)">
              <ellipse cx="15" cy="30" rx="12" ry="15" fill="currentColor" className="text-green-400 dark:text-green-800" />
              <circle cx="15" cy="20" r="10" fill="currentColor" className="text-green-400 dark:text-green-800" />
              <ellipse cx="10" cy="35" rx="3" ry="5" fill="currentColor" className="text-green-400 dark:text-green-800" />
              <ellipse cx="20" cy="35" rx="3" ry="5" fill="currentColor" className="text-green-400 dark:text-green-800" />
              <circle cx="12" cy="18" r="1.5" fill="currentColor" className="text-green-800 dark:text-green-600" />
              <circle cx="18" cy="18" r="1.5" fill="currentColor" className="text-green-800 dark:text-green-600" />
            </g>
            
            {/* Cute little dino 2 - flipped */}
            <g transform="translate(130, 120)">
              <ellipse cx="15" cy="30" rx="12" ry="15" fill="currentColor" className="text-orange-400 dark:text-orange-900" />
              <circle cx="15" cy="20" r="10" fill="currentColor" className="text-orange-400 dark:text-orange-900" />
              <ellipse cx="10" cy="35" rx="3" ry="5" fill="currentColor" className="text-orange-400 dark:text-orange-900" />
              <ellipse cx="20" cy="35" rx="3" ry="5" fill="currentColor" className="text-orange-400 dark:text-orange-900" />
              <circle cx="12" cy="18" r="1.5" fill="currentColor" className="text-orange-800 dark:text-orange-700" />
              <circle cx="18" cy="18" r="1.5" fill="currentColor" className="text-orange-800 dark:text-orange-700" />
              {/* Little tail */}
              <path d="M 25 30 Q 30 28, 28 25" stroke="currentColor" strokeWidth="3" fill="none" className="text-orange-400 dark:text-orange-900" strokeLinecap="round" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dino-pattern)" />
      </svg>
    </div>
  );
}
