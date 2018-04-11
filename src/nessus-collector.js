// Dependencies
const fs = require('fs');
const delay = require('delay');
const program = require('commander');

// Configuration
import config from './config';
import { outputToStdout } from "./output";

import NessusReader from './nessus-reader';
import NessusClient from './nessus-client';

// The entry point.
async function main(program) {
    if (typeof(program.file) !== 'undefined') {
        // Check file exists
        let realPath;
        try {
            realPath = fs.realpathSync(program.file);
        } catch (e) {
            console.log('Could not read file "%s".', program.file);
            process.exit(1);
        }
        const data = fs.readFileSync(realPath, 'utf8');
        const reader = new NessusReader(data);
        const reportData = await reader.parse();
        outputToStdout(reportData);
    } else {
        // Check configuration was passed
        if (config == null) {
            console.log("Failed to read configuration for Nessus. Confirm that configuration is being passed via PLUGIN_CONFIG!");
            process.exit(1);
        }
        const client = new NessusClient(config);
        const valid = await client.validate();
        if (!valid) {
            console.log("Malformed configuration, please check the configuration!");
            process.exit(1);
        }

        // Get list of scans
        const scans = await client.scans();
        for (const scan of scans) {
            // Request scan export
            const scanReport = await client.scanExport(scan.id, 'nessus');

            let exportStatus = null;
            while (exportStatus == null || exportStatus.status !== 'ready') {
                exportStatus = await delay(100)
                    .then(() => {
                        return client.tokenStatus(scanReport.token);
                    });
            }

            // Retrieve the attachment
            const exportDownload = await client.tokenDownload(scanReport.token);

            // Parse it using the reader
            const reader = new NessusReader(exportDownload);
            const reportData = await reader.parse();
            outputToStdout(reportData);
        }
    }
}

// Create CLI command
program
    .version('0.1.0')
    .option('-f, --file <path>', 'Read Nessus report from file')
    .option('-e, --env', 'Read Nessus reports from server defined in environment variable')
    .parse(process.argv);

// Validate that at least one option was called
if (typeof(program.file) === 'undefined' && typeof(program.env) === 'undefined') {
    console.log("Please specify -f <path> or -e to load data.");
    process.exit(1);
}

// Validate that only one option was called
if (typeof(program.file) !== 'undefined' && typeof(program.env) !== 'undefined') {
    console.log("Please only call one option, either -f or -e.")
    process.exit(1);
}

// Call the main function.
main(program);
