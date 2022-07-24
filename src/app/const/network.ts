export class Network {
    //네트워크 명칭 정의
    public static mainNet = 'MainNet';
    public static testNet = 'TestNet';
    public static devNet = 'DevNet';
    public static betaNet = 'BetaNet';
    //네트워크별 algod ip
    public static mainNetAlgodIp = 'https://mainnet-algorand.api.purestake.io/ps2';
    public static testNetAlgodIp = 'https://testnet-algorand.api.purestake.io/ps2';
    public static betaNetAlgodIp = 'https://betanet-algorand.api.purestake.io/ps2';
    //네트워크별 algod token
    public static mainNetAlgodToken = '4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr';
    public static testNetAlgodToken = '4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr';
    public static betaNetAlgodToken = '4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr';
    //네트워크별 indexer ip
    public static mainNetIndexerIp = 'https://mainnet-algorand.api.purestake.io/idx2';
    public static testNetIndexerIp = 'https://testnet-algorand.api.purestake.io/idx2';
    public static betaNetIndexerIp = 'https://betanet-algorand.api.purestake.io/idx2';
    //네트워크별 indexer token
    public static mainNetIndexerToken = '4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr';
    public static testNetIndexerToken = '4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr';
    public static betaNetIndexerToken = '4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr';

    public static NETWORK_TYPE_TO_IP_MAP = {
        [Network.mainNet]: {
          networkName: Network.mainNet,
          algodIp: this.mainNetAlgodIp,
          algodToken: this.mainNetAlgodToken,
          indexerIp: this.mainNetIndexerIp,
          indexerToken: this.mainNetIndexerToken,
        },
        [Network.testNet]: {
            networkName: Network.testNet,
            algodIp: this.testNetAlgodIp,
            algodToken: this.testNetAlgodToken,
            indexerIp: this.testNetIndexerIp,
            indexerToken: this.testNetIndexerToken,
        },
        [Network.betaNet]: {
            networkName: Network.betaNet,
            algodIp: this.betaNetAlgodIp,
            algodToken: this.betaNetAlgodToken,
            indexerIp: this.betaNetIndexerIp,
            indexerToken: this.betaNetIndexerToken,
          },
      };
}
