import {
	Plugin,
} from 'obsidian';

import { CompletionEngine } from './CompletionEngine';
import { MathSuggest } from './MathSuggest';
import { LLMProvider } from './LLMProvider';

export default class MathCompletePlugin extends Plugin {

	private completionEngine!: CompletionEngine;
	private mathSuggest!: MathSuggest;

	async onload() {
		const provider = new LLMProvider({
			endpoint: 'http://localhost:11434/v1/chat/completions',
			apiKey: '',
			model: 'gemma4:12b',
		});

		this.completionEngine = new CompletionEngine(
			provider,
		);

		this.mathSuggest = new MathSuggest(
			this.app,
			this.completionEngine,
		);

		this.registerEditorSuggest(this.mathSuggest);

		this.addCommand({
			id: 'trigger-math-completion',
			name: 'Trigger math completion',
			hotkeys: [
				{
					modifiers: ['Mod'],
					key: ' ',
				},
			],
			editorCallback: (editor) => {
				// trigger suggestion
			},
		});
	}
}