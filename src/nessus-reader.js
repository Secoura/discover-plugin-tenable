const parseString = require('xml2js').parseString;

import {SeverityToString} from "./lookup";

// This class reads Nessus data.
class NessusReader {
    constructor(data) {
        this.data = data;
    }

    parse() {
        return new Promise((resolve, reject) => {
            parseString(this.data, (err, res) => {
                if (err != null) {
                    reject(err);
                }
                resolve(this._parse(res));
            })
        })
    }

    _validate(results) {
        return (typeof(results['NessusClientData_v2']) !== 'undefined' && typeof(results['NessusClientData_v2']['Report']) !== 'undefined');
    }

    _extractTag(tagName, hostProperties) {
        // Find tag object in HostProperties
        for (const obj of hostProperties) {
            if (typeof(obj['tag']) !== 'undefined') {
                for (const tag of obj.tag) {
                    const name = this._extractProperty('name', tag)
                    if (name == tagName) {
                        return tag['_'];
                    }
                }
            }
        }
        return null
    }

    _extractProperty(keyName, obj) {
        const properties = obj['$'];
        for (const [key, value] of Object.entries(properties)) {
            if (key == keyName) {
                return value;
            }
        }
    }

    _parse(results) {
        if (!this._validate(results)) {
            console.log('Malformed report, could not read.');
            return
        }

        let data = [];

        for (const report of results.NessusClientData_v2.Report) {
            for (const host of report.ReportHost) {
                const hostStart = this._extractTag('HOST_START', host.HostProperties);
                const hostEnd = this._extractTag('HOST_END', host.HostProperties);
                const macAddress = this._extractTag('mac-address', host.HostProperties);
                const operatingSystem = this._extractTag('operating-system', host.HostProperties);
                const netBIOSName = this._extractTag('netbios-name', host.HostProperties);
                const hostFQDN = this._extractTag('host-fqdn', host.HostProperties);
                const hostIP = this._extractTag('host-ip', host.HostProperties);

                // Iterate the report items
                for (const item of host.ReportItem) {
                    const serviceName = this._extractProperty('svc_name', item);
                    const protocol = this._extractProperty('protocol', item);
                    const port = this._extractProperty('port', item);
                    const severityID = this._extractProperty('severity', item);
                    const pluginID = this._extractProperty('pluginID', item);
                    const pluginName = this._extractProperty('pluginName', item);
                    const pluginOutput = item.plugin_output;

                    const cvss3BaseScore = item.cvss3_base_score;
                    const cvss3TemporalScore = item.cvss3_temporal_score;
                    const cvss3TemporalVector = item.cvss3_temporal_vector;
                    const cvss3Vector = item.cvss3_vector;

                    const cvssBaseScore = item.cvss_base_score;
                    const cvssTemporalScore = item.cvss_temporal_score;
                    const cvssTemporalVector = item.cvss_temporal_vector;
                    const cvssVector = item.cvss_vector;

                    const bugtraqID = item.bid;
                    const cveID = item.cve;
                    const osvdbID = item.osvdb;
                    const xrefID = item.xref;

                    // Create data object
                    let dataObject = {
                        "start_time": hostStart,
                        "end_time": hostEnd,

                        "severity_id": parseInt(severityID),
                        "severity": SeverityToString(severityID),
                        "plugin_id": parseInt(pluginID),
                        "plugin_name": pluginName,
                        "plugin_output": pluginOutput,

                        "bid": bugtraqID,
                        "cve": cveID,
                        "osvdb": osvdbID,
                        "xref": xrefID,

                        "cvss_base_score": cvssBaseScore,
                        "cvss_vector": cvssVector,
                        "cvss_temporal_score": cvssTemporalScore,
                        "cvss_temporal_vector": cvssTemporalVector,
                        "cvss3_base_score": cvss3BaseScore,
                        "cvss3_vector": cvss3Vector,
                        "cvss3_temporal_score": cvss3TemporalScore,
                        "cvss3_temporal_vector": cvss3TemporalVector,

                        "dest_ip": hostIP,
                        "dest_fqdn": hostFQDN,
                        "dest_mac": macAddress,
                        "dest_os": operatingSystem,
                        "dest_netbios_name": netBIOSName,
                        "dest_protocol": protocol,
                        "dest_port": parseInt(port),
                        "dest_service": serviceName,
                    };

                    // Filter out all the keys that have no data
                    Object.keys(dataObject).forEach((key) => (dataObject[key] == null) && delete dataObject[key]);

                    // Append to data list
                    data.push(dataObject);
                }
            }
        }
        return data;
    }
}

export default NessusReader;
