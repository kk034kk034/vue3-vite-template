<script setup lang="ts">
import { computed } from 'vue'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()

const records = computed(() => [
  { camera: 'CAM-12', range: '19:00 - 20:00', type: t('playback.continuous'), size: '1.8 GB' },
  { camera: 'NVR-02', range: '18:42 - 18:57', type: t('playback.event'), size: '420 MB' },
  { camera: 'CAM-31', range: '17:10 - 17:30', type: t('playback.motion'), size: '760 MB' },
])
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.playback') }}</h2>
        <p>{{ t('playback.subtitle') }}</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('playback.camera') }}</th>
            <th>{{ t('playback.range') }}</th>
            <th>{{ t('playback.type') }}</th>
            <th>{{ t('playback.size') }}</th>
            <th>{{ t('common.export') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in records" :key="item.camera + item.range">
            <td>{{ item.camera }}</td>
            <td>{{ item.range }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.size }}</td>
            <td><button class="text-button" type="button">{{ t('common.export') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
