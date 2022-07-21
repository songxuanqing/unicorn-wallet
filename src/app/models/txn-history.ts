export class TxnHistory {
    id:string;
    sender:string|null;
    receiver:string|null;
    fee:number|null;
    amount:number|null;
    amountAxfer:number|null;
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
