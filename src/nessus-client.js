// This file defines the API client to connect to a Nessus server.
const https = require('https');
const axios = require('axios');
const sprintf = require('sprintf-js').sprintf;

class NessusClient {
    constructor(config) {
        this.config = config;
    }

    async validate() {
        if (!this._validateConfig()) {
            return false;
        }
        // Verify connection
        return await this._verifyConnection();
    }

    async scans() {
        const scansResponse = await this.client.get('/scans')
        return scansResponse.data.scans;
    }

    async scanExport(scanID, format) {
        const endpoint = sprintf('/scans/%d/export', scanID);
        const scanExportResponse = await this.client.post(endpoint, {format: format});
        return scanExportResponse.data;
    }

    async tokenStatus(tokenID) {
        const endpoint = sprintf('/tokens/%s/status', tokenID);
        const tokenStatusResponse = await this.client.get(endpoint);
        return tokenStatusResponse.data;
    }

    async tokenDownload(tokenID) {
        const endpoint = sprintf('/tokens/%s/download', tokenID);
        const tokenDownloadResponse = await this.client.get(endpoint);
        return tokenDownloadResponse.data;
    }

    _createAuthHeader() {
        return { 'X-ApiKeys': sprintf('accessKey=%s; secretKey=%s', this.config.accessKey, this.config.secretKey) };
    }

    async _verifyConnection() {
        let rejectUnauthorized = true;
        if (this.config.insecure === true) {
            rejectUnauthorized = false;
        }
        this.client = axios.create({
            baseURL: this.config.serverURL,
            httpsAgent: new https.Agent({
                rejectUnauthorized: rejectUnauthorized,
            }),
            timeout: 10000,
            headers: this._createAuthHeader(),
        });
        const verResponse = await this.client.get('/server/properties');
        return typeof(verResponse.data.server_version) !== 'undefined' && verResponse.data.server_version.length > 0;
    }

    _validateConfig() {
        const ok = function(v) {
            return typeof(v) !== 'undefined';
        }
        if (!ok(this.config.serverURL)) return false;
        if (this.config.serverURL.substring(0, 5) !== 'https') {
            return false;
        }
        if (this.config.serverURL.slice(-1) == '/') {
            this.config.serverURL = this.config.serverURL.substring(0, this.config.serverURL.length - 2);
        }
        if (!ok(this.config.accessKey)) return false;
        if (!ok(this.config.secretKey)) return false;
        return true
    }
}

export default NessusClient;
