const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Data storage
let amdData = [];
let dataFinal = [];
let ruData = [];

// Load data from JSON files
async function loadData() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        
        // Load amd_final.json
        try {
            const amdContent = await fs.readFile(path.join(inputDir, 'amd_final.json'), 'utf8');
            amdData = JSON.parse(amdContent);
            console.log(`Loaded ${amdData.length} records from amd_final.json`);
        } catch (error) {
            console.warn('Could not load amd_final.json:', error.message);
            amdData = [];
        }

        // Load data_final.json
        try {
            const dataContent = await fs.readFile(path.join(inputDir, 'data_final.json'), 'utf8');
            dataFinal = JSON.parse(dataContent);
            console.log(`Loaded ${dataFinal.length} records from data_final.json`);
        } catch (error) {
            console.warn('Could not load data_final.json:', error.message);
            dataFinal = [];
        }

        // Load ru_final.json
        try {
            const ruContent = await fs.readFile(path.join(inputDir, 'ru_final.json'), 'utf8');
            ruData = ruContent.trim() ? JSON.parse(ruContent) : [];
            console.log(`Loaded ${ruData.length} records from ru_final.json`);
        } catch (error) {
            console.warn('Could not load ru_final.json:', error.message);
            ruData = [];
        }

    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: {
            amd_final: '/amd_final',
            data_final: '/data_final',
            ru_final: '/ru_final'
        }
    });
});

// AMD Final endpoint
app.get('/amd_final', (req, res) => {
    try {
        res.json({
            success: true,
            count: amdData.length,
            data: amdData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Data Final endpoint
app.get('/data_final', (req, res) => {
    try {
        res.json({
            success: true,
            count: dataFinal.length,
            data: dataFinal,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// RU Final endpoint
app.get('/ru_final', (req, res) => {
    try {
        res.json({
            success: true,
            count: ruData.length,
            data: ruData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Data Ingest API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            amd_final: '/amd_final',
            data_final: '/data_final',
            ru_final: '/ru_final'
        },
        documentation: 'Use the endpoints above to access the ingested JSON data'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: ['/health', '/amd_final', '/data_final', '/ru_final']
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
async function startServer() {
    await loadData();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📊 Available endpoints:`);
        console.log(`   - Health check: http://localhost:${PORT}/health`);
        console.log(`   - AMD Final: http://localhost:${PORT}/amd_final`);
        console.log(`   - Data Final: http://localhost:${PORT}/data_final`);
        console.log(`   - RU Final: http://localhost:${PORT}/ru_final`);
        console.log(`📁 Data loaded from input_file/ directory`);
    });
}

startServer().catch(console.error); 