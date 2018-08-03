import Vue from 'vue';
import Router from 'vue-router';
import FrontPage from './components/FrontPage.vue';
import DataManagement from './components/DataManagement.vue';
import PipelinesEditor from './components/PipelinesEditor.vue';
import ProcessManager from './components/ProcessManager.vue';

Vue.use(Router);

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Front Page',
      component: FrontPage,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/data',
      name: 'Data Management',
      component: DataManagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/pipelines',
      name: 'Pipelines Editor',
      component: PipelinesEditor,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/processes',
      name: 'Process Manager',
      component: ProcessManager,
      meta: {
        requiresAuth: true
      }
    },
  ],
});

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('access_token') == null) {
      next({
        path: '/',
        params: { nextUrl: to.fullPath }
      })
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;