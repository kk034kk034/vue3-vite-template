<script setup lang="ts">
import { computed } from 'vue'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()

const devices = computed(() => [
  { name: 'CAM-12 北門入口', site: '台北一廠', type: 'IPCAM', protocol: 'RTSP / ONVIF', status: t('common.online') },
  { name: 'NVR-02 倉儲月台', site: '新竹倉儲', type: 'NVR', protocol: 'MQTT / REST', status: t('common.warning') },
  { name: 'CAM-31 港區東側', site: '高雄港區', type: 'IPCAM', protocol: 'RTSP / HLS', status: t('common.offline') },
])
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.devices') }}</h2>
        <p>{{ t('devices.subtitle') }}</p>
      </div>
      <div class="button-row">
        <button class="button secondary" type="button">{{ t('devices.import') }}</button>
        <button class="button primary" type="button">{{ t('devices.add') }}</button>
      </div>
    </div>

    <div class="filter-bar">
      <select><option>{{ t('common.allSites') }}</option></select>
      <button class="button primary" type="button">{{ t('common.query') }}</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('devices.name') }}</th>
            <th>{{ t('devices.site') }}</th>
            <th>{{ t('devices.type') }}</th>
            <th>{{ t('devices.protocol') }}</th>
            <th>{{ t('devices.lastSeen') }}</th>
            <th>{{ t('common.settings') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in devices" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.site }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.protocol }}</td>
            <td><span class="pill">{{ item.status }}</span></td>
            <td><button class="text-button" type="button">{{ t('common.open') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
