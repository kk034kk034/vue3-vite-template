<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { demoCases } from '../catalog'

defineProps<{
  compact?: boolean
}>()
</script>

<template>
  <div class="table-wrap">
    <table class="data-table">
      <caption>
        預先放好的示範案件。請用這些資料練習查詢，不要輸入真實身分證。
      </caption>
      <thead>
        <tr>
          <th scope="col">情境</th>
          <th scope="col">申請人</th>
          <th scope="col">身分證字號</th>
          <th v-if="!compact" scope="col">案件編號</th>
          <th v-if="!compact" scope="col">後四碼</th>
          <th scope="col">狀態</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in demoCases" :key="item.caseId">
          <td>{{ item.scene }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.nationalId }}</td>
          <td v-if="!compact">
            <RouterLink :to="`/services/cases/${item.caseId}`">查看案件 {{ item.caseId }}</RouterLink>
          </td>
          <td v-if="!compact">{{ item.last4 }}</td>
          <td>{{ item.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
