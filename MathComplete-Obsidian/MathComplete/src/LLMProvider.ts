import { MathContext } from './MathContext';

export interface LLMProviderConfig {
    endpoint: string;
    apiKey: string;
    model: string;
}

export class LLMProvider {
    private config: LLMProviderConfig;

    constructor(config: LLMProviderConfig) {
        this.config = config;
    }

    async complete(context: MathContext): Promise<string[]> {
        const prompt = this.buildPrompt(context);

        const response = await fetch(this.config.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a LaTeX formula completion assistant. ' +
                            'Complete the mathematical expression concisely. ' +
                            'Return only a JSON array of candidate completions.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `LLM request failed: ${response.status} ${response.statusText}`,
            );
        }

        const data = await response.json();

        const content = data.choices?.[0]?.message?.content;

        if (typeof content !== 'string') {
            throw new Error('LLM response did not contain text.');
        }

        return this.parseCandidates(content);
    }

    private buildPrompt(context: MathContext): string {
        return [
            'Complete the following LaTeX expression.',
            '',
            `${context.formula}`,
            '',
            'Return several possible continuations as a JSON array.',
        ].join('\n');
    }

    private parseCandidates(content: string): string[] {
        const parsed = JSON.parse(content);

        if (!Array.isArray(parsed)) {
            throw new Error('LLM response was not an array.');
        }

        return parsed.filter(
            (value): value is string =>
                typeof value === 'string',
        );
    }
}