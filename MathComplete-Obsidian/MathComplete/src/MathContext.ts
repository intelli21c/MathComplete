import {
    Editor
} from 'obsidian';

export interface MathContext {
    insideMath: boolean;
    delimiter: string;
    start: number;
    end: number;
    formula: string;
    cursorOffset: number;
}

/**
 * Returns the TeX expression surrounding the current cursor,
 * or null when the cursor is not inside a recognised math expression.
 *
 * Currently recognised:
 *
 *   $...$
 *   $$...$$
 */
export function getMathContext(editor: Editor): MathContext | null {
    const text = editor.getValue();
    const cursorOffset = editor.posToOffset(editor.getCursor());

    /*
     * We currently recognise:
     *
     *   $...$
     *   $$...$$
     *
     * The cursor must be inside the delimiters. An unclosed
     * expression is also considered active.
     */

    let i = 0;
    let insideValidContext = false;
    while (i < cursorOffset) {
        // Ignore escaped characters.
        if (text[i] === '\\') {
            i += 2;
            continue;
        }

        /*
         * Display math: $$ ... $$
         *
         * Check this before checking single '$', because "$$"
         * consists of two '$' characters.
         */
        //$$ is greedy. it only matches with closing $$.
        if (text.startsWith('$$', i)) {
            const start = i + 2;
            insideValidContext = true;

            // Find the closing "$$".
            let end = start;

            while (end < cursorOffset) {
                if (text[end] === '\\') {
                    end += 2;
                    continue;
                }

                if (text.startsWith('$$', end)) {
                    insideValidContext = false;
                    break;
                }

                end++;
            }

            if (!insideValidContext) { //context is closed before cursor.
                i = end + 2;
            } else {
                //the cursor is inside $$. Is it closed?
                let j = cursorOffset;
                while (j < text.length) {
                    if (text.startsWith('$$', j)) {
                        return {
                            insideMath: true,
                            delimiter: '$$',
                            start,
                            end: j,
                            formula: text.slice(start, j),
                            cursorOffset: cursorOffset - start,
                        };
                    }
                    j++;
                }
                return null;
            }
            continue;
        }

        /*
         * Inline math: $ ... $
         */
        if (text[i] === '$') {
            const start = i + 1;
            insideValidContext = true;

            let end = start;

            while (end < cursorOffset) {
                if (text[end] === '\\') {
                    end += 2;
                    continue;
                }

                if (text[end] === '$') {
                    insideValidContext = false;
                    if (text[end - 1] === ' ') {
                        //this is not counted as valid context.
                        //however, this can be start of other $$, so rewind 1 char to check.
                        if (text.startsWith('$$', end)) {
                            end -= 2;
                        }
                    }


                    break;
                }



                if (text[end] === '\n') {
                    insideValidContext = false;
                    break;
                }

                end++;
            }

            if (!insideValidContext) {
                //inline context is closed
                i = end + 1;
            } else {
                //the cursor is inside $$. Is it closed?
                let j = cursorOffset;
                while (j < text.length) {

                    if (text[j] === '\n') {
                        return null;
                    }

                    if (text[j] === '$') {
                        if (text[j - 1] === ' ') {
                            return null;
                        }
                        return {
                            insideMath: true,
                            delimiter: '$',
                            start,
                            end: j,
                            formula: text.slice(start, j),
                            cursorOffset: cursorOffset - start,
                        };
                    }
                    j++;
                }
                return null;
            }
            continue;
        }
        i++;
    }
    return null;
}