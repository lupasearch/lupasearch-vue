import { reactive } from 'vue'
import type { MultiCurrencyConfig } from '@/utils/price.utils'

export const GLOBAL_CURRENCY_CONFIG = reactive<MultiCurrencyConfig>({
  selected: 'eur',
  currencies: [
    { key: 'eur', symbol: '€', template: '{1} €', separator: ',', multiplier: 1 },
    { key: 'usd', symbol: '$', template: '$ {1}', separator: '.', multiplier: 1.12 }
  ]
})
