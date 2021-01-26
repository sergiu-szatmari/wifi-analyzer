import { AuthenticationCipherSuiteType, GroupCipherSuiteType, SecurityInformation } from '../models/beacon-packet';

export const enumKey = (enumName: 'GroupCipherSuiteType' | 'AuthenticationCipherSuiteType', value: number): string => {
    const e = enumName === 'GroupCipherSuiteType' ? GroupCipherSuiteType : AuthenticationCipherSuiteType;
    return Object.keys(e)[Object.values(e).indexOf(value)];
}

export const toObject = (si: SecurityInformation) => {
    return {
        version: si.version,
        groupCipherSuite: {
            oui: si.groupCipherSuite.oui.toString(),
            suiteType: si.groupCipherSuite.suiteType,
        },
        pairwiseCipherSuites: si.pairwiseCipherSuites?.map((cipher) => ({
            oui: cipher.oui.toString(),
            suiteType: cipher.suiteType,
        })),
        authenticationCipherSuites: si.authenticationCipherSuites?.map((cipher) => ({
            oui: cipher.oui.toString(),
            suiteType: cipher.suiteType,
        })),
        RSNCapabilities: si.RSNCapabilities,
    };
}


export const toString = (si: SecurityInformation) => {
    let str = '';
    str += `    * Version : ${ si.version }
  * Group cipher suite
    * OUI  : ${ si.groupCipherSuite.oui.toString() }
    * Type : ${ enumKey('GroupCipherSuiteType', si.groupCipherSuite.suiteType) }`;

    si.pairwiseCipherSuites.forEach((pairwiseCipherSuite) => {
        str += `
  * Pairwise cipher suite
    * OUI  : ${ pairwiseCipherSuite.oui.toString() }
    * Type : ${ pairwiseCipherSuite.suiteType }`;
    });

    si.authenticationCipherSuites.forEach((authCipherSuite) => {
        str += `
  * AKM cipher suite
    * OUI  : ${ authCipherSuite.oui.toString() }
    * Type : ${ enumKey('AuthenticationCipherSuiteType', authCipherSuite.suiteType) }`;
    });
    return str;
};