// Question stem + options (Markdown). Single answer = radio, multiple = checkboxes limited to `choose`. Letters shown are
// display positions (A, B, … in on-screen order); stored values are the canonical keys.
import { useMemo } from 'react';
import { renderMarkdown, InlineMarkdown } from '../lib/markdown.tsx';
import { chooseLabel, letter } from '../lib/format.ts';

export interface ViewOption {
  key: string; // canonical letter
  text: string;
}

export function Stem({ text }: { text: string }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return <div className="q-stem md" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ChooseHint({ n, chosen }: { n: number; chosen?: number }) {
  if (n <= 1) return null;
  return (
    <div className="q-hint">
      ☑ Chọn {n} đáp án (Choose {chooseLabel(n)}){chosen !== undefined ? ` · đã chọn ${chosen}/${n}` : ''}
    </div>
  );
}

export function OptionList({
  name,
  options,
  chosen,
  choose,
  onPick,
  answer,
  disabled,
}: {
  name: string;
  options: ViewOption[];
  chosen: string[];
  choose: number;
  onPick?: (key: string) => void;
  answer?: string[]; // reveal: the key
  disabled?: boolean;
}) {
  const multi = choose > 1;
  const full = multi && chosen.length >= choose;
  return (
    <div className="opts" role={multi ? 'group' : 'radiogroup'} aria-label="Các phương án">
      {options.map((o, i) => {
        const picked = chosen.includes(o.key);
        const isKey = answer?.includes(o.key);
        let cls = picked ? 'selected' : '';
        let mark = '';
        if (answer) {
          if (isKey && picked) [cls, mark] = ['correct', '✓ bạn chọn đúng'];
          else if (isKey) [cls, mark] = ['correct missed', '✓ đáp án đúng'];
          else if (picked) [cls, mark] = ['wrong', '✗ bạn chọn'];
          else cls = '';
        }
        const blocked = disabled || !onPick || (full && !picked && !answer);
        return (
          <label key={o.key} className={`opt ${multi ? 'multi' : ''} ${cls} ${blocked && !answer ? 'blocked' : ''} ${disabled || !onPick ? 'locked' : ''}`}>
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={name}
              value={o.key}
              checked={picked}
              disabled={disabled || !onPick}
              onChange={() => onPick?.(o.key)}
              aria-label={`Phương án ${letter(i)}`}
            />
            <span className="key" aria-hidden="true">
              {letter(i)}
            </span>
            <span className="text">
              <InlineMarkdown text={o.text} />
            </span>
            {mark && <span className={`mark ${cls.startsWith('wrong') ? 'bad' : 'good'}`}>{mark}</span>}
          </label>
        );
      })}
    </div>
  );
}

/** Display letters of `keys` within `options` order (e.g. canonical C → shown as A after shuffling). */
export function displayLetters(options: ViewOption[], keys: string[]): string {
  return keys
    .map((k) => {
      const i = options.findIndex((o) => o.key === k);
      return i >= 0 ? letter(i) : k;
    })
    .sort()
    .join(', ');
}
