const env = import.meta.env.MODE || 'prod'
const EnvConfig = {
	dev: { baseApi: 'http://localhost:0754' },
	prod: { baseApi: 'http://175.178.115.221:0754' },
	production: { baseApi: 'http://175.178.115.221:0754' },
}
export default {
	env,
	...EnvConfig[env],
}
