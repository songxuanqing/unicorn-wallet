import {Token} from './token';

export class Account {
   name:string;
   address: string;
   amount: number;
   assets: Array<Token> = [];
}
