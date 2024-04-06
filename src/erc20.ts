import {ERC20 as ERC20Contract, Transfer} from "../generated/templates/ERC20Template/ERC20";
import {loadBond} from "./bond";
import {Address} from "@graphprotocol/graph-ts";

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
