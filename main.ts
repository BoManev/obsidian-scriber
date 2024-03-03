import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { YTTrascriptModal } from './src/modals';

interface PluginSettings {
	openAIToken: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	openAIToken: ''
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "raw-youtube-transcript",
			name: 'Fetch transcript from YouTube',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const token = this.settings.openAIToken;
				if (token == undefined || token == "")
					new Notice("OpenAI API token is not present!");

				new YTTrascriptModal(this.app, editor, token).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('OpenAI')
			.setDesc('API token')
			.addText(text => text
				.setPlaceholder('Enter token')
				.setValue(this.plugin.settings.openAIToken)
				.onChange(async (value) => {
					this.plugin.settings.openAIToken = value;
					await this.plugin.saveSettings();
				}));
	}
}
