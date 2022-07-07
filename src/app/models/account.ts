import {Token} from './token';

export class Account {
   address: string;
   amount: number;
   assets: Array<Token> = [];
}
