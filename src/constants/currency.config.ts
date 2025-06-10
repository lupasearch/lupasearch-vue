import { reactive } from 'vue'
import type { MultiCurrencyConfig, CurrencyConfig } from '@/utils/price.utils'

const allCurrencies: CurrencyConfig[] = [
  { key: 'eur', symbol: '€', template: '{1} €', separator: ',', multiplier: 1 },
  { key: 'usd', symbol: '$', template: '$ {1}', separator: '.', multiplier: 1.12 }
]

export const GLOBAL_CURRENCY_CONFIG = reactive<MultiCurrencyConfig>({
  selected: 'eur',
  currencies: allCurrencies
})
