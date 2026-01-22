import React from 'react';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start pt-24 pb-24 px-4 sm:px-6">
      <div className="w-full max-w-7xl space-y-8">
        {children}
      </div>
    </main>
  );
}
