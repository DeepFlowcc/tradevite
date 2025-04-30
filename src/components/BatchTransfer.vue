<template>
  <div class="batch-transfer">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="批量转账" name="transfer">
        <el-form :model="transferForm" label-width="120px">
          <el-form-item label="接收地址列表">
            <el-input
              type="textarea"
              v-model="transferForm.addresses"
              :rows="5"
              placeholder="每行输入一个地址"
            />
          </el-form-item>
          <el-form-item label="转账金额(BNB)">
            <el-input-number v-model="transferForm.amount" :precision="8" :step="0.1" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleBatchTransfer" :loading="loading">
              开始转账
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="批量归集" name="collect">
        <el-form :model="collectForm" label-width="120px">
          <el-form-item label="私钥列表">
            <el-input
              type="textarea"
              v-model="collectForm.privateKeys"
              :rows="5"
              placeholder="每行输入一个私钥"
            />
          </el-form-item>
          <el-form-item label="归集目标地址">
            <el-input v-model="collectForm.targetAddress" placeholder="输入归集目标地址" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleBatchCollect" :loading="loading">
              开始归集
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ethers } from 'ethers'
import { ElMessage } from 'element-plus'

const activeTab = ref('transfer')
const loading = ref(false)

const transferForm = ref({
  addresses: '',
  amount: 0.1
})

const collectForm = ref({
  privateKeys: '',
  targetAddress: ''
})

const handleBatchTransfer = async () => {
  if (!transferForm.value.addresses || !transferForm.value.amount) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const addresses = transferForm.value.addresses.split('\n').filter(addr => addr.trim())
    const provider = new ethers.providers.Web3Provider(window.ethereum!)
    const signer = provider.getSigner()

    for (const address of addresses) {
      const tx = await signer.sendTransaction({
        to: address.trim(),
        value: ethers.utils.parseEther(transferForm.value.amount.toString())
      })
      await tx.wait()
      ElMessage.success(`转账成功: ${address}`)
    }
    ElMessage.success('批量转账完成')
  } catch (error) {
    console.error('转账失败:', error)
    ElMessage.error('转账失败')
  } finally {
    loading.value = false
  }
}

const handleBatchCollect = async () => {
  if (!collectForm.value.privateKeys || !collectForm.value.targetAddress) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const privateKeys = collectForm.value.privateKeys.split('\n').filter(key => key.trim())
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/')

    for (const privateKey of privateKeys) {
      const wallet = new ethers.Wallet(privateKey.trim(), provider)
      const balance = await provider.getBalance(wallet.address)
      
      if (balance.gt(0)) {
        const tx = await wallet.sendTransaction({
          to: collectForm.value.targetAddress,
          value: balance.sub(ethers.utils.parseEther('0.005')) // 保留一些BNB作为gas费
        })
        await tx.wait()
        ElMessage.success(`归集成功: ${wallet.address}`)
      }
    }
    ElMessage.success('批量归集完成')
  } catch (error) {
    console.error('归集失败:', error)
    ElMessage.error('归集失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.batch-transfer {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style> 