const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeDatabase, getAllRecords, getRecordCount, searchRecords } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false, // Set to true if you need cookies/authentication
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const amdCount = await getRecordCount('amd_final');
        const dataCount = await getRecordCount('data_final');
        const ruCount = await getRecordCount('ru_final');
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'PostgreSQL',
            record_counts: {
                amd_final: amdCount,
                data_final: dataCount,
                ru_final: ruCount
            },
            endpoints: {
                amd_final: '/amd_final',
                data_final: '/data_final',
                ru_final: '/ru_final',
                search: '/search/:table/:term'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            error: error.message
        });
    }
});

// AMD Final endpoint
app.get('/amd_final', async (req, res) => {
    try {
        const records = await getAllRecords('amd_final');
        const count = await getRecordCount('amd_final');
        
        res.json({
            success: true,
            count: count,
            data: records.map(record => ({
                id: record.id,
                data: record.data,
                created_at: record.created_at,
                updated_at: record.updated_at
            })),
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
app.get('/data_final', async (req, res) => {
    try {
        const records = await getAllRecords('data_final');
        const count = await getRecordCount('data_final');
        
        res.json({
            success: true,
            count: count,
            data: records.map(record => ({
                id: record.id,
                data: record.data,
                created_at: record.created_at,
                updated_at: record.updated_at
            })),
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
app.get('/ru_final', async (req, res) => {
    try {
        const records = await getAllRecords('ru_final');
        const count = await getRecordCount('ru_final');
        
        res.json({
            success: true,
            count: count,
            data: records.map(record => ({
                id: record.id,
                data: record.data,
                created_at: record.created_at,
                updated_at: record.updated_at
            })),
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

// Search endpoint
app.get('/search/:table/:term', async (req, res) => {
    try {
        const { table, term } = req.params;
        
        // Validate table name
        const validTables = ['amd_final', 'data_final', 'ru_final'];
        if (!validTables.includes(table)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid table name',
                valid_tables: validTables
            });
        }
        
        const records = await searchRecords(table, term);
        
        res.json({
            success: true,
            table: table,
            search_term: term,
            count: records.length,
            data: records.map(record => ({
                id: record.id,
                data: record.data,
                created_at: record.created_at,
                updated_at: record.updated_at
            })),
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
        message: 'Data Ingest API with PostgreSQL',
        version: '2.0.0',
        database: 'PostgreSQL',
        endpoints: {
            health: '/health',
            amd_final: '/amd_final',
            data_final: '/data_final',
            ru_final: '/ru_final',
            search: '/search/:table/:term'
        },
        documentation: 'Use the endpoints above to access the ingested JSON data from PostgreSQL database'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: ['/health', '/amd_final', '/data_final', '/ru_final', '/search/:table/:term']
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
    try {
        // Initialize database and load data
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📊 Available endpoints:`);
            console.log(`   - Health check: http://localhost:${PORT}/health`);
            console.log(`   - AMD Final: http://localhost:${PORT}/amd_final`);
            console.log(`   - Data Final: http://localhost:${PORT}/data_final`);
            console.log(`   - RU Final: http://localhost:${PORT}/ru_final`);
            console.log(`   - Search: http://localhost:${PORT}/search/:table/:term`);
            console.log(`🗄️  PostgreSQL database connected`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer().catch(console.error); 