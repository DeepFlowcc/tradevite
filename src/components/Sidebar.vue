<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu === 'batch' ? `batch-${activeChain}` : `${activeChain}-${activeDex}`"
      class="main-menu"
      @select="handleSelect"
    >
      <el-sub-menu index="deploy">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>合约部署</span>
        </template>
        <el-menu-item
          v-for="(info, chain) in chainInfo"
          :key="`deploy-${chain}`"
          :index="`deploy-${chain}`"
        >
          <el-icon><Connection /></el-icon>
          <span>{{ info.name }}</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="batch">
        <template #title>
          <el-icon><Money /></el-icon>
          <span>批量操作</span>
        </template>
        <el-menu-item
          v-for="(info, chain) in chainInfo"
          :key="`batch-${chain}`"
          :index="`batch-${chain}`"
        >
          <el-icon><Wallet /></el-icon>
          <span>{{ info.name }}</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="swap">
        <template #title>
          <el-icon><Switch /></el-icon>
          <span>Swap</span>
        </template>
        <el-sub-menu
          v-for="(info, chain) in chainInfo"
          :key="chain"
          :index="String(chain)"
        >
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>{{ info.name }}</span>
          </template>
          <el-menu-item
            v-for="(name, dex) in info.dexes"
            :key="`${chain}-${dex}`"
            :index="`${chain}-${dex}`"
          >
            <el-icon><Coin /></el-icon>
            <span>{{ name }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
    </el-menu>

    <div class="info-section">
      <div class="info-item">
        <span class="label">当前功能:</span>
        <span class="value">{{ activeMenu === 'batch' ? '批量操作' : activeMenu === 'deploy' ? '合约部署' : 'Swap' }}</span>
      </div>
      <div class="info-item">
        <span class="label">当前网络:</span>
        <span class="value">{{ networkInfo }}</span>
      </div>
      <template v-if="activeMenu === 'batch'">
        <div class="info-item">
          <span class="label">可用功能:</span>
          <span class="value">批量转账、批量归集</span>
        </div>
      </template>
      <template v-else-if="activeMenu === 'deploy'">
        <div class="info-item">
          <span class="label">可用功能:</span>
          <span class="value">ERC20代币部署</span>
        </div>
      </template>
      <template v-else>
        <div class="info-item">
          <span class="label">选择DEX:</span>
          <span class="value">{{ chainInfo[activeChain].dexes[activeDex] }}</span>
        </div>
      </template>
      <div class="info-item">
        <span class="label">版本:</span>
        <span class="value">V3</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Money,
  Switch,
  Connection,
  Wallet,
  Coin,
  Document
} from '@element-plus/icons-vue'

interface ChainInfo {
  name: string
  dexes: {
    [key: string]: string
  }
}

const router = useRouter()

const chainInfo: { [key: string]: ChainInfo } = {
  bsc: {
    name: 'BSC',
    dexes: {
      pancakeswap: 'PancakeSwap V3',
      biswap: 'BiSwap V3'
    }
  },
  ethereum: {
    name: 'Ethereum',
    dexes: {
      uniswap: 'Uniswap V3',
      sushiswap: 'SushiSwap V3'
    }
  },
  polygon: {
    name: 'Polygon',
    dexes: {
      quickswap: 'QuickSwap V3'
    }
  },
  arbitrum: {
    name: 'Arbitrum',
    dexes: {
      sushiswap: 'SushiSwap V3'
    }
  }
}

const activeMenu = ref<string>('swap')
const activeChain = ref<string>('bsc')
const activeDex = ref<string>('pancakeswap')
const networkInfo = ref<string>('BSC Mainnet')

const emit = defineEmits<{
  (e: 'chain-change', chain: string): void
  (e: 'dex-change', dex: string): void
  (e: 'menu-change', menu: string): void
}>()

const handleSelect = (index: string) => {
  if (index.startsWith('deploy-')) {
    // 处理合约部署菜单
    const chain = index.split('-')[1]
    activeMenu.value = 'deploy'
    activeChain.value = chain
    emit('menu-change', 'deploy')
    emit('chain-change', chain)
    networkInfo.value = `${chainInfo[chain].name} Mainnet`
    // 跳转到合约部署页面
    router.push(`/deploy/${chain}`)
  } else if (index.startsWith('batch-')) {
    // 处理批量操作菜单
    const chain = index.split('-')[1]
    activeMenu.value = 'batch'
    activeChain.value = chain
    emit('menu-change', 'batch')
    emit('chain-change', chain)
    networkInfo.value = `${chainInfo[chain].name} Mainnet`
    // 跳转到批量操作页面
    router.push(`/batch/${chain}`)
  } else if (index.includes('-')) {
    // 处理Swap菜单
    const [chain, dex] = index.split('-')
    activeMenu.value = 'swap'
    activeChain.value = chain
    activeDex.value = dex
    emit('menu-change', 'swap')
    emit('chain-change', chain)
    emit('dex-change', dex)
    networkInfo.value = `${chainInfo[chain].name} Mainnet`
    // 跳转到Swap页面
    router.push(`/swap/${chain}/${dex}`)
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f5f7fa;
  padding: 20px;
  height: 100%;
  border-right: 1px solid #e4e7ed;
}

.main-menu {
  border-right: none;
}

.info-section {
  margin-top: 30px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.info-item {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #606266;
}

.value {
  color: #303133;
  font-weight: 500;
}

.el-icon {
  margin-right: 8px;
  vertical-align: middle;
}
</style> 