export class PortfolioNetwork {
        //네트워크 명칭 정의
        public static mainNet = 'MainNet';
        public static testNet = 'TestNet';
        public static v2Net = "v2";

        //네트워크별 algod ip
        public static mainNetIp = 'https://mainnet-api.blocksdk.com';
        public static testNetIp = ' https://testnet-api.blocksdk.com';
        public static v2NetIp = "https://api.blocksdk.com";

        //네트워크별 algod token
        public static mainNetToken = 'CVvd4rNkl4TNTRKWhPr5rTkWKHuIUh82235nR4bV';
        public static testNetToken = 'CVvd4rNkl4TNTRKWhPr5rTkWKHuIUh82235nR4bV';
        public static v2NetToken = 'CVvd4rNkl4TNTRKWhPr5rTkWKHuIUh82235nR4bV';
 
        public static NETWORK_TYPE_TO_IP_MAP = {
            [PortfolioNetwork.mainNet]: {
              networkName: this.mainNet,
              baseIp: this.mainNetIp,
              baseToken: this.mainNetToken,
            },
            [PortfolioNetwork.testNet]: {
                networkName: this.testNet,
                baseIp: this.testNetIp,
                baseToken: this.testNetToken,
            },
            [PortfolioNetwork.v2Net]: {
              networkName: this.v2Net,
              baseIp: this.v2NetIp,
              baseToken: this.v2NetToken,
          },
          };
}
