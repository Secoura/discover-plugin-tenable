// This file is responsible for creating output that can be read by Discover.

// Define a custom line breaker so that Discover knows that a single event is complete.
const LINE_BREAKER = '--DISCOVER_END_OF_EVENT--\r\n';

function outputToStdout(data) {
    for (const d of data) {
        const jsonLine = JSON.stringify(d);
        console.log(jsonLine + LINE_BREAKER);
    }
}

export {
    outputToStdout
};
