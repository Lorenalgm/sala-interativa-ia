import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Suggestion } from '../../services/suggestions';

// Sugestões para o professor, cada uma com o motivo. Ele decide se segue.
export const SuggestionsPanel: React.FC<{ suggestions: Suggestion[] }> = ({ suggestions }) => {
  if (suggestions.length === 0) return null;
  return (
    <section aria-label="Sugestões para o professor" className="no-print bg-amber-50 border border-amber-200 rounded-box p-4 space-y-3">
      <h2 className="font-bold text-amber-950 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-700" aria-hidden="true" />
        Sugestões
      </h2>
      <ul className="space-y-2.5">
        {suggestions.map((s) => (
          <li key={s.id}>
            <p className="font-semibold text-amber-950">{s.text}</p>
            <p className="text-sm text-amber-900/80">{s.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
