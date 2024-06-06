import {VaultTemplate} from "../generated/templates";
import {
    BondFeeDetailsUpdated as BondFeeDetailsUpdatedEvent,
    IssuanceFeeChanged as IssuanceFeeChangedEvent,
    ReferralRecord as ReferralRecordEvent,
    ReferrerRewardClaimed as ReferrerRewardClaimedEvent,
    Vault as VaultContract
} from "../generated/templates/VaultTemplate/Vault";
import {ReferralRecord, ReferrerRewardClaim, Vault} from "../generated/schema";
import {loadBond, updateUserIfNeeded} from "./bond";
import {isZeroAddress} from "./utils";
import {Address} from "@graphprotocol/graph-ts";

export function loadVault(address: Address): Vault {
    return Vault.load(address.toHexString()) as Vault;
}

export function initiateVault(vaultAddress: Address): void {
    VaultTemplate.create(vaultAddress);

    const vault = new Vault(vaultAddress.toHexString());
    const vaultContract = VaultContract.bind(vaultAddress);

    const initialDetails = vaultContract.initialBondFeeDetails()
    vault.issuanceFee = vaultContract.issuanceFee();
    vault.issuerAddress = vaultContract.issuerAddress();
    vault.purchaseRate = initialDetails.getPurchaseRate();
    vault.earlyRedemptionRate = initialDetails.getEarlyRedemptionRate();
    vault.referrerRewardRate = initialDetails.getReferrerRewardRate();

    vault.save()
}

export function handleRecordReferral(event: ReferralRecordEvent): void {
    const referrer = updateUserIfNeeded(event.params.referrer);
    if (!referrer) return;

    const referralRecord = new ReferralRecord(event.transaction.hash.toHexString())
    referralRecord.bond = event.params.bondAddress.toHexString()
    referralRecord.referrer = referrer.id
    referralRecord.quantity = event.params.quantity.toI32()
    referralRecord.save()
}

export function handleBondFeeDetailsUpdated(event: BondFeeDetailsUpdatedEvent): void {

    if (isZeroAddress(event.params.bondAddress)) {

        const vault = loadVault(event.address)

        vault.purchaseRate = event.params.purchaseRate;
        vault.earlyRedemptionRate = event.params.earlyRedemptionRate;
        vault.referrerRewardRate = event.params.referrerRewardRate;

        vault.save()
    } else {
        const bond = loadBond(event.params.bondAddress)
        if (!bond) return;

        bond.purchaseRate = event.params.purchaseRate;
        bond.earlyRedemptionRate = event.params.earlyRedemptionRate;
        bond.referrerRewardRate = event.params.referrerRewardRate;

        bond.save()
    }
}

export function handleReferrerRewardClaimed(event: ReferrerRewardClaimedEvent): void {
    const referrer = updateUserIfNeeded(event.params.referrer);
    if (!referrer) return;

    const referralClaim = new ReferrerRewardClaim(event.transaction.hash.toHexString())
    referralClaim.bond = event.params.bondAddress.toHexString()
    referralClaim.referrer = referrer.id
    referralClaim.amount = event.params.amount;
    referralClaim.save()
}

export function handleIssuanceFeeChanged(event: IssuanceFeeChangedEvent): void {
    const vault = loadVault(event.address)

    vault.issuanceFee = event.params.fee;
    vault.save()
}
