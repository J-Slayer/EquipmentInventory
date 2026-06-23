'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContractsList } from '@/components/ContractsList'
import { ContractModal } from '@/components/modals/ContractModal'
import type { ContractWithStatus } from '@/lib/types'

interface Props {
  contracts: ContractWithStatus[]
}

export function ContractsPageClient({ contracts }: Props) {
  const router = useRouter()
  const [editContract, setEditContract] = useState<ContractWithStatus | null>(null)
  const [adding, setAdding] = useState(false)

  function handleClose() {
    setAdding(false)
    setEditContract(null)
    router.refresh()
  }

  return (
    <>
      <ContractsList
        contracts={contracts}
        onAdd={() => setAdding(true)}
        onEdit={(c) => setEditContract(c)}
      />
      {(adding || editContract) && (
        <ContractModal contract={editContract ?? undefined} onClose={handleClose} />
      )}
    </>
  )
}
