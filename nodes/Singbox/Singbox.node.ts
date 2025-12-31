import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { proxyDescription } from './resources/proxy';
import { versionDescription } from './resources/version';

export class Singbox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Singbox',
		name: 'singbox',
		icon: { light: 'file:singbox.svg', dark: 'file:singbox.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Singbox API',
		defaults: {
			name: 'Singbox',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'singboxApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.apiBaseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Proxy',
						value: 'proxy',
					},
					{
						name: 'Version',
						value: 'version',
					},
				],
				default: 'proxy',
			},
			...proxyDescription,
			...versionDescription,
		],
	};
}
