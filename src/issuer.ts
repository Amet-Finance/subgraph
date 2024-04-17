import {
  BondIssued as BondIssuedEvent,
  Issuer as IssuerContract,
  OwnershipTransferred as OwnershipTransferredEvent,
  PauseChanged as PauseChangedEvent,
  VaultChanged as VaultChangedEvent,
} from "../generated/Issuer/Issuer"

import {initiateBond} from "./bond";
import {initiateVault} from "./vault";
import {Issuer} from "../generated/schema";
import {Address} from "@graphprotocol/graph-ts";

function loadIssuer(address: Address): Issuer {
  let issuer = Issuer.load(address.toHexString())
  if (!issuer) {
    initiateIssuer(address);
    issuer = Issuer.load(address.toHexString()) as Issuer
  }
  return issuer;
}

function initiateIssuer(address: Address): void {
  const issuer = new Issuer(address.toHexString())
  const issuerContract = IssuerContract.bind(address);

  issuer.isPaused = issuerContract.isPaused()
  issuer.vault = issuerContract.vault().toHexString()
  issuer.owner = issuerContract.owner().toHexString()
  issuer.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  if (!event.transaction.to) return;
  const issuer = loadIssuer(event.transaction.to as Address)
  issuer.owner = event.params.newOwner.toHexString();
  issuer.save()
}

export function handlePauseChanged(event: PauseChangedEvent): void {
  if (!event.transaction.to) return;
  const issuer = loadIssuer(event.transaction.to as Address)
  issuer.isPaused = event.params.isPaused;
  issuer.save()
}

export function handleVaultChanged(event: VaultChangedEvent): void {
  if (!event.transaction.to) return;
  const issuer = loadIssuer(event.transaction.to as Address)
  issuer.vault = event.params.newVaultAddress.toHexString();
  issuer.save()

  initiateVault(event.params.newVaultAddress)
}

export function handleBondIssued(event: BondIssuedEvent): void {
  initiateBond(event)
}
