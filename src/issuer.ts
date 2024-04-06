import {
  BondIssued as BondIssuedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  PauseChanged as PauseChangedEvent,
  VaultChanged as VaultChangedEvent
} from "../generated/Issuer/Issuer"
import {
  Bond,
  BondIssued,
  ERC20,
  OwnershipTransferred,
  OwnershipTransferStarted,
  PauseChanged,
  VaultChanged
} from "../generated/schema"
import {BondTemplate, ERC20Template} from "../generated/templates";
import {Address, BigInt} from "@graphprotocol/graph-ts";
import {Bond as BondContract} from "../generated/templates/BondTemplate/Bond";
import {ERC20 as ERC20Contract} from "../generated/templates/ERC20Template/ERC20";
import {updateUserIfNeeded} from "./bond";


export function handleBondIssued(event: BondIssuedEvent): void {
  let entity = new BondIssued(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.bondAddress = event.params.bondAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Dynamically instantiate a new BondTemplate for the new bond contract
  BondTemplate.create(event.params.bondAddress);

  const bond = new Bond(event.params.bondAddress.toHex());
  const bondContract = BondContract.bind(event.params.bondAddress)

  const lifecycle = bondContract.lifecycle();

  const issuer = updateUserIfNeeded(event.transaction.from);
  if (!issuer) return;

  bond.issuer = issuer.id.toString();
  bond.owner = issuer.id.toString();

  bond.totalBonds = lifecycle.getTotalBonds();
  bond.purchased = BigInt.fromU64(0);
  bond.redeemed = BigInt.fromU64(0);

  bond.isSettled = false;
  bond.maturityPeriodInBlocks = lifecycle.getMaturityPeriodInBlocks();

  bond.purchaseToken = bondContract.purchaseToken().toHexString()
  bond.purchaseAmount = bondContract.purchaseAmount()

  bond.payoutToken = bondContract.payoutToken().toHexString()
  bond.payoutAmount = bondContract.payoutAmount()

  bond.issuanceBlock = event.block.number;
  bond.issuanceDate = event.block.timestamp;

  bond.payoutBalance = BigInt.zero();
  bond.save();

  updateToken(bondContract.purchaseToken());
  updateToken(bondContract.payoutToken());
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


function updateToken(address: Address): void {

  const loadedToken = ERC20.load(address.toHex());
  if (loadedToken) return;

  ERC20Template.create(address);
  const token = new ERC20(address.toHex());
  const tokenContract = ERC20Contract.bind(address);

  token.symbol = tokenContract.symbol();
  token.name = tokenContract.name()
  token.decimals = tokenContract.decimals()

  token.save()
}
