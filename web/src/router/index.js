import { createRouter,
	createWebHashHistory } from 'vue-router'

const routes = [
	{
		path: '/chat',
		name: 'chat',
		component: () => import('../Chat.vue'),
	},
	{
		path: '/image',
		name: 'image',
		component: () => import('../Image.vue'),
	},
	{
		path: '/record',
		name: 'record',
		component: () => import('../Recorder.vue'),
	},
	{
		path: '/:pathMatch(.*)',
		redirect: '/chat',
	},
]

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})


export default router
