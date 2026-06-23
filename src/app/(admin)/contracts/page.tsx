import { createClient } from '@/lib/supabase/server'
import { ContractsPageClient } from '@/components/ContractsPageClient'
import type { ContractWithStatus } from '@/lib/types'

export default async function ContractsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('contracts_with_status')
    .select('*')

  return <ContractsPageClient contracts={(data ?? []) as unknown as ContractWithStatus[]} />
}
