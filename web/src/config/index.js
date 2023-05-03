const env = import.meta.env.MODE || 'prod'
const EnvConfig = {
	dev: { baseApi: 'http://54.79.221.81:1229' },
	prod: { baseApi: 'http://175.178.115.221:1229' },
	production: { baseApi: 'http://54.79.221.81:1229' },
}
export default {
	env,
	...EnvConfig[env],
}
