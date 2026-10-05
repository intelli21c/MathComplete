import {
    App,
    Editor,
    EditorPosition,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    TFile,
} from 'obsidian';

import { CompletionEngine } from './CompletionEngine';
import { getMathContext, MathContext } from './MathContext';

export class MathSuggest extends EditorSuggest<string> {
    private completionEngine: CompletionEngine;
    private currentContext: EditorSuggestContext | null = null;

    constructor(app: App, completionEngine: CompletionEngine) {
        super(app);
        this.completionEngine = completionEngine;
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        file: TFile | null,
    ): EditorSuggestTriggerInfo | null {
        const context = getMathContext(editor);

        if (!context) {
            return null;
        }

        return {
            start: editor.offsetToPos(context.start),
            end: editor.offsetToPos(context.end),
            query: context.formula,
        };
    }

    async getSuggestions(
        context: EditorSuggestContext,
    ): Promise<string[]> {
        const mathContext = getMathContext(context.editor);

        if (!mathContext) {
            return [];
        }

        try {
            return await this.completionEngine.getCompletions(mathContext,);
        } catch (error) {
            console.error(
                'MathComplete: completion request failed',
                error,
            );
            return [];
        }
    }

    renderSuggestion(
        value: string,
        el: HTMLElement,
    ): void {
        el.setText(value);
    }

    selectSuggestion(
        value: string,
        _evt: MouseEvent | KeyboardEvent,
    ): void {
        if (!this.currentContext) {
            return;
        }
        const editor = this.currentContext.editor;

        editor.replaceRange(
            value,
            this.currentContext.start,
            this.currentContext.end,
        );
    }
}