const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeDatabase, getAllRecords, getRecordCount, searchRecords, queryWithFilters } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to parse JSON array from query parameter
function parseArrayParam(param) {
    if (!param) return param;
    
    // If it's already an array, return it
    if (Array.isArray(param)) return param;
    
    // Try to parse as JSON array
    try {
        const parsed = JSON.parse(param);
        return Array.isArray(parsed) ? parsed : param;
    } catch (error) {
        // If JSON parsing fails, treat as single value
        return param;
    }
}

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
        const chargeCount = await getRecordCount('consolidated_charge');
        const rateCount = await getRecordCount('consolidated_rate');
        const volumeCount = await getRecordCount('consolidated_volume');
        const calendarDictCount = await getRecordCount('calendar_dict');
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'PostgreSQL',
            record_counts: {
                consolidated_charge: chargeCount,
                consolidated_rate: rateCount,
                consolidated_volume: volumeCount,
                calendar_dict: calendarDictCount
            },
            endpoints: {
                consolidated_charge: '/consolidated_charge',
                consolidated_rate: '/consolidated_rate',
                consolidated_volume: '/consolidated_volume',
                calendar_dict: '/calendar_dict',
                ingestion_volume: '/ingestion_volume',
                ingestion_charge: '/ingestion_charge',
                ingestion_rate: '/ingestion_rate',
                annual_charge: '/annual_charge',
                index_consolidated_rus: '/index_consolidated_rus',
                index_consolidated_amd: '/index_consolidated_amd',
                index_ingestion_amd: '/index_ingestion_amd',
                index_ingestion_rus: '/index_ingestion_rus',
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

// Consolidated Charge endpoint
app.get('/consolidated_charge', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, ru_service_cat, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            ru_service_cat: parseArrayParam(ru_service_cat),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('consolidated_charge', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Consolidated Rate endpoint
app.get('/consolidated_rate', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, ru_service_cat, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            ru_service_cat: parseArrayParam(ru_service_cat),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('consolidated_rate', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Consolidated Volume endpoint
app.get('/consolidated_volume', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, ru_service_cat, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            ru_service_cat: parseArrayParam(ru_service_cat),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('consolidated_volume', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Calendar Dict endpoint
app.get('/calendar_dict', async (req, res) => {
    try {
        const { contract_month, contract_year, calendar_month, calendar_year, created_from, created_to, updated_from, updated_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            contract_month,
            contract_year,
            calendar_month: parseArrayParam(calendar_month),
            calendar_year,
            created_from,
            created_to,
            updated_from,
            updated_to
        };
        const { count, rows } = await queryWithFilters('calendar_dict', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Ingestion Volume endpoint
app.get('/ingestion_volume', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('ingestion_volume', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Ingestion Charge endpoint
app.get('/ingestion_charge', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('ingestion_charge', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Ingestion Rate endpoint
app.get('/ingestion_rate', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('ingestion_rate', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Annual Charge endpoint
app.get('/annual_charge', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('annual_charge', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Index Consolidated RUS endpoint
app.get('/index_consolidated_rus', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('index_consolidated_rus', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Index Consolidated AMD endpoint
app.get('/index_consolidated_amd', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('index_consolidated_amd', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Index Ingestion AMD endpoint
app.get('/index_ingestion_amd', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('index_ingestion_amd', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});

// Index Ingestion RUS endpoint
app.get('/index_ingestion_rus', async (req, res) => {
    try {
        const { amd_num, ru, ru_status, created_from, created_to, updated_from, updated_to, last_sign_date, last_sign_date_from, last_sign_date_to, limit, offset, order_by, order_dir } = req.query;
        const filters = {
            amd_num,
            ru: parseArrayParam(ru),
            ru_status: parseArrayParam(ru_status),
            created_from,
            created_to,
            updated_from,
            updated_to,
            last_sign_date,
            last_sign_date_from,
            last_sign_date_to
        };
        const { count, rows } = await queryWithFilters('index_ingestion_rus', filters, { limit, offset, order_by, order_dir });
        res.json({ success: true, count, data: rows, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
});
// Search endpoint
app.get('/search/:table/:term', async (req, res) => {
    try {
        const { table, term } = req.params;
        
        // Validate table name
        const validTables = ['consolidated_charge', 'consolidated_rate', 'consolidated_volume', 'calendar_dict', 'ingestion_volume', 'ingestion_charge', 'ingestion_rate', 'annual_charge', 'index_consolidated_rus', 'index_consolidated_amd', 'index_ingestion_amd', 'index_ingestion_rus'];
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
        message: 'Data Ingest API with PostgreSQL - Consolidated Schema',
        version: '3.0.0',
        database: 'PostgreSQL',
        endpoints: {
            health: '/health',
            consolidated_charge: '/consolidated_charge',
            consolidated_rate: '/consolidated_rate',
            consolidated_volume: '/consolidated_volume',
            calendar_dict: '/calendar_dict',
            index_consolidated_rus: '/index_consolidated_rus',
            index_consolidated_amd: '/index_consolidated_amd',
            index_ingestion_amd: '/index_ingestion_amd',
            index_ingestion_rus: '/index_ingestion_rus',
            search: '/search/:table/:term'
        },
        documentation: 'Use the endpoints above to access the consolidated JSON data from PostgreSQL database'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: ['/health', '/consolidated_charge', '/consolidated_rate', '/consolidated_volume', '/calendar_dict', '/index_consolidated_rus', '/index_consolidated_amd', '/index_ingestion_amd', '/index_ingestion_rus', '/search/:table/:term']
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
            console.log(`   - Consolidated Charge: http://localhost:${PORT}/consolidated_charge`);
            console.log(`   - Consolidated Rate: http://localhost:${PORT}/consolidated_rate`);
            console.log(`   - Consolidated Volume: http://localhost:${PORT}/consolidated_volume`);
            console.log(`   - Calendar Dict: http://localhost:${PORT}/calendar_dict`);
        console.log(`   - Ingestion Volume: http://localhost:${PORT}/ingestion_volume`);
        console.log(`   - Ingestion Charge: http://localhost:${PORT}/ingestion_charge`);
        console.log(`   - Ingestion Rate: http://localhost:${PORT}/ingestion_rate`);
        console.log(`   - Annual Charge: http://localhost:${PORT}/annual_charge`);
        console.log(`   - Index Consolidated RUS: http://localhost:${PORT}/index_consolidated_rus`);
        console.log(`   - Index Consolidated AMD: http://localhost:${PORT}/index_consolidated_amd`);
        console.log(`   - Index Ingestion AMD: http://localhost:${PORT}/index_ingestion_amd`);
        console.log(`   - Index Ingestion RUS: http://localhost:${PORT}/index_ingestion_rus`);
        console.log(`   - Search: http://localhost:${PORT}/search/:table/:term`);
            console.log(`🗄️  PostgreSQL database connected`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer().catch(console.error); 