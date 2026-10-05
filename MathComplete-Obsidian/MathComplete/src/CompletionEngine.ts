import { MathContext } from './MathContext';
import { LLMProvider } from './LLMProvider';

export class CompletionEngine {
    private provider: LLMProvider;

    constructor(provider: LLMProvider) {
        this.provider = provider;
    }

    async getCompletions(
        context: MathContext,
    ): Promise<string[]> {
        return this.provider.complete(context);
    }
}