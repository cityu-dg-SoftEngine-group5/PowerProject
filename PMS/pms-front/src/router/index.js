import VueRouter from 'vue-router';

const routes = [
    {
        path:'/',
        name:'login',
        component:()=>import('@/components/Login')
    },
    {
        path:'/home',
        name:'home',
        component:()=>import('@/components/Index'),
        children:[
            {
                path:'/code',
                name:'code',
                meta:{
                    title:'code'
                },
                component:()=>import('@/components/Home.vue')
            },
            {
                path:'/chat',
                name:'chat',
                meta:{
                    title:'chat'
                },
                component:()=>import('@/components/Home.vue')
            },
            {
                path:'/kanban',
                name:'kanban',
                meta:{
                    title:'kanban'
                },
                component:()=>import('@/components/TodoList/TodoList.vue')
            }
        ]
    }
]

const router = new VueRouter({
    mode:'history',
    routes
})

export function resetRouter() {
    router.matcher = new VueRouter({
        mode:'history',
        routes: []
    }).matcher
}
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (to) {
    return VueRouterPush.call(this, to).catch(err => err)
}
export  default router;