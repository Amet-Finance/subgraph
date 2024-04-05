import {
  BondIssued as BondIssuedEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PauseChanged as PauseChangedEvent,
  VaultChanged as VaultChangedEvent
} from "../generated/Issuer/Issuer"
import {
  BondIssued,
  OwnershipTransferStarted,
  OwnershipTransferred,
  PauseChanged,
  VaultChanged
} from "../generated/schema"

export function handleBondIssued(event: BondIssuedEvent): void {
  let entity = new BondIssued(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.bondAddress = event.params.bondAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePauseChanged(event: PauseChangedEvent): void {
  let entity = new PauseChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.isPaused = event.params.isPaused

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVaultChanged(event: VaultChangedEvent): void {
  let entity = new VaultChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousVaultAddress = event.params.previousVaultAddress
  entity.newVaultAddress = event.params.newVaultAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
