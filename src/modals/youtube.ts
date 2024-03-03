import { App, Editor, Modal, Notice } from "obsidian";
import { YTService, OpenAIService } from "../services"

export class YTTrascriptModal extends Modal {
	editor: Editor;
	ytService: YTService
	openAIService: OpenAIService


	constructor(app: App, editor: Editor, openAIToken: string) {
		super(app);
		this.editor = editor;
		this.ytService = new YTService();
		this.openAIService = new OpenAIService(openAIToken);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h3", { text: "Enter URL:" });
		const input = contentEl.createEl("input", { type: "text" });
		contentEl.createEl("br");
		contentEl.createEl("br");
		const rawButton = contentEl.createEl("button", {
			text: "raw",
		});
		const formatButton = contentEl.createEl("button", {
			text: "format",
		});

		rawButton.addEventListener("click", async () => {
			new Notice("Fetching transcript...");
			try {
				const raw = await this.ytService.fetchTranscript(input.value);
				const transcript = raw.map(o => o.text).join(' ');
				const currentValue = this.editor.getValue();
				this.editor.setValue(currentValue + "\n" + transcript);
				this.close();
			} catch (e) {
				new Notice(e.message);
			}
		});
		formatButton.addEventListener("click", async () => {
			new Notice("Fetching transcript...");
			try {
				const raw = await this.ytService.fetchTranscript(input.value);
				let transcript = raw.map(o => o.text).join(' ');
				new Notice("Formatting transcript...");
				transcript = await this.openAIService.format(transcript);
				const currentValue = this.editor.getValue();
				this.editor.setValue(currentValue + "\n" + transcript);
				this.close();
			} catch (e) {
				new Notice(e.message);
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
