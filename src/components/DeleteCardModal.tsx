"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteCardModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteCardModal({ isOpen, onConfirm, onCancel }: DeleteCardModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Payment Card?</h3>

                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 text-left">
                        <p className="text-xs text-red-800 font-medium">⚠️ Critical Warning</p>
                        <p className="text-xs text-red-700 mt-1">
                            Deleting this card from your dashboard <strong>does not refund</strong> any balance remaining on it.
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                            You may <strong>permanently lose access</strong> to funds stored on this card if you have not withdrawn them first.
                        </p>
                    </div>

                    <p className="text-sm text-gray-500">
                        Are you sure you want to proceed? This action cannot be undone.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-px bg-gray-100">
                    <button
                        onClick={onCancel}
                        className="bg-white p-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-white p-4 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none transition-colors"
                    >
                        Delete Card
                    </button>
                </div>
            </div>
        </div>
    );
}
