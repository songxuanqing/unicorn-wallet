export class PortfolioSupportBlockchain {


        //네트워크 정의
        public static bitcoin = 'bitcoin';
        public static ethereum = 'ethereum';
        public static binanceSmartChain = 'binance-coin';
        public static klaytn = 'klay-token';
        public static avalancheCChain = "avalanche-2";
        public static litecoin = "litecoin";
        public static algorand = 'algorand';

        //네트워크 공식 명칭
        public static bitcoinName = 'Bitcoin';
        public static ethereumName = 'Ethereum';
        public static binanceSmartChainName = 'Binance Smart Chain';
        public static klaytnName = 'Klaytn';
        public static avalancheCChainName = "Avalanche C Chain";
        public static litecoinName = "Litecoin";
        public static algorandName = "Algorand";

        //네트워크 약어
        public static bitcoinShort = 'btc';
        public static ethereumShort = 'eth';
        public static binanceSmartChainShort = 'bsc';
        public static klaytnShort = 'klay';
        public static avalancheCChainShort = "avax";
        public static litecoinShort = "ltc";
        public static algorandShort = "algo";

        //사용가능한 api version
        public static bitcoinVersion = 'v2';
        public static ethereumVersion = 'v3';
        public static binanceSmartChainVersion = 'v3';
        public static klaytnVersion = 'v3';
        public static avalancheCChainVersion = "v3";
        public static litecoinVersion = "v2";
        public static algorandVersion = "";

        //최소전송단위
        public static bitcoinUnit = 'Satoshi';
        public static ethereumUnit = 'wei';
        public static binanceSmartChainUnit = 'Jager';
        public static klaytnUnit = 'peb';
        public static avalancheCChainUnit = "NanoAvax";
        public static litecoinUnit = "litoshi";
        public static algorandUnit = 'mAlgo';
        
        //시장거래단위
        public static bitcoinMarketUnit = 'BTC';
        public static ethereumMarketUnit = 'ETH';
        public static binanceSmartChainMarketUnit = 'BNB';
        public static klaytnMarketUnit = 'KLAY';
        public static avalancheCChainMarketUnit = "AVAX";
        public static litecoinMarketUnit = "LTC";
        public static algorandMarketUnit = 'ALGO';

        //시장거래단위 교환비율
        public static bitcoinMarketConversion = 0.00000001;
        public static ethereumMarketConversion = 0.000000000000000001;
        public static binanceSmartChainMarketConversion = 0.00000001;
        public static klaytnMarketConversion =  0.000000000000000001;
        public static avalancheCChainMarketConversion =  0.000000001;
        public static litecoinMarketConversion =  0.00000001;
        public static algorandMarketConversion =  0.000001;

        public static NETWORK_TYPE_TO_NAME_MAP = {
            [PortfolioSupportBlockchain.bitcoin]: {
              networkDefine: this.bitcoin,
              networkName:this.bitcoinName,
              networkShort:this.bitcoinShort,
              apiVersion:this.bitcoinVersion,
              smallestUnit:this.bitcoinUnit,
              marketUnit:this.bitcoinMarketUnit,
              marketConversion:this.bitcoinMarketConversion,
            },
            [PortfolioSupportBlockchain.ethereum]: {
              networkDefine: this.ethereum,
              networkName:this.ethereumName,
              networkShort:this.ethereumShort,
              apiVersion:this.ethereumVersion,
              smallestUnit:this.ethereumUnit,
              marketUnit:this.ethereumMarketUnit,
              marketConversion:this.ethereumMarketConversion,
             },
            [PortfolioSupportBlockchain.binanceSmartChain]: {
              networkDefine: this.binanceSmartChain,
              networkName:this.binanceSmartChainName,
              networkShort:this.binanceSmartChainShort,
              apiVersion:this.binanceSmartChainVersion,
              smallestUnit:this.binanceSmartChainUnit,
              marketUnit:this.binanceSmartChainMarketUnit,
              marketConversion:this.binanceSmartChainMarketConversion,
            },
            [PortfolioSupportBlockchain.klaytn]: {
              networkDefine: this.klaytn,
              networkName:this.klaytnName,
              networkShort:this.klaytnShort,
              apiVersion:this.klaytnVersion,
              smallestUnit:this.klaytnUnit,
              marketUnit:this.klaytnMarketUnit,
              marketConversion:this.klaytnMarketConversion,
            },
            [PortfolioSupportBlockchain.avalancheCChain]: {
              networkDefine: this.avalancheCChain,
              networkName:this.avalancheCChainName,
              networkShort:this.avalancheCChainShort,
              apiVersion:this.avalancheCChainVersion,
              smallestUnit:this.avalancheCChainUnit,
              marketUnit:this.avalancheCChainMarketUnit,
              marketConversion:this.avalancheCChainMarketConversion,
            },
            [PortfolioSupportBlockchain.litecoin]: {
              networkDefine: this.litecoin,
              networkName:this.litecoinName,
              networkShort:this.litecoinShort,
              apiVersion:this.litecoinVersion,
              smallestUnit:this.litecoinUnit,
              marketUnit:this.litecoinMarketUnit,
              marketConversion:this.litecoinMarketConversion,
            },
            [PortfolioSupportBlockchain.algorand]: {
              networkDefine: this.algorand,
              networkName:this.algorandName,
              networkShort:this.algorandShort,
              apiVersion:this.algorandVersion,
              smallestUnit:this.algorandUnit,
              marketUnit:this.algorandMarketUnit,
              marketConversion:this.algorandMarketConversion,
            },
          };
}
