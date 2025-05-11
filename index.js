module.exports = {
	nodes: [
		require('./dist/nodes/Hotmart/Hotmart.node.js'),
		require('./dist/nodes/Hotmart/HotmartTrigger.node.js'),
		require('./dist/nodes/Hotmart/HotmartRouter.node.js'),
	],
	credentials: [
		require('./dist/credentials/HotmartOAuth2Api.credentials.js'),
	],
};