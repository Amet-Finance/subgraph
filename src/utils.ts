import {Address} from "@graphprotocol/graph-ts";

export function isZeroAddress(address: Address): boolean {
    let zeroAddress = Address.fromString('0x0000000000000000000000000000000000000000');
    return address.equals(zeroAddress);
}
