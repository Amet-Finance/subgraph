import {Address, BigDecimal, BigInt, ethereum} from '@graphprotocol/graph-ts'
import {
    DecreaseMaturityPeriod,
    OwnershipTransferred,
    SettleContract,
    TransferBatch,
    TransferSingle,
    UpdateBondSupply
} from "../generated/templates/BondTemplate/Bond"
import {ActionLog, Bond, TokenBalance, User} from '../generated/schema'

export function handleTransferSingle(event: TransferSingle): void {

    const fromAddress = event.params.from;
    const toAddress = event.params.to;

    const fromUser = updateUserIfNeeded(fromAddress);
    const toUser = updateUserIfNeeded(toAddress);

    const tokenId = event.params.id;
    const value = event.params.value;

    if (fromUser) updateTokenBalance(fromAddress, tokenId, value, false, event);
    if (toUser) updateTokenBalance(toAddress, tokenId, value, true, event);

    const log = new ActionLog(event.transaction.hash.toHex())
    log.from = fromAddress;
    log.to = toAddress;
    log.count = value;
    log.blockNumber = event.block.number;
    log.bond = event.address.toHex();
    log.save()

    const bond = loadBond(event.address);
    if (!bond) return;

    const owner = User.load(bond.owner);
    if (!owner) return;

    // on each purchase, calculate all bonds purchase and sold

    if (isZeroAddress(fromAddress)) {
        bond.purchased = bond.purchased.plus(value);
    } else if (isZeroAddress(toAddress)) {
        bond.redeemed = bond.redeemed.plus(value);
    }

    bond.save();
}

export function handleTransferBatch(event: TransferBatch): void {
    const fromAddress = event.params.from;
    const toAddress = event.params.to;

    const fromUser = updateUserIfNeeded(fromAddress);
    const toUser = updateUserIfNeeded(toAddress);

    const bond = loadBond(event.address);
    if (!bond) return;

    const log = new ActionLog(event.transaction.hash.toHex())
    log.from = fromAddress;
    log.to = toAddress;
    log.blockNumber = event.block.number;
    log.bond = event.address.toHex();

    for (let i = 0; i < event.params.ids.length; i++) {
        const tokenId = event.params.ids[i];
        const value = event.params.values[i];

        if (fromUser) updateTokenBalance(fromAddress, tokenId, value, false, event);
        if (toUser) updateTokenBalance(toAddress, tokenId, value, true, event);

        log.count = log.count.plus(value);

        if (isZeroAddress(fromAddress)) {
            bond.purchased = bond.purchased.plus(value);
        } else if (isZeroAddress(toAddress)) {
            bond.redeemed = bond.redeemed.plus(value);
        }
    }

    log.save()
    bond.save();
}

export function handleUpdateBondSupply(event: UpdateBondSupply): void {
    const bond = loadBond(event.address)
    if (!bond) return;

    bond.totalBonds = event.params.totalBonds;
    bond.save()
}

export function handleSettleContract(event: SettleContract): void {

    const bond = loadBond(event.address);
    if (!bond) return;

    bond.isSettled = true;
    bond.save()
}

export function handleDecreaseMaturityPeriod(event: DecreaseMaturityPeriod): void {
    const bond = loadBond(event.address);
    if (!bond) return;

    bond.maturityPeriodInBlocks = event.params.maturityPeriodInBlocks;
    bond.save()
}

export function handleOwnershipTransfer(event: OwnershipTransferred): void {
    const bond = loadBond(event.address);
    if (!bond) return;

    const owner = updateUserIfNeeded(event.params.newOwner);
    if (!owner) return;

    bond.owner = owner.id.toString();
    bond.save()
}


export function loadBond(address: Address): Bond | null {
    return Bond.load(address.toHexString())
}

export function updateUserIfNeeded(address: Address): User | null {
    if (!address) return null;

    let user = User.load(address.toHexString());
    if (!user && !isZeroAddress(address)) {
        user = createNewUser(address.toHexString());
    }
    return user;
}

export function createNewUser(address: string): User {
    const user = new User(address);
    user.save();
    return user;
}

function updateTokenBalance(address: Address, tokenId: BigInt, value: BigInt, isCredit: boolean, event: ethereum.Event): void {

    if (isZeroAddress(address)) {
        return;
    }

    const bond = Bond.load(event.address.toHexString())
    if (!bond) {
        return;
    }

    const id = address.toHex() + '-' + tokenId.toString();
    let tokenBalance = TokenBalance.load(id);

    if (!tokenBalance) {
        tokenBalance = new TokenBalance(id);
        tokenBalance.user = address.toHex();
        tokenBalance.tokenId = tokenId;
        tokenBalance.balance = BigInt.fromI32(0);
        tokenBalance.bond = bond.id.toString();
        tokenBalance.purchaseBlock = event.block.number;
    }

    if (isCredit) {
        tokenBalance.balance = tokenBalance.balance.plus(value)
    } else {
        tokenBalance.balance = tokenBalance.balance.minus(value);
    }

    tokenBalance.save();
}


function isZeroAddress(address: Address): boolean {
    let zeroAddress = Address.fromString('0x0000000000000000000000000000000000000000');
    return address.equals(zeroAddress);
}
