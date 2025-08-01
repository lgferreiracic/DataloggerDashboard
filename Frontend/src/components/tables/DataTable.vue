<script setup>
const props = defineProps({
  table: Object
})

const emit = defineEmits(['export'])
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
      <h3 class="text-lg font-semibold text-blue-900">
        Dados dos Sensores ({{ table.getFilteredRowModel().rows.length }} registros)
      </h3>
      <button
        @click="$emit('export')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
      >
        Exportar CSV
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex items-center space-x-1">
                <span>{{ header.isPlaceholder ? '' : header.column.columnDef.header }}</span>
                <span v-if="header.column.getIsSorted()">
                  {{ header.column.getIsSorted() === 'desc' ? '↓' : '↑' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="hover:bg-gray-50"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-6 py-4 whitespace-nowrap text-sm"
            >
              {{ cell.getValue() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
      <div class="text-sm text-gray-700 text-center sm:text-left">
        Mostrando {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }} a
        {{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }}
        de {{ table.getFilteredRowModel().rows.length }} registros
      </div>
      <div class="flex justify-center sm:justify-end space-x-2">
        <button
          @click="table.previousPage()"
          :disabled="!table.getCanPreviousPage()"
          class="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span class="px-3 py-2 bg-blue-600 text-white rounded-md">
          {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
        </span>
        <button
          @click="table.nextPage()"
          :disabled="!table.getCanNextPage()"
          class="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>