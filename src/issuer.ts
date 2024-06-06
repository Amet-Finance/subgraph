import {BondIssued as BondIssuedEvent, VaultChanged as VaultChangedEvent,} from "../generated/Issuer/Issuer"

import {initiateBond} from "./bond";
import {initiateVault} from "./vault";


export function handleVaultChanged(event: VaultChangedEvent): void {
  initiateVault(event.params.newVaultAddress)
}

export function handleBondIssued(event: BondIssuedEvent): void {
  initiateBond(event)
}
