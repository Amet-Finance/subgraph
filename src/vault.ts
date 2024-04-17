import {VaultTemplate} from "../generated/templates";
import {
    BondFeeDetailsUpdated as BondFeeDetailsUpdatedEvent,
    IssuanceFeeChanged as IssuanceFeeChangedEvent,
    ReferralRecord as ReferralRecordEvent,
    ReferrerRewardClaimed as ReferrerRewardClaimedEvent,
    Vault as VaultContract
} from "../generated/templates/VaultTemplate/Vault";
import {ReferralRecord, ReferrerRewardClaim, Vault} from "../generated/schema";
import {updateUserIfNeeded} from "./bond";
import {isZeroAddress} from "./utils";
import {Address} from "@graphprotocol/graph-ts";

function loadVault(address: Address): Vault {
    let vault = Vault.load(address.toHexString())
    if (!vault) {
        initiateVault(address);
        vault = Vault.load(address.toHexString()) as Vault
    }
    return vault;
}

export function initiateVault(vaultAddress: Address): void {
    VaultTemplate.create(vaultAddress);

    const vault = new Vault(vaultAddress.toHexString());
    const vaultContract = VaultContract.bind(vaultAddress);

    const initialDetails = vaultContract.initialBondFeeDetails()
    vault.issuanceFee = vaultContract.issuanceFee();
    vault.issuerAddress = vaultContract.issuerAddress().toHexString();
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
        const vault = loadVault(event.params.bondAddress)

        vault.purchaseRate = event.params.purchaseRate;
        vault.earlyRedemptionRate = event.params.earlyRedemptionRate;
        vault.referrerRewardRate = event.params.referrerRewardRate;

        vault.save()
    } else {
        // update for bond if needed
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
    if (!event.transaction.to) return;
    const vault = loadVault(event.transaction.to as Address)

    vault.issuanceFee = event.params.fee;
    vault.save()
}
