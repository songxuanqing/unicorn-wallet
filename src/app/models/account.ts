import {Token} from './token';

export class Account {
   name:string;
   address: string;
   amount: number = 0;
   assets: Array<Token> = [];
}
