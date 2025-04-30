<template>
  <div class="wallet-connect">
    <el-button v-if="!isConnected" type="primary" @click="connectWallet">
      连接钱包
    </el-button>
    <div v-else class="wallet-info">
      <el-button type="info" @click="disconnectWallet">断开连接</el-button>
      <span class="address">{{ formatAddress(address) }}</span>
      <span class="balance">{{ formatBalance }} {{ chainSymbol }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ethers } from 'ethers'
import { ElMessage } from 'element-plus'

const isConnected = ref(false)
const address = ref('')
const balance = ref('0')
const chainSymbol = ref('')

// 链信息配置
const chainInfo: { [key: string]: { name: string; symbol: string } } = {
  bsc: {
    name: 'BSC',
    symbol: 'BNB'
  },
  bscTestnet: {
    name: 'BSC Testnet',
    symbol: 'tBNB'
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH'
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC'
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ETH'
  }
}

// 格式化地址显示
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 格式化余额显示
const formatBalance = computed(() => {
  const balanceInEther = ethers.utils.formatEther(balance.value)
  return Number(balanceInEther).toFixed(4)
})

// 连接钱包
const connectWallet = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      ElMessage.error('请先安装MetaMask钱包')
      return
    }

    // 请求用户连接钱包
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    if (!accounts || accounts.length === 0) {
      ElMessage.error('未获取到钱包地址')
      return
    }

    address.value = accounts[0]
    console.log('钱包地址:', address.value)
    isConnected.value = true

    // 获取当前链ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    console.log('当前链ID:', chainId)
    const chain = getChainFromId(chainId)
    chainSymbol.value = chainInfo[chain]?.symbol || 'ETH'

    // 获取余额
    await updateBalance()

    // 监听账户变化
    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      console.log('账户变化:', accounts)
      address.value = accounts[0]
      await updateBalance()
    })

    // 监听链变化
    window.ethereum.on('chainChanged', async (chainId: string) => {
      console.log('链变化:', chainId)
      const chain = getChainFromId(chainId)
      chainSymbol.value = chainInfo[chain]?.symbol || 'ETH'
      await updateBalance()
    })

    // 监听余额变化
    window.ethereum.on('block', async () => {
      await updateBalance()
    })
  } catch (error) {
    console.error('连接钱包失败:', error)
    ElMessage.error('连接钱包失败')
  }
}

// 更新余额
const updateBalance = async () => {
  if (!address.value) {
    console.log('地址为空，无法获取余额')
    return
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log('正在获取地址余额:', address.value)
    const balanceWei = await provider.getBalance(address.value)
    balance.value = balanceWei.toString()
    console.log('当前余额(Wei):', balanceWei.toString())
    console.log('当前余额(BNB):', ethers.utils.formatEther(balanceWei))
  } catch (error) {
    console.error('获取余额失败:', error)
    ElMessage.error('获取余额失败')
  }
}

// 根据链ID获取链名称
const getChainFromId = (chainId: string): string => {
  const chainIdMap: { [key: string]: string } = {
    '0x1': 'ethereum',
    '0x38': 'bsc',
    '0x61': 'bscTestnet',
    '0x89': 'polygon',
    '0xa4b1': 'arbitrum'
  }
  return chainIdMap[chainId] || 'ethereum'
}

// 组件挂载时检查是否已连接
onMounted(async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        address.value = accounts[0]
        isConnected.value = true
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        const chain = getChainFromId(chainId)
        chainSymbol.value = chainInfo[chain]?.symbol || 'ETH'
        await updateBalance()

        // 添加余额变化监听
        window.ethereum.on('block', async () => {
          await updateBalance()
        })
      }
    } catch (error) {
      console.error('检查钱包连接状态失败:', error)
    }
  }
})

const disconnectWallet = () => {
  isConnected.value = false
  address.value = ''
  ElMessage.success('已断开钱包连接')
}
</script>

<style scoped>
.wallet-connect {
  padding: 10px;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address {
  font-family: monospace;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.balance {
  font-size: 14px;
  color: #606266;
  padding-left: 12px;
  border-left: 1px solid #dcdfe6;
}
</style> 