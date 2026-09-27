import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './shell'
import { setupGuards } from './guards'
import './types'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupGuards(router)

export default router