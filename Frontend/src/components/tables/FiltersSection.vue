<script setup>
const props = defineProps({
  filters: Object,
  globalFilter: String,
  table: Object
})

const emit = defineEmits(['update:filters', 'update:globalFilter', 'clear'])

const updateFilter = (field, value) => {
  const updatedFilters = { ...props.filters }
  updatedFilters[field] = value
  emit('update:filters', updatedFilters)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-lg font-semibold text-blue-900 mb-4">Filtros</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
        <input
          :value="filters.dateFrom"
          @input="updateFilter('dateFrom', $event.target.value)"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
        <input
          :value="filters.dateTo"
          @input="updateFilter('dateTo', $event.target.value)"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Buscar na Tabela</label>
        <input
          :value="globalFilter ?? ''"
          @input="$emit('update:globalFilter', $event.target.value)"
          type="text"
          placeholder="Buscar em todos os campos..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
      <div class="flex items-end gap-2">
        <button
          @click="$emit('clear')"
          class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
        >
          Limpar
        </button>
      </div>
    </div>
  </div>
</template>
