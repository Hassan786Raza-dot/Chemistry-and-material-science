import React from 'react';
import { XIcon } from './icons/XIcon';
import { LoaderIcon } from './icons/LoaderIcon';
import type { RecipeSuggestion } from '../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    isLoading: boolean;
    children: React.ReactNode | RecipeSuggestion | null;
    onApplyRecipe?: (recipe: RecipeSuggestion) => void;
}

// FIX: Add a type guard function to correctly narrow the type of 'children'.
// This helps TypeScript understand that if the value is not a RecipeSuggestion,
// it can be safely rendered as a ReactNode.
function isRecipeSuggestion(value: any): value is RecipeSuggestion {
    return typeof value === 'object' && value !== null && 'justification' in value;
}

const SimpleMarkdownParser: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
        <>
            {lines.map((line, index) => {
                let content: React.ReactNode = line;
                if (line.startsWith('* ')) {
                    content = <li className="ml-4">{line.substring(2)}</li>;
                }
                
                const parts = line.split('**');
                if (parts.length > 1) {
                    content = (
                        <p>
                            {parts.map((part, i) =>
                                i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                            )}
                        </p>
                    );
                     if (line.startsWith('* ')) {
                         content = (
                            <li className="ml-4">
                                {parts.slice(0,1)}
                                {parts.slice(1).map((part, i) =>
                                    i % 2 === 0 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                                )}
                            </li>
                        );
                     }
                }
                
                return <div key={index}>{content}</div>;
            })}
        </>
    );
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, isLoading, children, onApplyRecipe }) => {
    if (!isOpen) return null;

    const recipe = isRecipeSuggestion(children) ? children : null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 border border-slate-700 flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 id="modal-title" className="text-lg font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition" aria-label="Close modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 text-slate-300 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-32">
                            <LoaderIcon className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
                            <p>AI is thinking...</p>
                        </div>
                    ) : (
                       <div className="space-y-4">
                         {/* FIX: Use the type guard directly on `children` to ensure TypeScript can correctly narrow the type for rendering. */}
                         {isRecipeSuggestion(children) ? (
                             <>
                                <div className="space-y-2 text-sm bg-slate-900/50 p-3 rounded-md border border-slate-700">
                                    <h4 className="font-semibold text-slate-200">Suggested Recipe:</h4>
                                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                                        {children.monomerConcentrations.map(m => <li key={m.name}><strong>{m.name}:</strong> {m.concentration} mol/L</li>)}
                                        <li><strong>Initiator ({children.initiator}):</strong> {children.initiatorConcentration} mol/L</li>
                                        <li><strong>Temperature:</strong> {children.temperature}°C</li>
                                        {children.chainTransferAgent && children.ctaConcentration && <li><strong>CTA ({children.chainTransferAgent}):</strong> {children.ctaConcentration} mol/L</li>}
                                        {children.solvent && children.solventVolume && <li><strong>Solvent ({children.solvent}):</strong> {children.solventVolume} mL</li>}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                     <h4 className="font-semibold text-slate-200">Justification:</h4>
                                     <SimpleMarkdownParser text={children.justification} />
                                </div>
                             </>
                         ) : (
                           typeof children === 'string' ? <SimpleMarkdownParser text={children} /> : children
                         )}
                       </div>
                    )}
                </div>
                {recipe && onApplyRecipe && !isLoading && (
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                         <button 
                            onClick={onClose} 
                            className="bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition">
                            Cancel
                        </button>
                        <button 
                            onClick={() => onApplyRecipe(recipe)} 
                            className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition">
                            Apply to Form
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;