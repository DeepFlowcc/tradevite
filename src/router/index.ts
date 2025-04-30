import { createRouter, createWebHistory } from 'vue-router'
import BatchTransfer from '../views/BatchTransfer.vue'
import PancakeSwap from '../views/PancakeSwap.vue'
import ContractDeploy from '../views/ContractDeploy.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/pancakeswap'
    },
    {
      path: '/deploy/:chain',
      name: 'ContractDeploy',
      component: ContractDeploy,
      props: true
    },
    {
      path: '/batch/:chain',
      name: 'BatchTransfer',
      component: BatchTransfer,
      props: true
    },
    {
      path: '/swap/:chain/:dex',
      name: 'PancakeSwap',
      component: PancakeSwap,
      props: true
    }
  ]
})

export default router 