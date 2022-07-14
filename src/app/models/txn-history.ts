export class TxnHistory {
    id:string;
    // ['confirmed-round']:number|null;
    // ['first-valid']:number|null;
    // ['last-valid']:number|null;
    sender:string|null;
    receiver:string|null;
    fee:number|null;
    amount:number|null;
    amountAxfer:number|null;
    // ['tx-type']:string|null;
    // ['genesis-hash']:string|null;
    // ['round-time']:number|null;
    ['asset-id']:number|null;
    date:string;
    txnTypeToString:string;
    isSent:boolean;
    color:string;
    icon:string;
    isAssetIdHidden:boolean;
    isAmountHidden:boolean;
    isAssetAmountHidden:boolean;
    isReceiverHidden:boolean;
}
