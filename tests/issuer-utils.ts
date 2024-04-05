import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  BondIssued,
  OwnershipTransferStarted,
  OwnershipTransferred,
  PauseChanged,
  VaultChanged
} from "../generated/Issuer/Issuer"

export function createBondIssuedEvent(bondAddress: Address): BondIssued {
  let bondIssuedEvent = changetype<BondIssued>(newMockEvent())

  bondIssuedEvent.parameters = new Array()

  bondIssuedEvent.parameters.push(
    new ethereum.EventParam(
      "bondAddress",
      ethereum.Value.fromAddress(bondAddress)
    )
  )

  return bondIssuedEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent = changetype<OwnershipTransferStarted>(
    newMockEvent()
  )

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPauseChangedEvent(isPaused: boolean): PauseChanged {
  let pauseChangedEvent = changetype<PauseChanged>(newMockEvent())

  pauseChangedEvent.parameters = new Array()

  pauseChangedEvent.parameters.push(
    new ethereum.EventParam("isPaused", ethereum.Value.fromBoolean(isPaused))
  )

  return pauseChangedEvent
}

export function createVaultChangedEvent(
  previousVaultAddress: Address,
  newVaultAddress: Address
): VaultChanged {
  let vaultChangedEvent = changetype<VaultChanged>(newMockEvent())

  vaultChangedEvent.parameters = new Array()

  vaultChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousVaultAddress",
      ethereum.Value.fromAddress(previousVaultAddress)
    )
  )
  vaultChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newVaultAddress",
      ethereum.Value.fromAddress(newVaultAddress)
    )
  )

  return vaultChangedEvent
}
