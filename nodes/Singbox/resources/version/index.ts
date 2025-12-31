import type { INodeProperties } from 'n8n-workflow';

const showOnlyForVersion = {
    resource: ['version'],
};

export const versionDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: showOnlyForVersion,
        },
        options: [
            {
                name: 'Get',
                value: 'get',
                action: 'Get version',
                description: 'Get the version of the singbox instance',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/version',
                    },
                },
            },
        ],
        default: 'get',
    },
];
