import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// eslint-disable-next-line @n8n/community-nodes/icon-validation
export class SingboxApi implements ICredentialType {
	name = 'singboxApi';
	displayName = 'Singbox API';

	// Link to your community node's README
	documentationUrl = 'https://github.com/AlanLang/n8n-nodes-singbox';

	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'apiBaseUrl',
			type: 'string',
			required: true,
			default: 'http://127.0.0.1:9090',
			placeholder: 'http://127.0.0.1:9090',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			required: false,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiBaseUrl}}',
			url: '/',
		},
	};
}
