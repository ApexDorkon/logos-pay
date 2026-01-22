import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-[var(--paper)] border-2 border-[var(--ink)] rounded-lg p-6 ${className}`}>
            {children}
        </div>
    );
}
