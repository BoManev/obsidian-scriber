import OpenAI from "openai";

export class OpenAIService {
	openai: OpenAI;

	static DEFAULT_FORMAT_PROMPT =
		"Below is a transcript of a Youtube video. Can you format it in markdown and fix any punctionation errors. Do NOT paraphrase, I want the original content!\n --- \n";
	static MAX_TOKEN_SIZE = 2500;

	constructor(apiKey: string) {
		this.openai = new OpenAI({
			apiKey: apiKey,
			dangerouslyAllowBrowser: true
		})
	}

	async complete(body: string): Promise<string> {
		const chatCompletion = await this.openai.chat.completions.create({
			messages: [{ role: 'assistant', content: body }],
			model: 'gpt-3.5-turbo',
		});

		return chatCompletion.choices.at(0)?.message.content!;
	}

	async format(text: string): Promise<string> {
		let cursor = 0;
		const summaryChunks = [];
		const words = text.split(" ");

		while (cursor < words.length - 1) {
			const nextCursor =
				cursor + OpenAIService.MAX_TOKEN_SIZE > words.length
					? words.length - 1
					: cursor + OpenAIService.MAX_TOKEN_SIZE;
			summaryChunks.push(
				this.complete(OpenAIService.DEFAULT_FORMAT_PROMPT + words.slice(cursor, nextCursor).join(" "))
			);
			cursor = nextCursor;
		}

		const keyPoints = await Promise.all(summaryChunks);
		return keyPoints.join("\n");
	}
}
