#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';

const endpoints = [
    '/',
    '/health',
    '/amd_final',
    '/data_final',
    '/ru_final'
];

async function testEndpoint(endpoint) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${BASE_URL}${endpoint}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        endpoint,
                        status: res.statusCode,
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        data: jsonData
                    });
                } catch (error) {
                    reject({
                        endpoint,
                        status: res.statusCode,
                        error: 'Invalid JSON response',
                        rawData: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject({
                endpoint,
                error: error.message
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject({
                endpoint,
                error: 'Request timeout'
            });
        });
    });
}

async function runTests() {
    console.log('🧪 Testing Data Ingest API...\n');
    
    for (const endpoint of endpoints) {
        try {
            const result = await testEndpoint(endpoint);
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${endpoint} (${result.status})`);
            
            if (result.data && result.data.count !== undefined) {
                console.log(`   📊 Records: ${result.data.count}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint} - ${error.error}`);
        }
    }
    
    console.log('\n🎉 Test completed!');
}

// Check if server is running
testEndpoint('/health')
    .then(() => {
        console.log('🚀 Server is running, starting tests...\n');
        return runTests();
    })
    .catch((error) => {
        console.log('❌ Server is not running. Please start the server first:');
        console.log('   npm start');
        process.exit(1);
    }); 