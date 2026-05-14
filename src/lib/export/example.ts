import { exportDataWithTemplate } from './index.js';
import type { ExportConfig } from './types.js';

/**
 * Example usage of the export library
 */

// Simulate a database cursor with 500,000 records
async function* simulateDbCursor() {
  for (let i = 1; i <= 500000; i++) {
    yield {
      id: i,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-05-13T10:30:00Z'),
      updated_at_tz: 'Europe/Rome',
      price: parseFloat((Math.random() * 1000).toFixed(2)),
      price_currency: i % 2 === 0 ? 'EUR' : 'USD',
      tax_rate: parseFloat((0.2 + Math.random() * 0.1).toFixed(2)),
      status: i % 2 === 0 ? 'Active' : 'Inactive'
    };
  }
}

// Configuration for English locale
const configEnGB: ExportConfig = {
  locale: 'en-GB',
  defaultTimezone: 'Europe/London',
  entity: {
    singular: 'Customer',
    plural: 'Customers'
  },
  translations: {
    'report_title': 'Customer Report',
    'col_id': 'ID',
    'col_name': 'Name',
    'col_email': 'Email',
    'col_created_at': 'Created At',
    'col_updated_at': 'Updated At',
    'col_price': 'Price',
    'col_tax_rate': 'Tax Rate',
    'col_status': 'Status'
  },
  fieldMapping: {
    'codice_cliente': 'id',
    'nome_cliente': 'name',
    'email_cliente': 'email',
    'data_creazione': 'created_at',
    'data_aggiornamento': 'updated_at',
    'timezone_aggiornamento': 'updated_at_tz',
    'prezzo': 'price',
    'valuta': 'price_currency',
    'aliquota': 'tax_rate',
    'stato': 'status'
  },
  metadata: {
    fields: {
      id: { type: 'number', precision: 0 },
      name: { type: 'string' },
      email: { type: 'string' },
      created_at: { type: 'date' },
      updated_at: { 
        type: 'datetime',
        precision: 'seconds',
        timezoneField: 'updated_at_tz'
      },
      price: { 
        type: 'currency',
        precision: 2,
        currencyField: 'price_currency'
      },
      tax_rate: { 
        type: 'percentage',
        precision: 2
      },
      status: { type: 'string' }
    }
  },
  data: simulateDbCursor()
};

// Configuration for Italian locale
const configItIT: ExportConfig = {
  locale: 'it-IT',
  defaultTimezone: 'Europe/Rome',
  entity: {
    singular: 'Customer',
    plural: 'Customers'
  },
  translations: {
    'report_title': 'Report Clienti',
    'col_id': 'ID',
    'col_name': 'Nome',
    'col_email': 'Email',
    'col_created_at': 'Creato il',
    'col_updated_at': 'Aggiornato il',
    'col_price': 'Prezzo',
    'col_tax_rate': 'Aliquota',
    'col_status': 'Stato'
  },
  fieldMapping: {
    'codice_cliente': 'id',
    'nome_cliente': 'name',
    'email_cliente': 'email',
    'data_creazione': 'created_at',
    'data_aggiornamento': 'updated_at',
    'timezone_aggiornamento': 'updated_at_tz',
    'prezzo': 'price',
    'valuta': 'price_currency',
    'aliquota': 'tax_rate',
    'stato': 'status'
  },
  metadata: {
    fields: {
      id: { type: 'number', precision: 0 },
      name: { type: 'string' },
      email: { type: 'string' },
      created_at: { type: 'date' },
      updated_at: { 
        type: 'datetime',
        precision: 'seconds',
        timezoneField: 'updated_at_tz'
      },
      price: { 
        type: 'currency',
        precision: 2,
        currencyField: 'price_currency'
      },
      tax_rate: { 
        type: 'percentage',
        precision: 2
      },
      status: { type: 'string' }
    }
  },
  data: simulateDbCursor()
};

// Run the export
async function run() {
  console.time('Export time');
  
  try {
    await exportDataWithTemplate(
      './template.xlsx',
      {
        excelOutputPath: './output_en.xlsx',
        csvOutputPath: './output_en.csv'
      },
      configEnGB
    );
    console.log('✓ Export completed (en-GB)');
    
    await exportDataWithTemplate(
      './template.xlsx',
      {
        excelOutputPath: './output_it.xlsx',
        csvOutputPath: './output_it.csv'
      },
      configItIT
    );
    console.log('✓ Export completed (it-IT)');
    
  } catch (error) {
    console.error('Export error:', error);
  }
  
  console.timeEnd('Export time');
}

// Uncomment to run the example
// run();
