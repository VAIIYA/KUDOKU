import { createRouter, createWebHistory } from 'vue-router'
import SplashView    from './views/SplashView.vue'
import HomeView      from './views/HomeView.vue'
import LevelSelect   from './views/LevelSelectView.vue'
import GameView      from './views/GameView.vue'
import ProfileView   from './views/ProfileView.vue'
import Achievements  from './views/AchievementsView.vue'

const routes = [
  { path: '/',             component: SplashView },
  { path: '/home',         component: HomeView },
  { path: '/levels',       component: LevelSelect },
  { path: '/game/:id',     component: GameView, props: true },
  { path: '/profile',      component: ProfileView },
  { path: '/achievements', component: Achievements },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({ history: createWebHistory(), routes })
