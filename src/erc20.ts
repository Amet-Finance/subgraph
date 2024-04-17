import {ERC20 as ERC20Contract, Transfer} from "../generated/templates/ERC20Template/ERC20";
import {loadBond} from "./bond";
import {Address} from "@graphprotocol/graph-ts";
import {ERC20} from "../generated/schema";
import {ERC20Template} from "../generated/templates";

export function initiateToken(address: Address): void {

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


export function handleTransfer(event: Transfer): void {
    const fromAddress = event.params.from;
    const toAddress = event.params.to;

    const bond = loadBond(toAddress) || loadBond(fromAddress);
    if (bond) {
        const tokenContract = ERC20Contract.bind(event.address);
        bond.payoutBalance = tokenContract.balanceOf(Address.fromString(bond.id.toString()));
        bond.save()
    }
}
