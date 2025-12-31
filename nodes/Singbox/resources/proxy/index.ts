import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProxies = {
	resource: ['proxy'],
};

export const proxyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProxies,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get proxies',
				description: 'Get many proxies',
				routing: {
					request: {
						method: 'GET',
						url: '/proxies',
					},
				},
			},
			{
				name: 'Get One',
				value: 'get',
				action: 'Get a proxy',
				description: 'Get the data of a single proxy',
				routing: {
					request: {
						method: 'GET',
						url: '=/proxies/{{$parameter["name"]}}',
					},
				},
			},
			{
				name: 'Switch Proxy',
				value: 'switchProxy',
				action: 'Switch a proxy',
				description: 'Switch a proxy',
				routing: {
					request: {
						method: 'PUT',
						url: '=/proxies/{{$parameter["groupName"]}}',
						body: {
							name: '={{$parameter["name"]}}',
						},
					},
				},
			},
			{
				name: 'Test Connection',
				value: 'testConnection',
				action: 'Test the connection to the singbox API',
				description: 'Test the connection delay for a specific proxy',
				routing: {
					request: {
						method: 'GET',
						url: '=/proxies/{{$parameter["proxyName"]}}/delay',
						qs: {
							url: '={{$parameter["testUrl"]}}',
							timeout: '={{$parameter["timeout"]}}',
						},
					},
				},
			},
			{
				name: 'Test Group',
				value: 'testGroup',
				action: 'Test all proxies in a group',
				description: 'Test the connection delay for all proxies in a group',
				routing: {
					request: {
						method: 'GET',
						url: '/',
					},
					output: {
						postReceive: [
							async function (this) {
								const groupName = this.getNodeParameter('groupName') as string;
								const testUrl = this.getNodeParameter('testUrl') as string;
								const timeout = this.getNodeParameter('timeout') as number;

								const credentials = await this.getCredentials('singboxApi');
								const apiBaseUrl = (credentials.apiBaseUrl as string).replace(/\/$/, '');

								// 1. Get group members
								const groupData = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'singboxApi',
									{
										method: 'GET',
										baseURL: apiBaseUrl,
										url: `/proxies/${encodeURIComponent(groupName)}`,
										json: true,
									},
								);

								const proxies = (groupData.all || []) as string[];

								// 2. Test delays in parallel
								const delayPromises = proxies.map(async (proxy) => {
									try {
										const result = await this.helpers.httpRequestWithAuthentication.call(
											this,
											'singboxApi',
											{
												method: 'GET',
												baseURL: apiBaseUrl,
												url: `/proxies/${encodeURIComponent(proxy)}/delay`,
												qs: {
													url: testUrl,
													timeout: timeout,
												},
												json: true,
											},
										);
										return {
											proxy,
											delay: result.delay,
										};
									} catch (error) {
										return {
											proxy,
											error: error,
										};
									}
								});

								const delayResults = await Promise.all(delayPromises);

								let bestProxy = null;
								let minDelay = Infinity;

								for (const result of delayResults) {
									if (
										'delay' in result &&
										typeof result.delay === 'number' &&
										result.delay < minDelay
									) {
										minDelay = result.delay;
										bestProxy = result;
									}
								}

								const outputJson: {
									results: {
										proxy: string;
										delay?: number;
										error?: string;
									}[];
									best?: {
										proxy: string;
										delay: number;
									};
								} = { results: delayResults };
								if (bestProxy) {
									outputJson.best = bestProxy;
								}

								return [{ json: outputJson }];
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForProxies,
				operation: ['switchProxy', 'testGroup'],
			},
		},
		description: 'The name of the group to switch',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForProxies,
				operation: ['switchProxy', 'get'],
			},
		},
		description: 'The name of the proxy to switch',
	},
	{
		displayName: 'Proxy Name',
		name: 'proxyName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForProxies,
				operation: ['testConnection'],
			},
		},
		description: 'The name of the proxy to test',
	},
	{
		displayName: 'Test URL',
		name: 'testUrl',
		type: 'string',
		default: 'https://www.gstatic.com/generate_204',
		displayOptions: {
			show: {
				...showOnlyForProxies,
				operation: ['testConnection', 'testGroup'],
			},
		},
		description: 'The URL to test the connection against',
	},
	{
		displayName: 'Timeout (Ms)',
		name: 'timeout',
		type: 'number',
		default: 1500,
		displayOptions: {
			show: {
				...showOnlyForProxies,
				operation: ['testConnection', 'testGroup'],
			},
		},
		description: 'The maximum time to wait for the test to complete in milliseconds',
	},
];