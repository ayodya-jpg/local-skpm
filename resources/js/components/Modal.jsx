import React from 'react';

function Modal({ title, subtitle, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-950">
                            {title}
                        </h3>

                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-7">{children}</div>
            </div>
        </div>
    );
}

export default Modal;
